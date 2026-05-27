import type { Metadata } from 'next'
import { Inter, Instrument_Sans, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/work/ThemeProvider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ZPennachi — Design Engineer',
  description: 'Portfolio of ZPennachi, a Design Engineer focused on emotional density and performance.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let customCss = '';

  try {
    const supabase = await createClient()
    const { data: dbData } = await supabase
        .from('design_tokens')
        .select('*')

    if (dbData && dbData.length > 0) {
        const lightTokens = dbData.find(d => d.id === 'light')?.tokens || {}
        const darkTokens = dbData.find(d => d.id === 'dark')?.tokens || {}

        const serialize = (tokens: Record<string, string>) =>
            Object.entries(tokens)
                .map(([k, v]) => `  ${k}: ${v};`)
                .join('\n');

        if (Object.keys(lightTokens).length > 0) {
            customCss += `:root {\n${serialize(lightTokens)}\n}\n`;
        }
        if (Object.keys(darkTokens).length > 0) {
            customCss += `.dark {\n${serialize(darkTokens)}\n}\n`;
        }
    }
  } catch (err) {
    console.error('[RootLayout] Failed to retrieve runtime design tokens:', err);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {customCss && (
          <style id="runtime-design-tokens" dangerouslySetInnerHTML={{ __html: customCss }} />
        )}
      </head>
      <body className={`${inter.variable} ${instrumentSans.variable} ${outfit.variable} ${jetbrainsMono.variable} font-mono antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
