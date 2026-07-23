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
      </head>
      <body>{children}</body>
    </html>
  )
}
