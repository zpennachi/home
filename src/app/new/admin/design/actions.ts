'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const GLOBALS_CSS_PATH = path.join(process.cwd(), 'src/app/globals.css')

export async function getDesignTokens() {
    try {
        const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8')

        // Match :root block and .dark block
        const rootMatch = css.match(/:root\s*{([^}]*)}/)
        const darkMatch = css.match(/\.dark\s*{([^}]*)}/)

        const extractTokens = (content: string) => {
            const tokens: Record<string, string> = {}
            const lines = content.split('\n')
            lines.forEach(line => {
                // More robust match for --key: value; (ignoring comments)
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
    try {
        let css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8')

        // 1. Clean existing Google Font imports (Site-wide cleanup)
        css = css.replace(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);\s*/g, '')

        // 2. Google Font Injection logic - DECOMMISSIONED (Now handled via next/font/google in layout.tsx)
        /*
        const fontSans = tokens['--font-sans']
        if (fontSans && !fontSans.startsWith('var(')) {
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontSans.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`
            const importLine = `@import url('${fontUrl}');\n`
            css = importLine + css
        }
        */

        const selector = mode === 'light' ? ':root' : '.dark'
        const selectorIndex = css.indexOf(selector)
        if (selectorIndex === -1) {
            return { success: false, error: `${selector} not found` }
        }

        const blockStart = css.indexOf('{', selectorIndex)
        const blockEnd = css.indexOf('}', blockStart)

        if (blockStart === -1 || blockEnd === -1) {
            return { success: false, error: 'Invalid block structure' }
        }

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

        console.log(`[DesignSystem] Write successful to ${GLOBALS_CSS_PATH}`)
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('[DesignSystem] Save error:', error)
        return { success: false, error: 'File system write failed' }
    }
}
