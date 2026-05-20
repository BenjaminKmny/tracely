import { useCallback, useState } from 'react'
import { useUpload, UploadStatus } from '../../hooks/useUpload'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === 'parsing' || status === 'saving') {
    return (
      <div style={{ width: 44, height: 44, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
    )
  }
  if (status === 'done') {
    return (
      <div style={{ width: 44, height: 44, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#22C55E"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div style={{ width: 44, height: 44, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#EF4444"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </div>
    )
  }
  return (
    <div style={{ width: 44, height: 44, background: ACCENT_LIGHT, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
    </div>
  )
}

export function UploadZone() {
  const { state, upload } = useUpload()
  const [isDragging, setIsDragging] = useState(false)

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
  }

  const { status, result, error } = state
  const isLoading = status === 'parsing' || status === 'saving'
  const isDone = status === 'done'

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${isDragging ? ACCENT : isDone ? '#22C55E' : status === 'error' ? '#EF4444' : '#d4e4f0'}`,
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
          background: isDragging ? ACCENT_LIGHT : isDone ? '#F0FDF4' : status === 'error' ? '#FEF2F2' : 'white',
          transition: 'all 0.2s',
          cursor: isLoading || isDone ? 'default' : 'pointer',
        }}
        onClick={() => { if (!isLoading && !isDone) document.getElementById('zip-input')?.click() }}
      >
        <StatusIcon status={status} />

        {status === 'idle' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>
              Drop your Uber data export here
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>
              ZIP file from privacy.uber.com
            </div>
            <div style={{ display: 'inline-block', fontSize: 13, color: ACCENT, border: `1px solid ${ACCENT}33`, background: ACCENT_LIGHT, borderRadius: 8, padding: '6px 16px', fontWeight: 500 }}>
              Browse files
            </div>
          </>
        )}

        {status === 'parsing' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Reading your data</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Parsing your rides and orders...</div>
          </>
        )}

        {status === 'saving' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Saving to your account</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              {result ? `${result.rides.length} rides and ${result.eats_orders.length} orders found` : 'Almost there...'}
            </div>
          </>
        )}

        {status === 'done' && result && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>Import complete</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                {result.rides.length} rides and {result.eats_orders.length} food orders imported
                {result.rides.length > 0 && (() => {
                    const earliest = result.rides
                    .map(r => r.date)
                    .filter(Boolean)
                    .sort()[0]
                    const year = earliest ? new Date(earliest).getFullYear() : null
                    return year ? <span> · since {year}</span> : null
                })()}
                </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 320, margin: '0 auto' }}>
              {[
                { label: 'Rides', value: result.rides.length },
                { label: 'Eats orders', value: result.eats_orders.length },
                { label: 'Currency', value: result.dominant_currency },
              ].map(c => (
                <div key={c.label} style={{ background: 'white', borderRadius: 8, padding: '8px', border: '1px solid #e8e8e8' }}>
                  <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.value}</div>
                </div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#f59e0b' }}>
                Note: {result.errors.join('. ')}
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', marginBottom: 6 }}>Upload failed</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{error}</div>
            <div
              style={{ display: 'inline-block', fontSize: 13, color: ACCENT, border: `1px solid ${ACCENT}33`, background: ACCENT_LIGHT, borderRadius: 8, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); document.getElementById('zip-input')?.click() }}
            >
              Try again
            </div>
          </>
        )}

        <input id="zip-input" type="file" accept=".zip" style={{ display: 'none' }} onChange={onFileInput} />
      </div>

      {/* Help text */}
      <div style={{ marginTop: 12, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        Don't have your data yet?{' '}
        <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>
            Request it from Uber
        </a>
        {' '}— usually arrives within 48 hours.
      </div>
    </>
  )
}