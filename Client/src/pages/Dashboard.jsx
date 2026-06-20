import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:5000'

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{ background: copied ? '#1D9E7520' : 'var(--bg3)', border: `0.5px solid ${copied ? '#1D9E7540' : 'var(--border)'}`, borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: copied ? 'var(--success)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

const StatCard = ({ label, value, sub, delay }) => (
  <div className="slide-up" style={{ animationDelay: delay, background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '26px', fontWeight: '500', color: 'var(--text)' }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>{sub}</div>}
  </div>
)

export default function Dashboard({ token, onLogout }) {
  const [links, setLinks] = useState([])
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expires, setExpires] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState(null)
  const [panelData, setPanelData] = useState(null)
  const [panelLoading, setPanelLoading] = useState(false)
  const [totalClicks, setTotalClicks] = useState(0)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchLinks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/links`, { headers })
      setLinks(res.data)
    } catch { onLogout() }
  }, [token])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  useEffect(() => {
    const fetchAllStats = async () => {
      let total = 0
      for (const link of links) {
        try {
          const res = await axios.get(`${API}/api/links/${link.id}/stats`, { headers })
          total += res.data.total_clicks
        } catch {}
      }
      setTotalClicks(total)
    }
    if (links.length > 0) fetchAllStats()
  }, [links])

  const createLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API}/api/links`, {
        original_url: url,
        custom_alias: alias || undefined,
        expires_at: expires || undefined
      }, { headers })
      setUrl('')
      setAlias('')
      setExpires('')
      fetchLinks()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const deleteLink = async (id) => {
    await axios.delete(`${API}/api/links/${id}`, { headers })
    if (panel?.id === id) setPanel(null)
    fetchLinks()
  }

  const openStats = async (link) => {
    if (panel?.id === link.id && panel?.type === 'stats') { setPanel(null); return }
    setPanel({ ...link, type: 'stats' })
    setPanelData(null)
    setPanelLoading(true)
    const res = await axios.get(`${API}/api/links/${link.id}/stats`, { headers })
    setPanelData(res.data)
    setPanelLoading(false)
  }

  const openQr = async (link) => {
    if (panel?.id === link.id && panel?.type === 'qr') { setPanel(null); return }
    setPanel({ ...link, type: 'qr' })
    setPanelData(null)
    setPanelLoading(true)
    const res = await axios.get(`${API}/api/links/${link.id}/qr`, { headers })
    setPanelData(res.data)
    setPanelLoading(false)
  }

  const downloadQr = (qr) => {
    const a = document.createElement('a')
    a.href = qr
    a.download = `linksnap-qr-${panel.short_code}.png`
    a.click()
  }

  const btnStyle = (active) => ({
    background: active ? '#7F77DD20' : 'var(--bg3)',
    border: `0.5px solid ${active ? '#7F77DD40' : 'var(--border)'}`,
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '11px',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
          <span style={{ fontSize: '15px', fontWeight: '500' }}>LinkSnap</span>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '5px 14px', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}>
          Sign out
        </button>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="slide-up" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Shorten a URL</div>
          <form onSubmit={createLink}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste your long URL here..." required
                style={{ flex: '3', minWidth: '200px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <input value={alias} onChange={e => setAlias(e.target.value)} placeholder="Custom alias (optional)"
                style={{ flex: '1', minWidth: '150px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <input value={expires} onChange={e => setExpires(e.target.value)} type="datetime-local"
                style={{ flex: '1', minWidth: '150px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--muted)', outline: 'none', transition: 'border-color 0.2s', colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <button type="submit" disabled={loading}
                style={{ background: loading ? 'var(--accent2)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '10px 22px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent2)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                {loading ? <><span className="spinner"></span> Creating...</> : 'Shorten →'}
              </button>
            </div>
            {error && <div className="fade-in" style={{ marginTop: '10px', fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          <StatCard label="Total links" value={links.length} sub={links.length > 0 ? 'active' : 'create your first'} delay="0.05s" />
          <StatCard label="Total clicks" value={totalClicks} sub="across all links" delay="0.1s" />
          <StatCard label="Latest link" value={links[0] ? `/${links[0].short_code}` : '—'} sub={links[0] ? timeAgo(links[0].created_at) : 'none yet'} delay="0.15s" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: panel ? '1fr 340px' : '1fr', gap: '16px', transition: 'all 0.3s' }}>
          <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your links</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--bg3)', padding: '2px 10px', borderRadius: '20px', border: '0.5px solid var(--border)' }}>{links.length} total</span>
            </div>

            {links.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>↑</div>
                <div style={{ fontSize: '13px' }}>Shorten your first URL above</div>
              </div>
            ) : (
              links.map((link, i) => (
                <div key={link.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s`, padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--bg3)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, fontSize: '15px' }}>⇗</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--accent)' }}>
                      <a href={`${API}/${link.short_code}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        localhost:5000/{link.short_code}
                      </a>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{link.original_url}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(link.created_at)}</div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openStats(link)} style={btnStyle(panel?.id === link.id && panel?.type === 'stats')}>Stats</button>
                    <button onClick={() => openQr(link)} style={btnStyle(panel?.id === link.id && panel?.type === 'qr')}>QR</button>
                    <CopyButton text={`http://localhost:5000/${link.short_code}`} />
                    <button onClick={() => deleteLink(link.id)} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
                      onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {panel && (
            <div className="slide-in-right" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{panel.type === 'stats' ? 'Analytics' : 'QR Code'}</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--accent)', marginTop: '2px' }}>/{panel.short_code}</div>
                </div>
                <button onClick={() => setPanel(null)} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: '6px', width: '28px', height: '28px', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
              </div>

              {panelLoading ? (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <span className="spinner"></span>
                </div>
              ) : panel.type === 'stats' && panelData ? (
                <div className="fade-in">
                  <div style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Total clicks</div>
                    <div style={{ fontSize: '32px', fontWeight: '500' }}>{panelData.total_clicks}</div>
                  </div>
                  {panelData.daily_clicks.length > 0 ? (
                    <>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily breakdown</div>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={panelData.daily_clicks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#666672' }} tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                          <YAxis tick={{ fontSize: 10, fill: '#666672' }} />
                          <Tooltip contentStyle={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="clicks" fill="#7F77DD" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No clicks yet</div>
                  )}
                </div>
              ) : panel.type === 'qr' && panelData ? (
                <div className="fade-in" style={{ textAlign: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '16px', display: 'inline-block', marginBottom: '12px' }}>
                    <img src={panelData.qr} alt="QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
                  </div>
                  <div>
                    <button onClick={() => downloadQr(panelData.qr)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px 20px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.target.style.background = 'var(--accent2)'}
                      onMouseLeave={e => e.target.style.background = 'var(--accent)'}>
                      Download PNG
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}