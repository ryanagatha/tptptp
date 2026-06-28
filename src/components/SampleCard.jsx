import { useState, useCallback } from 'react'
import { TICKER_PDF } from '../data/pdfs'

const CRITERIA = [
  { key: 'akurasi',     label: 'i. Akurasi Faktual' },
  { key: 'kelengkapan', label: 'ii. Kelengkapan Jawaban' },
  { key: 'kualitas',    label: 'iii. Kualitas Bukti' },
]

const TIER_COLORS = { 1: 't1', 2: 't2', 3: 't3', 4: 't4' }

function autoWinner(erta, baseline) {
  if (erta === undefined || erta === null || baseline === undefined || baseline === null) return null
  if (erta > baseline) return 'erta'
  if (baseline > erta) return 'baseline'
  return 'sama'
}

const WINNER_LABEL = { erta: 'ERTA', baseline: 'Baseline', sama: 'Sama' }

export default function SampleCard({ sample, scores, onChange, id }) {
  const [ertaOpen, setErtaOpen] = useState(false)
  const [baseOpen, setBaseOpen] = useState(false)
  const [pdfOpen,  setPdfOpen]  = useState(false)

  const pdfUrl = TICKER_PDF[sample.ticker]

  const getScore = (key) => scores?.[key] ?? {}

  const handleScore = useCallback((criteriaKey, field, value) => {
    const prev = scores?.[criteriaKey] ?? {}
    const updated = { ...prev, [field]: value }
    // Auto-compute winner when either score changes
    const w = autoWinner(
      field === 'erta'     ? value : updated.erta,
      field === 'baseline' ? value : updated.baseline,
    )
    onChange(criteriaKey, { ...updated, winner: w })
  }, [scores, onChange])

  const ertaTotal = CRITERIA.reduce((a, c) => a + (getScore(c.key).erta     ?? 0), 0)
  const baseTotal = CRITERIA.reduce((a, c) => a + (getScore(c.key).baseline ?? 0), 0)
  const overallW  = autoWinner(ertaTotal, baseTotal)

  return (
    <div className="sample-card" id={id}>
      <div className="sample-header">
        <span className="sample-no">#{String(sample.no).padStart(2, '0')}</span>
        <span className="sample-ticker">{sample.ticker}</span>
        <span className="sample-company">{sample.company}</span>
        <span className="sample-q">{sample.q}</span>
        <span className={`tier-pill ${TIER_COLORS[sample.tier] || ''}`}>{sample.tierLabel}</span>

        {pdfUrl && (
          <button
            className="btn-pdf"
            onClick={() => setPdfOpen(v => !v)}
            title="Buka Laporan Keuangan PDF"
          >
            📄 {pdfOpen ? 'Tutup' : 'Buka'} Lapkeu
          </button>
        )}
      </div>

      {/* ── Inline PDF viewer ── */}
      {pdfOpen && pdfUrl && (
        <div className="pdf-viewer">
          <div className="pdf-toolbar">
            <span>Laporan Keuangan — {sample.company} ({sample.ticker})</span>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="pdf-newtab">↗ Buka di Tab Baru</a>
            <button className="pdf-close" onClick={() => setPdfOpen(false)}>✕ Tutup</button>
          </div>
          <iframe src={pdfUrl} title={`Lapkeu ${sample.ticker}`} className="pdf-frame" />
        </div>
      )}

      <div className="sample-body">
        <div className="question-box">{sample.question}</div>

        {/* ── Answers ── */}
        <div className="answer-panels">
          <div className="answer-panel erta">
            <div className="ap-header" onClick={() => setErtaOpen(v => !v)}>
              <span>▣ JAWABAN SISTEM A — ERTA</span>
              <span className={`ap-toggle ${ertaOpen ? 'open' : ''}`}>▼</span>
            </div>
            {ertaOpen && (
              <div className="ap-body" dangerouslySetInnerHTML={{ __html: sample.ertaAnswer }} />
            )}
          </div>

          <div className="answer-panel base">
            <div className="ap-header" onClick={() => setBaseOpen(v => !v)}>
              <span>▢ JAWABAN SISTEM B — BASELINE</span>
              <span className={`ap-toggle ${baseOpen ? 'open' : ''}`}>▼</span>
            </div>
            {baseOpen && (
              <div className="ap-body" dangerouslySetInnerHTML={{ __html: sample.baselineAnswer }} />
            )}
          </div>
        </div>

        {/* ── Criteria table ── */}
        <table className="criteria-table">
          <thead>
            <tr>
              <th>Kriteria</th>
              <th>Sistem A (ERTA)</th>
              <th>Sistem B (Baseline)</th>
              <th>Pemenang</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map(({ key, label }) => {
              const sc = getScore(key)
              const w  = autoWinner(sc.erta, sc.baseline)
              return (
                <tr key={key}>
                  <td>{label}</td>

                  {/* ERTA score */}
                  <td>
                    <div className="score-group">
                      <label className="score-radio">
                        <input type="radio" name={`${id}-${key}-erta`}
                          checked={sc.erta === 1}
                          onChange={() => handleScore(key, 'erta', 1)} />
                        <span className="r-label unggul">1 Unggul</span>
                      </label>
                      <label className="score-radio">
                        <input type="radio" name={`${id}-${key}-erta`}
                          checked={sc.erta === 0}
                          onChange={() => handleScore(key, 'erta', 0)} />
                        <span className="r-label tidak">0 Tidak</span>
                      </label>
                    </div>
                  </td>

                  {/* Baseline score */}
                  <td>
                    <div className="score-group">
                      <label className="score-radio">
                        <input type="radio" name={`${id}-${key}-base`}
                          checked={sc.baseline === 1}
                          onChange={() => handleScore(key, 'baseline', 1)} />
                        <span className="r-label unggul">1 Unggul</span>
                      </label>
                      <label className="score-radio">
                        <input type="radio" name={`${id}-${key}-base`}
                          checked={sc.baseline === 0}
                          onChange={() => handleScore(key, 'baseline', 0)} />
                        <span className="r-label tidak">0 Tidak</span>
                      </label>
                    </div>
                  </td>

                  {/* Winner — auto */}
                  <td style={{ textAlign: 'center' }}>
                    {w ? (
                      <span className={`winner-chip ${w}`}>{WINNER_LABEL[w]}</span>
                    ) : (
                      <span style={{ color: '#adb5bd', fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* ── Conclusion ── */}
        <div className="conc-row">
          <div className="score-display">
            <div className="sd-label">SKOR ERTA</div>
            <span className="sd-val">{ertaTotal}</span>
            <span className="sd-denom">/ 3</span>
          </div>
          <div className="conc-divider" />
          <div className="score-display">
            <div className="sd-label">SKOR BASELINE</div>
            <span className="sd-val">{baseTotal}</span>
            <span className="sd-denom">/ 3</span>
          </div>
          <div className="conc-divider" />
          <div className="score-display" style={{ minWidth: 90 }}>
            <div className="sd-label">PEMENANG</div>
            <div style={{ marginTop: 6 }}>
              {overallW ? (
                <span className={`winner-chip ${overallW}`} style={{ fontSize: 14, padding: '4px 14px' }}>
                  {WINNER_LABEL[overallW]}
                </span>
              ) : (
                <span style={{ color: '#adb5bd', fontSize: 12 }}>Belum diisi</span>
              )}
            </div>
          </div>
          <div className="conc-divider" />
          <div className="conc-notes">
            <label>CATATAN TAMBAHAN (opsional):</label>
            <textarea
              placeholder="Catatan atau temuan kunci..."
              value={scores?.__notes__ ?? ''}
              onChange={e => onChange('__notes__', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
