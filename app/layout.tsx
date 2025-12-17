import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kostenloser UTM Builder - UTM-Links erstellen | CampKit',
  description: 'Erstelle UTM-Links für Google Analytics in Sekunden. Kostenloser UTM Builder mit Vorlagen, Validierung und Export. Perfekt für Marketing-Kampagnen.',
  keywords: 'utm builder, utm generator, utm link erstellen, utm parameter, google analytics utm, kampagnen tracking',
  authors: [{ name: 'CampKit' }],
  openGraph: {
    title: 'Kostenloser UTM Builder - UTM-Links erstellen',
    description: 'Erstelle UTM-Links für Google Analytics in Sekunden. Kostenloser UTM Builder mit Vorlagen und Export.',
    url: 'https://utmbuilder.getcampkit.com',
    siteName: 'UTM Builder by CampKit',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kostenloser UTM Builder',
    description: 'Erstelle UTM-Links für Google Analytics in Sekunden.',
  },
  alternates: {
    canonical: 'https://utmbuilder.getcampkit.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "UTM Builder",
              "description": "Kostenloser UTM Link Builder für Google Analytics",
              "url": "https://utmbuilder.getcampkit.com",
              "applicationCategory": "MarketingApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "author": {
                "@type": "Organization",
                "name": "CampKit",
                "url": "https://getcampkit.com"
              }
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
