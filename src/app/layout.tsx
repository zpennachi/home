import type { Metadata } from 'next'
import { Inter, Instrument_Sans, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/work/ThemeProvider'
import { DynamicStyles } from '@/components/work/DynamicStyles'
import Script from 'next/script'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrumentSans.variable} ${outfit.variable} ${jetbrainsMono.variable} font-mono antialiased`}>
        <DynamicStyles />
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* Load Google's model-viewer script dynamically only for mobile AR capabilities */}
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
