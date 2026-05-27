'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const GLOBALS_CSS_PATH = path.join(process.cwd(), 'src/app/globals.css')

export async function getDesignTokens() {
    // 1. Fetch from Supabase database first (Primary state store)
    try {
        const supabase = await createClient()
        const { data: dbData } = await supabase
            .from('design_tokens')
            .select('*')

        if (dbData && dbData.length > 0) {
            const lightTokens = dbData.find(d => d.id === 'light')?.tokens || {}
            const darkTokens = dbData.find(d => d.id === 'dark')?.tokens || {}

            // If we have saved design variables in the DB, prioritize them
            if (Object.keys(lightTokens).length > 0 || Object.keys(darkTokens).length > 0) {
                return {
                    light: lightTokens,
                    dark: darkTokens
                }
            }
        }
    } catch (dbErr) {
        console.error('[DesignSystem] Supabase fetch error, falling back to CSS:', dbErr)
    }

    // 2. Local Fallback: Parse variables from globals.css
    try {
        const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8')

        // Match :root block and .dark block
        const rootMatch = css.match(/:root\s*{([^}]*)}/)
        const darkMatch = css.match(/\.dark\s*{([^}]*)}/)

        const extractTokens = (content: string) => {
            const tokens: Record<string, string> = {}
            const lines = content.split('\n')
            lines.forEach(line => {
                const match = line.match(/^\s*(--[\w-]+):\s*([^;!]+)/)
                if (match) {
                    tokens[match[1]] = match[2].trim()
                }
            })
            return tokens
        }

        return {
            light: rootMatch ? extractTokens(rootMatch[1]) : {},
            dark: darkMatch ? extractTokens(darkMatch[1]) : {}
        }
    } catch (error) {
        console.error('Failed to read design tokens:', error)
        return { light: {}, dark: {} }
    }
}

export async function saveDesignTokens(tokens: Record<string, string>, mode: 'light' | 'dark' = 'light') {
    console.log(`[DesignSystem] Saving ${mode} tokens:`, tokens)

    // 1. Persist in Supabase database (Universal compatibility for dev & prod serverless environments)
    try {
        const supabase = await createClient()
        const { error: dbError } = await supabase
            .from('design_tokens')
            .upsert({
                id: mode,
                tokens,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (dbError) {
            console.error('[DesignSystem] Supabase upsert failed:', dbError)
            return { success: false, error: `Database save failed: ${dbError.message}` }
        }
        console.log(`[DesignSystem] Upserted ${mode} tokens to Supabase.`)
    } catch (dbErr: any) {
        console.error('[DesignSystem] Supabase connect failed:', dbErr)
        return { success: false, error: `Supabase connect failed: ${dbErr.message || dbErr}` }
    }

    // 2. Try persisting locally to globals.css (Ensures local git-tracking of updates in development)
    try {
        let css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8')
        css = css.replace(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);\s*/g, '')

        const selector = mode === 'light' ? ':root' : '.dark'
        const selectorIndex = css.indexOf(selector)
        if (selectorIndex !== -1) {
            const blockStart = css.indexOf('{', selectorIndex)
            const blockEnd = css.indexOf('}', blockStart)

            if (blockStart !== -1 && blockEnd !== -1) {
                let blockContent = css.substring(blockStart + 1, blockEnd)

                Object.entries(tokens).forEach(([key, value]) => {
                    const propRegex = new RegExp(`(\\s*${key}\\s*:\\s*)([^;]+)(;)`)
                    if (propRegex.test(blockContent)) {
                        blockContent = blockContent.replace(propRegex, `$1${value}$3`)
                    } else {
                        blockContent += `\n  ${key}: ${value};`
                    }
                })

                const newCss = css.substring(0, blockStart + 1) + blockContent + css.substring(blockEnd)
                fs.writeFileSync(GLOBALS_CSS_PATH, newCss)
                console.log(`[DesignSystem] Local globals.css synced successfully.`)
            }
        }
    } catch (fsError: any) {
        // Log warnings for read-only environments (expected on Vercel production) instead of crashing
        console.warn(`[DesignSystem] Local file write skipped (expected on Vercel/serverless): ${fsError.message}`)
    }

    revalidatePath('/new', 'layout')
    return { success: true }
}
