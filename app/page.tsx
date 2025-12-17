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
    toast(`${template.name} template applied`)
  }

  const generateUrl = () => {
    const newErrors: Partial<UTMParams> = {}

    if (!params.url) {
      newErrors.url = 'URL is required'
    } else if (!validateUrl(params.url)) {
      newErrors.url = 'Please enter a valid URL'
    }

    if (!params.source) {
      newErrors.source = 'Source is required'
    }

    if (!params.medium) {
      newErrors.medium = 'Medium is required'
    }

    if (!params.campaign) {
      newErrors.campaign = 'Campaign is required'
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
      toast('URL copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Copy failed')
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
      toast('URL loaded from history')
    } catch {
      toast('Error loading URL')
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
    toast('CSV exported!')
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
        <p>Create UTM links for Google Analytics — free</p>
      </header>

      {/* Templates */}
      <section className="templates-section">
        <h3>🚀 Quick Start Templates</h3>
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
            Destination URL <span className="required">*</span>
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
              <span className="hint">Where does traffic come from?</span>
            </label>
            <input
              type="text"
              placeholder="e.g. google, facebook, newsletter"
              value={params.source}
              onChange={e => handleChange('source', e.target.value)}
              className={errors.source ? 'error' : ''}
            />
            {errors.source && <div className="error-message">{errors.source}</div>}
          </div>

          <div className="form-group">
            <label>
              utm_medium <span className="required">*</span>
              <span className="hint">Marketing channel</span>
            </label>
            <input
              type="text"
              placeholder="e.g. cpc, email, social"
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
            <span className="hint">Campaign name</span>
          </label>
          <input
            type="text"
            placeholder="e.g. summer_sale_2025, product_launch"
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
              placeholder="e.g. marketing_tools"
              value={params.term}
              onChange={e => handleChange('term', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              utm_content
              <span className="hint">Optional – Ad variant</span>
            </label>
            <input
              type="text"
              placeholder="e.g. banner_blue, cta_top"
              value={params.content}
              onChange={e => handleChange('content', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary" onClick={generateUrl}>
            ✨ Generate UTM Link
          </button>
          <button className="btn btn-secondary" onClick={clearForm}>
            🗑️ Reset
          </button>
        </div>

        {/* Result */}
        {generatedUrl && (
          <div className="result-section fade-in">
            <h3>Your UTM Link</h3>
            <div className="result-url">{generatedUrl}</div>
            <div className="result-actions">
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                onClick={copyToClipboard}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                🔗 Test Link
              </a>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <section className="history-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>📜 History</h2>
            <button className="btn btn-secondary" onClick={exportHistory} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              📥 CSV Export
            </button>
          </div>
          {history.slice(0, 5).map((item, i) => (
            <div key={i} className="history-item">
              <span className="history-url">{item.url}</span>
              <div className="history-actions">
                <button className="history-btn" onClick={() => loadFromHistory(item.url)}>
                  Load
                </button>
                <button className="history-btn" onClick={() => {
                  navigator.clipboard.writeText(item.url)
                  toast('Copied!')
                }}>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <h2>Need More Than a UTM Builder?</h2>
        <p>
          With CampKit you manage all your UTM links in one place — 
          with team sharing, templates and analytics.
        </p>
        <a href="https://getcampkit.com?utm_source=utmbuilder&utm_medium=referral&utm_campaign=cta" className="btn" target="_blank" rel="noopener">
          Try CampKit for Free →
        </a>
      </section>

      {/* Info */}
      <section className="info-section">
        <h2>What Are UTM Parameters?</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>utm_source</h3>
            <p>Identifies the traffic source (e.g. google, facebook, newsletter)</p>
          </div>
          <div className="info-item">
            <h3>utm_medium</h3>
            <p>The marketing medium (e.g. cpc, email, social, banner)</p>
          </div>
          <div className="info-item">
            <h3>utm_campaign</h3>
            <p>Your campaign name (e.g. summer_sale, product_launch)</p>
          </div>
          <div className="info-item">
            <h3>utm_term</h3>
            <p>Optional: Keywords for paid search</p>
          </div>
          <div className="info-item">
            <h3>utm_content</h3>
            <p>Optional: Differentiate similar content or links</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-item">
          <h3>Why should I use UTM parameters?</h3>
          <p>UTM parameters help you understand exactly where your website traffic comes from. Without them, you only see "Direct" or "Referral" in Google Analytics – with UTMs you know exactly which campaign, ad, or email triggered the visit.</p>
        </div>

        <div className="faq-item">
          <h3>Does this UTM builder work with GA4?</h3>
          <p>Yes! UTM parameters work automatically with Google Analytics 4. The parameters appear in GA4 under "Traffic acquisition" and in custom reports.</p>
        </div>

        <div className="faq-item">
          <h3>What naming conventions should I use?</h3>
          <p>Always use lowercase, underscores instead of spaces, and be consistent. Example: "facebook" instead of "Facebook" or "FB". This makes analysis much easier later.</p>
        </div>

        <div className="faq-item">
          <h3>Are my UTM links saved?</h3>
          <p>History is stored locally in your browser (localStorage). Nothing is sent to a server. For team sharing and central management, we recommend CampKit.</p>
        </div>

        <div className="faq-item">
          <h3>Can I use UTM links for social media?</h3>
          <p>Absolutely! UTM links work everywhere – social media posts, bio links, ads, emails, QR codes. Anywhere you can place a link.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          A free tool by{' '}
          <a href="https://getcampkit.com?utm_source=utmbuilder&utm_medium=referral&utm_campaign=footer" target="_blank" rel="noopener">
            CampKit
          </a>
          {' '}– The UTM Link Management Platform
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="https://getcampkit.com/impressum" target="_blank" rel="noopener">Imprint</a>
          {' · '}
          <a href="https://getcampkit.com/datenschutz" target="_blank" rel="noopener">Privacy</a>
        </p>
      </footer>

      {/* Toast */}
      {showToast && <div className="toast">{toastMessage}</div>}
    </main>
  )
}
