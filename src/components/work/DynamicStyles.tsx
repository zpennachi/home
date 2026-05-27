'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DynamicStyles() {
    const [css, setCss] = useState('')

    useEffect(() => {
        async function loadTokens() {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL
                // If url or key are placeholders, don't attempt to fetch
                if (!url || url.includes('placeholder.supabase.co')) {
                    return
                }

                const supabase = createClient()
                const { data } = await supabase
                    .from('design_tokens')
                    .select('*')

                if (data && data.length > 0) {
                    const lightTokens = data.find(d => d.id === 'light')?.tokens || {}
                    const darkTokens = data.find(d => d.id === 'dark')?.tokens || {}

                    const serialize = (tokens: Record<string, string>) =>
                        Object.entries(tokens)
                            .map(([k, v]) => `  ${k}: ${v};`)
                            .join('\n');

                    let customCss = '';
                    if (Object.keys(lightTokens).length > 0) {
                        customCss += `:root {\n${serialize(lightTokens)}\n}\n`;
                    }
                    if (Object.keys(darkTokens).length > 0) {
                        customCss += `.dark {\n${serialize(darkTokens)}\n}\n`;
                    }

                    if (customCss) {
                        setCss(customCss)
                    }
                }
            } catch (err) {
                console.error('[DynamicStyles] Failed to load tokens on client:', err)
            }
        }

        loadTokens()
    }, [])

    if (!css) return null

    return <style id="runtime-design-tokens" dangerouslySetInnerHTML={{ __html: css }} />
}
