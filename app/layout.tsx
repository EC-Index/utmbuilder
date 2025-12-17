import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free UTM Builder - Create UTM Links | CampKit',
  description: 'Create UTM links for Google Analytics in seconds. Free UTM builder with templates, validation and export. Perfect for marketing campaigns.',
  keywords: 'utm builder, utm generator, utm link creator, utm parameters, google analytics utm, campaign tracking',
  authors: [{ name: 'CampKit' }],
  openGraph: {
    title: 'Free UTM Builder - Create UTM Links',
    description: 'Create UTM links for Google Analytics in seconds. Free UTM builder with templates and export.',
    url: 'https://utmbuilder.getcampkit.com',
    siteName: 'UTM Builder by CampKit',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free UTM Builder',
    description: 'Create UTM links for Google Analytics in seconds.',
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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "UTM Builder",
              "description": "Free UTM Link Builder for Google Analytics",
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
