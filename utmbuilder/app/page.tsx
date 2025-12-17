'use client'

import { useState, useEffect } from 'react'

interface UTMParams {
  url: string
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

interface HistoryItem {
  url: string
  timestamp: number
}

const templates = [
  { name: 'Google Ads', source: 'google', medium: 'cpc', campaign: '' },
  { name: 'Facebook Ads', source: 'facebook', medium: 'paid_social', campaign: '' },
  { name: 'Instagram', source: 'instagram', medium: 'social', campaign: '' },
  { name: 'Newsletter', source: 'newsletter', medium: 'email', campaign: '' },
  { name: 'LinkedIn', source: 'linkedin', medium: 'social', campaign: '' },
  { name: 'Twitter/X', source: 'twitter', medium: 'social', campaign: '' },
  { name: 'TikTok Ads', source: 'tiktok', medium: 'paid_social', campaign: '' },
  { name: 'Affiliate', source: 'affiliate', medium: 'referral', campaign: '' },
]

export default function Home() {
  const [params, setParams] = useState<UTMParams>({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  })
  const [errors, setErrors] = useState<Partial<UTMParams>>({})
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('utm-history')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const validateUrl = (url: string): boolean => {
    if (!url) return false
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const sanitizeParam = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
  }

  const handleChange = (field: keyof UTMParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const applyTemplate = (template: typeof templates[0]) => {
    setParams(prev => ({
      ...prev,
      source: template.source,
      medium: template.medium,
    }))
    toast(`${template.name} Template angewendet`)
  }

  const generateUrl = () => {
    const newErrors: Partial<UTMParams> = {}

    if (!params.url) {
      newErrors.url = 'URL ist erforderlich'
    } else if (!validateUrl(params.url)) {
      newErrors.url = 'Bitte gib eine gültige URL ein'
    }

    if (!params.source) {
      newErrors.source = 'Source ist erforderlich'
    }

    if (!params.medium) {
      newErrors.medium = 'Medium ist erforderlich'
    }

    if (!params.campaign) {
      newErrors.campaign = 'Campaign ist erforderlich'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    let baseUrl = params.url
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl
    }

    const url = new URL(baseUrl)
    url.searchParams.set('utm_source', sanitizeParam(params.source))
    url.searchParams.set('utm_medium', sanitizeParam(params.medium))
    url.searchParams.set('utm_campaign', sanitizeParam(params.campaign))

    if (params.term) {
      url.searchParams.set('utm_term', sanitizeParam(params.term))
    }
    if (params.content) {
      url.searchParams.set('utm_content', sanitizeParam(params.content))
    }

    const finalUrl = url.toString()
    setGeneratedUrl(finalUrl)

    // Save to history
    const newHistory = [
      { url: finalUrl, timestamp: Date.now() },
      ...history.filter(h => h.url !== finalUrl).slice(0, 9)
    ]
    setHistory(newHistory)
    localStorage.setItem('utm-history', JSON.stringify(newHistory))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      toast('URL kopiert!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Kopieren fehlgeschlagen')
    }
  }

  const toast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const clearForm = () => {
    setParams({
      url: '',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
    })
    setGeneratedUrl('')
    setErrors({})
  }

  const loadFromHistory = (url: string) => {
    try {
      const parsed = new URL(url)
      setParams({
        url: parsed.origin + parsed.pathname,
        source: parsed.searchParams.get('utm_source') || '',
        medium: parsed.searchParams.get('utm_medium') || '',
        campaign: parsed.searchParams.get('utm_campaign') || '',
        term: parsed.searchParams.get('utm_term') || '',
        content: parsed.searchParams.get('utm_content') || '',
      })
      setGeneratedUrl(url)
      toast('URL aus Verlauf geladen')
    } catch {
      toast('Fehler beim Laden')
    }
  }

  const exportHistory = () => {
    const csv = [
      'URL,Source,Medium,Campaign,Term,Content,Timestamp',
      ...history.map(h => {
        try {
          const parsed = new URL(h.url)
          return `"${h.url}","${parsed.searchParams.get('utm_source')}","${parsed.searchParams.get('utm_medium')}","${parsed.searchParams.get('utm_campaign')}","${parsed.searchParams.get('utm_term') || ''}","${parsed.searchParams.get('utm_content') || ''}","${new Date(h.timestamp).toISOString()}"`
        } catch {
          return ''
        }
      }).filter(Boolean)
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'utm-links.csv'
    a.click()
    toast('CSV exportiert!')
  }

  return (
    <main className="container">
      {/* Header */}
      <header className="header">
        <a href="https://getcampkit.com" className="logo" target="_blank" rel="noopener">
          <svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 4l8 4-8 4-8-4 8-4zM6 11.5l8 4v9l-8-4v-9zm20 0v9l-8 4v-9l8-4z"/>
          </svg>
          CampKit
        </a>
        <h1>UTM Builder</h1>
        <p>Erstelle UTM-Links für Google Analytics – kostenlos</p>
      </header>

      {/* Templates */}
      <section className="templates-section">
        <h3>🚀 Schnellstart-Templates</h3>
        <div className="templates-grid">
          {templates.map(t => (
            <button
              key={t.name}
              className="template-btn"
              onClick={() => applyTemplate(t)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* Builder */}
      <div className="builder-card">
        {/* URL */}
        <div className="form-group">
          <label>
            Ziel-URL <span className="required">*</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/landing-page"
            value={params.url}
            onChange={e => handleChange('url', e.target.value)}
            className={errors.url ? 'error' : ''}
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>

        {/* Required params */}
        <div className="form-grid">
          <div className="form-group">
            <label>
              utm_source <span className="required">*</span>
              <span className="hint">Woher kommt der Traffic?</span>
            </label>
            <input
              type="text"
              placeholder="z.B. google, facebook, newsletter"
              value={params.source}
              onChange={e => handleChange('source', e.target.value)}
              className={errors.source ? 'error' : ''}
            />
            {errors.source && <div className="error-message">{errors.source}</div>}
          </div>

          <div className="form-group">
            <label>
              utm_medium <span className="required">*</span>
              <span className="hint">Marketing-Kanal</span>
            </label>
            <input
              type="text"
              placeholder="z.B. cpc, email, social"
              value={params.medium}
              onChange={e => handleChange('medium', e.target.value)}
              className={errors.medium ? 'error' : ''}
            />
            {errors.medium && <div className="error-message">{errors.medium}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>
            utm_campaign <span className="required">*</span>
            <span className="hint">Kampagnenname</span>
          </label>
          <input
            type="text"
            placeholder="z.B. summer_sale_2025, product_launch"
            value={params.campaign}
            onChange={e => handleChange('campaign', e.target.value)}
            className={errors.campaign ? 'error' : ''}
          />
          {errors.campaign && <div className="error-message">{errors.campaign}</div>}
        </div>

        {/* Optional params */}
        <div className="form-grid">
          <div className="form-group">
            <label>
              utm_term
              <span className="hint">Optional – Keyword</span>
            </label>
            <input
              type="text"
              placeholder="z.B. marketing_tools"
              value={params.term}
              onChange={e => handleChange('term', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              utm_content
              <span className="hint">Optional – Anzeigen-Variante</span>
            </label>
            <input
              type="text"
              placeholder="z.B. banner_blue, cta_top"
              value={params.content}
              onChange={e => handleChange('content', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary" onClick={generateUrl}>
            ✨ UTM-Link erstellen
          </button>
          <button className="btn btn-secondary" onClick={clearForm}>
            🗑️ Zurücksetzen
          </button>
        </div>

        {/* Result */}
        {generatedUrl && (
          <div className="result-section fade-in">
            <h3>Dein UTM-Link</h3>
            <div className="result-url">{generatedUrl}</div>
            <div className="result-actions">
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                onClick={copyToClipboard}
              >
                {copied ? '✓ Kopiert!' : '📋 Kopieren'}
              </button>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                🔗 Link testen
              </a>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <section className="history-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>📜 Verlauf</h2>
            <button className="btn btn-secondary" onClick={exportHistory} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              📥 CSV Export
            </button>
          </div>
          {history.slice(0, 5).map((item, i) => (
            <div key={i} className="history-item">
              <span className="history-url">{item.url}</span>
              <div className="history-actions">
                <button className="history-btn" onClick={() => loadFromHistory(item.url)}>
                  Laden
                </button>
                <button className="history-btn" onClick={() => {
                  navigator.clipboard.writeText(item.url)
                  toast('Kopiert!')
                }}>
                  Kopieren
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <h2>Mehr als nur ein UTM Builder?</h2>
        <p>
          Mit CampKit verwaltest du alle deine UTM-Links an einem Ort – 
          mit Team-Sharing, Vorlagen und Analytics.
        </p>
        <a href="https://getcampkit.com?utm_source=utmbuilder&utm_medium=referral&utm_campaign=cta" className="btn" target="_blank" rel="noopener">
          CampKit kostenlos testen →
        </a>
      </section>

      {/* Info */}
      <section className="info-section">
        <h2>Was sind UTM-Parameter?</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>utm_source</h3>
            <p>Identifiziert die Traffic-Quelle (z.B. google, facebook, newsletter)</p>
          </div>
          <div className="info-item">
            <h3>utm_medium</h3>
            <p>Das Marketing-Medium (z.B. cpc, email, social, banner)</p>
          </div>
          <div className="info-item">
            <h3>utm_campaign</h3>
            <p>Der Name deiner Kampagne (z.B. summer_sale, product_launch)</p>
          </div>
          <div className="info-item">
            <h3>utm_term</h3>
            <p>Optional: Keywords für bezahlte Suche</p>
          </div>
          <div className="info-item">
            <h3>utm_content</h3>
            <p>Optional: Unterscheide ähnliche Inhalte oder Links</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>Häufige Fragen</h2>
        
        <div className="faq-item">
          <h3>Warum sollte ich UTM-Parameter verwenden?</h3>
          <p>UTM-Parameter helfen dir, genau zu verstehen, woher dein Website-Traffic kommt. Ohne sie siehst du in Google Analytics nur "Direct" oder "Referral" – mit UTMs weißt du exakt, welche Kampagne, Anzeige oder E-Mail den Besuch ausgelöst hat.</p>
        </div>

        <div className="faq-item">
          <h3>Funktioniert dieser UTM Builder mit GA4?</h3>
          <p>Ja! UTM-Parameter funktionieren automatisch mit Google Analytics 4. Die Parameter werden in GA4 unter "Traffic acquisition" und in benutzerdefinierten Reports angezeigt.</p>
        </div>

        <div className="faq-item">
          <h3>Welche Namenskonventionen sollte ich verwenden?</h3>
          <p>Verwende immer Kleinbuchstaben, Unterstriche statt Leerzeichen, und sei konsistent. Beispiel: "facebook" statt "Facebook" oder "FB". Das macht die Auswertung später viel einfacher.</p>
        </div>

        <div className="faq-item">
          <h3>Werden meine UTM-Links gespeichert?</h3>
          <p>Der Verlauf wird lokal in deinem Browser gespeichert (localStorage). Nichts wird an einen Server gesendet. Für Team-Sharing und zentrale Verwaltung empfehlen wir CampKit.</p>
        </div>

        <div className="faq-item">
          <h3>Kann ich UTM-Links für Social Media verwenden?</h3>
          <p>Absolut! UTM-Links funktionieren überall – Social Media Posts, Bio-Links, Anzeigen, E-Mails, QR-Codes. Überall wo du einen Link platzieren kannst.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          Ein kostenloses Tool von{' '}
          <a href="https://getcampkit.com?utm_source=utmbuilder&utm_medium=referral&utm_campaign=footer" target="_blank" rel="noopener">
            CampKit
          </a>
          {' '}– Die UTM-Link Management Plattform
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="https://getcampkit.com/impressum" target="_blank" rel="noopener">Impressum</a>
          {' · '}
          <a href="https://getcampkit.com/datenschutz" target="_blank" rel="noopener">Datenschutz</a>
        </p>
      </footer>

      {/* Toast */}
      {showToast && <div className="toast">{toastMessage}</div>}
    </main>
  )
}
