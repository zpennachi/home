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

    useEffect(() => {
        const fontSans = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim().replace(/['"]/g, '')
        if (fontSans && !fontSans.startsWith('var(')) {
            const fontId = `google-font-global-${fontSans.replace(/\s+/g, '-').toLowerCase()}`;
            if (!document.getElementById(fontId)) {
                const link = document.createElement('link');
                link.id = fontId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${fontSans.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
                document.head.appendChild(link);
            }
        }
    }, [css])

    if (!css) {
        // Render a dummy element to ensure the component stays mounted and active for global font updates
        return <div style={{ display: 'none' }} id="dynamic-styles-loader-active" />;
    }

    return <style id="runtime-design-tokens" dangerouslySetInnerHTML={{ __html: css }} />
}
