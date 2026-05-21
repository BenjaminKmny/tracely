import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpload } from '../../hooks/useUpload'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function UploadZone() {
  const { state, upload, confirmImport, cancelImport } = useUpload()
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file from your Uber data export.')
      return
    }
    upload(file)
  }, [upload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleConfirm = async () => {
    await confirmImport()
    setTimeout(() => navigate('/dashboard/rides'), 5000)
  }

  const { status, preview, result, error } = state
  const isLoading = status === 'parsing' || status === 'saving'
  const isDone = status === 'done'

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Drop zone — hidden during preview */}
      {status !== 'preview' && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => { if (!isLoading && !isDone) document.getElementById('zip-input')?.click() }}
          style={{
            border: `2px dashed ${isDragging ? ACCENT : isDone ? '#22C55E' : status === 'error' ? '#EF4444' : '#d4e4f0'}`,
            borderRadius: 16,
            padding: '36px 28px',
            textAlign: 'center',
            background: isDragging ? ACCENT_LIGHT : isDone ? '#F0FDF4' : status === 'error' ? '#FEF2F2' : 'white',
            transition: 'all 0.2s',
            cursor: isLoading || isDone ? 'default' : 'pointer',
          }}
        >
          {/* Icon */}
          {status === 'idle' && (
            <div style={{ width: 44, height: 44, background: ACCENT_LIGHT, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
          )}
          {isLoading && (
            <div style={{ width: 44, height: 44, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 14px' }} />
          )}
          {isDone && (
            <div style={{ width: 44, height: 44, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#22C55E"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
          )}
          {status === 'error' && (
            <div style={{ width: 44, height: 44, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#EF4444"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          )}

          {status === 'idle' && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Drop your Uber data export here</div>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>ZIP file from myprivacy.uber.com</div>
              <div style={{ display: 'inline-block', fontSize: 13, color: ACCENT, border: `1px solid ${ACCENT}33`, background: ACCENT_LIGHT, borderRadius: 8, padding: '6px 16px', fontWeight: 500 }}>
                Browse files
              </div>
            </>
          )}

          {status === 'parsing' && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Reading your file</div>
              <div style={{ fontSize: 13, color: '#aaa' }}>Parsing rides and orders...</div>
            </>
          )}

          {status === 'saving' && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Saving to your account</div>
              <div style={{ fontSize: 13, color: '#aaa' }}>
                Adding {state.preview?.newRides ?? 0} new rides and {state.preview?.newOrders ?? 0} new orders...
              </div>
            </>
          )}

          {isDone && result && (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>Import complete</div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                {state.preview?.newRides ?? 0} new rides and {state.preview?.newOrders ?? 0} new orders added
                {result.rides.length > 0 && (() => {
                  const earliest = result.rides.map(r => r.date).filter(Boolean).sort()[0]
                  const year = earliest ? new Date(earliest).getFullYear() : null
                  return year ? <span> · since {year}</span> : null
                })()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 320, margin: '0 auto' }}>
                {[
                  { label: 'New rides', value: state.preview?.newRides ?? 0 },
                  { label: 'New orders', value: state.preview?.newOrders ?? 0 },
                  { label: 'Currency', value: result.dominant_currency },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: 8, padding: '8px', border: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', marginBottom: 6 }}>Upload failed</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{error}</div>
              <div
                onClick={e => { e.stopPropagation(); document.getElementById('zip-input')?.click() }}
                style={{ display: 'inline-block', fontSize: 13, color: ACCENT, border: `1px solid ${ACCENT}33`, background: ACCENT_LIGHT, borderRadius: 8, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
              >
                Try again
              </div>
            </>
          )}

          <input id="zip-input" type="file" accept=".zip" style={{ display: 'none' }} onChange={onFileInput} />
        </div>
      )}

      {/* Preview state */}
      {status === 'preview' && preview && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>Review before importing</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              Data covers{' '}
              {preview.earliestDate ? fmt(preview.earliestDate) : '?'}
              {' '}to{' '}
              {preview.latestDate ? fmt(preview.latestDate) : '?'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#f5f5f5' }}>
            {[
              { label: 'Rides in file', value: preview.totalRides },
              { label: 'Orders in file', value: preview.totalOrders },
              { label: 'New rides to add', value: preview.newRides, highlight: true },
              { label: 'New orders to add', value: preview.newOrders, highlight: true },
            ].map(item => (
              <div key={item.label} style={{ background: 'white', padding: '14px 20px' }}>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.highlight ? ACCENT : '#111', letterSpacing: '-0.4px' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {preview.newRides === 0 && preview.newOrders === 0 && (
            <div style={{ padding: '12px 22px', background: '#FFFBEB', borderTop: '1px solid #FEF3C7' }}>
              <div style={{ fontSize: 12, color: '#92400E' }}>
                No new data found. Everything in this file is already in your account.
              </div>
            </div>
          )}

          <div style={{ padding: '16px 22px', display: 'flex', gap: 10, borderTop: '1px solid #f5f5f5' }}>
            <button
              onClick={handleConfirm}
              disabled={preview.newRides === 0 && preview.newOrders === 0}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                cursor: preview.newRides === 0 && preview.newOrders === 0 ? 'not-allowed' : 'pointer',
                background: preview.newRides === 0 && preview.newOrders === 0 ? '#eee' : ACCENT,
                color: preview.newRides === 0 && preview.newOrders === 0 ? '#aaa' : 'white',
                fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
              }}
            >
              Import {preview.newRides + preview.newOrders > 0 ? `${preview.newRides + preview.newOrders} new records` : 'nothing new'}
            </button>
            <button
              onClick={cancelImport}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #eee', cursor: 'pointer', background: 'white', color: '#666', fontSize: 14, fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Help text */}
      {status === 'idle' && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
          Don't have your data yet?{' '}
          <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>
            Request it from Uber
          </a>
          {' '}— usually arrives within 48 hours.
        </div>
      )}
    </>
  )
}