import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NukeRC Dashboard',
  description: 'Personal start-page dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://t0.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://t0.gstatic.com" />

        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon/favicon-48x48.png" />
        <link rel="manifest" href="/favicon/manifest.webmanifest" crossOrigin="use-credentials" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#fff" />
        <meta name="application-name" content="NukeRC" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NukeRC" />
      </head>
      <body>{children}</body>
    </html>
  )
}
