import type { Metadata } from 'next'
import { Inter, Instrument_Sans, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/work/ThemeProvider'
import { DynamicStyles } from '@/components/work/DynamicStyles'
import Script from 'next/script'
import { AudioPlayerProvider } from '@/components/archive/AudioPlayerProvider'

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} ${instrumentSans.variable} ${outfit.variable} ${jetbrainsMono.variable} font-mono antialiased`}>
        <DynamicStyles />
        <ThemeProvider>
          <AudioPlayerProvider>
            {children}
          </AudioPlayerProvider>
        </ThemeProvider>
        {/* Load Google's model-viewer script dynamically only for mobile AR capabilities */}
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
        {/* Register PWA Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}) }`}
        </Script>
      </body>
    </html>
  )
}
