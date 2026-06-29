import { useState, useEffect, useCallback } from 'react'
import { SAMPLES } from './data/samples'
import SampleCard from './components/SampleCard'
import RecapTable from './components/RecapTable'

const STORAGE_KEY = 'erta_kuesioner_v2'
const SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycby0PqvvPaY1yvj4GeGYcbt2aU48WGW5fO5Ht56Kc6WSliEaVo7r_I90EaA584D-j04r/exec'
const CRITERIA    = ['akurasi', 'kelengkapan', 'kualitas']

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

function initScores() {
  return Object.fromEntries(SAMPLES.map(s => [s.no, {}]))
}

export default function App() {
  const saved = loadState()

  const [identity,   setIdentity]   = useState(saved?.identity ?? {
    nama: '', nip: '', jabatan: '', instansi: '', lamaJabatan: '', tanggal: '',
  })
  const [scores,     setScores]     = useState(saved?.scores ?? initScores())
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg,  setSubmitMsg]  = useState(null)
  const [toast,      setToast]      = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ identity, scores }))
  }, [identity, scores])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }
  const setId = (field, val) => setIdentity(p => ({ ...p, [field]: val }))

  // scores[sampleNo][criteriaKey] = 'erta' | 'baseline' | 'sama' | '__notes__': string
  const handleScoreChange = useCallback((sampleNo, key, val) => {
    setScores(prev => ({
      ...prev,
      [sampleNo]: { ...prev[sampleNo], [key]: val },
    }))
  }, [])

  const getStatus = (no) => {
    const sc = scores[no]
    if (!sc) return 'empty'
    const filled = CRITERIA.filter(k => sc[k] != null).length
    if (filled === 3) return 'done'
    if (filled > 0)   return 'partial'
    return 'empty'
  }

  const doneCnt = SAMPLES.filter(s => getStatus(s.no) === 'done').length
  const pct     = Math.round((doneCnt / SAMPLES.length) * 100)

  const buildRows = () => SAMPLES.map(s => {
    const sc      = scores[s.no] || {}
    const ak      = sc.akurasi     || ''
    const kl      = sc.kelengkapan || ''
    const ku      = sc.kualitas    || ''
    const ertaWins = [ak, kl, ku].filter(v => v === 'erta').length
    const baseWins = [ak, kl, ku].filter(v => v === 'baseline').length
    const overall  = ertaWins > baseWins ? 'ERTA' : baseWins > ertaWins ? 'Baseline' : (ak||kl||ku) ? 'Remis' : ''
    return {
      no: s.no, ticker: s.ticker, company: s.company, q: s.q, tier: `T${s.tier}`,
      akurasi:            ak, kelengkapan: kl, kualitas: ku,
      akurasi_alasan:     sc.akurasi_alasan     || '',
      kelengkapan_alasan: sc.kelengkapan_alasan || '',
      kualitas_alasan:    sc.kualitas_alasan    || '',
      erta_wins:          ertaWins, baseline_wins: baseWins,
      pemenang:           overall,
      catatan:            sc.__notes__ || '',
    }
  })

  const handleSubmit = async () => {
    if (!identity.nama.trim() || !identity.nip.trim()) {
      showToast('Isi Nama dan NIP terlebih dahulu'); return
    }
    setSubmitting(true); setSubmitMsg(null)
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ identity, rows: buildRows() }),
        headers: { 'Content-Type': 'text/plain' },
        mode: 'no-cors',
      })
      setSubmitMsg({ ok: true, text: `✓ Terkirim — ${doneCnt}/25 sampel` })
      showToast('Data berhasil dikirim ke Google Sheets ✓')
    } catch (err) {
      setSubmitMsg({ ok: false, text: `✗ Gagal: ${err.message}` })
    } finally { setSubmitting(false) }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ identity, rows: buildRows() }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `penilaian_${identity.nama||'ahli'}_${new Date().toISOString().slice(0,10)}.json` })
    a.click(); URL.revokeObjectURL(url)
    showToast('File JSON berhasil diunduh ✓')
  }

  const handleReset = () => {
    if (!confirm('Reset semua jawaban?')) return
    setScores(initScores())
    setIdentity({ nama:'', nip:'', jabatan:'', instansi:'', lamaJabatan:'', tanggal:'' })
    setSubmitMsg(null)
    localStorage.removeItem(STORAGE_KEY)
    showToast('Data direset ✓')
  }

  return (
    <div className="app-wrapper">

      <div className="form-header">
        <div className="sub">INSTRUMEN PENELITIAN — TESIS MAGISTER TEKNIK INFORMATIKA, BINUS UNIVERSITY 2026</div>
        <h1>FORMULIR PENILAIAN AHLI PAJAK</h1>
        <div className="sub">Evaluasi Komparatif: ERTA (Sistem A) vs Baseline (Sistem B)</div>
        <div className="ahli-badge">25 Sampel · 3 Kriteria Penilaian</div>
      </div>

      <div className="identity-card">
        <h3>Data Evaluator</h3>
        <div className="identity-grid">
          <span className="lbl required">Nama Lengkap</span>
          <input value={identity.nama} onChange={e => setId('nama', e.target.value)} placeholder="Nama lengkap evaluator" autoFocus />

          <span className="lbl required">NIP</span>
          <input value={identity.nip} onChange={e => setId('nip', e.target.value)} placeholder="Nomor Induk Pegawai" style={{ maxWidth: 260 }} />

          <span className="lbl">Jabatan</span>
          <input value={identity.jabatan} onChange={e => setId('jabatan', e.target.value)} placeholder="Contoh: Pemeriksa Pajak" />

          <span className="lbl">Instansi</span>
          <input value={identity.instansi} onChange={e => setId('instansi', e.target.value)} placeholder="Contoh: DDIP, Direktorat Jenderal Pajak" />

          <span className="lbl">Lama Jabatan</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input value={identity.lamaJabatan} onChange={e => setId('lamaJabatan', e.target.value)} placeholder="0" style={{ width:70 }} />
            <span style={{ fontSize:12, color:'#555' }}>tahun</span>
          </div>

          <span className="lbl required">Tanggal Evaluasi</span>
          <input type="date" value={identity.tanggal} onChange={e => setId('tanggal', e.target.value)} style={{ maxWidth: 180 }} />
        </div>

        <div className="petunjuk">
          <strong>Petunjuk:</strong> Untuk setiap kriteria, pilih sistem mana yang <strong>lebih unggul</strong>: ERTA, Baseline, atau Remis (setara).
          Jawaban tersimpan otomatis. Klik <strong>Simpan ke Google Sheets</strong> setelah selesai.
        </div>

        <div className="progress-wrap">
          <span className="progress-label">Progress: {doneCnt}/{SAMPLES.length} sampel selesai ({pct}%)</span>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width:`${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="progress-nav">
        <span className="nav-lbl">Sampel:</span>
        {SAMPLES.map(s => {
          const st = getStatus(s.no)
          return (
            <a key={s.no} href={`#sample-${s.no}`} className={`nav-dot ${st}`}
              title={`#${String(s.no).padStart(2,'0')} ${s.ticker} ${s.q}`}>
              {s.no}
            </a>
          )
        })}
        <span className="nav-legend">● Selesai &nbsp; ● Sebagian &nbsp; ○ Belum</span>
      </div>

      <div className="section-header-bar">Lembar Penilaian Per Sampel</div>

      {SAMPLES.map(s => (
        <SampleCard
          key={s.no}
          id={`sample-${s.no}`}
          sample={s}
          scores={scores[s.no]}
          onChange={(key, val) => handleScoreChange(s.no, key, val)}
        />
      ))}

      <RecapTable allScores={scores} />

      <div className="declaration-section">
        <div className="section-title">Pernyataan Evaluator</div>
        <p className="decl-text">
          Saya yang bertanda tangan di bawah ini menyatakan bahwa penilaian dalam formulir ini dilakukan secara
          <strong> mandiri</strong>, <strong>objektif</strong>, dan <strong>profesional</strong> berdasarkan kompetensi saya.
          Penilaian tidak dipengaruhi oleh hasil penilaian evaluator lain maupun oleh hasil evaluasi otomatis sistem.
        </p>
        <p className="decl-text">
          Formulir ini digunakan sebagai instrumen validasi kualitatif dalam penelitian tesis berjudul{' '}
          <em>"ERTA: Enhanced Retrieval-Augmented Generation for Tax Analysis"</em>,
          Program Magister Teknik Informatika, BINUS University, 2026.
        </p>
        <div className="sign-area">
          <div className="sign-box">
            <div style={{ fontSize:12, marginBottom:8 }}>
              Jakarta,{' '}
              <input type="date" value={identity.tanggal} onChange={e => setId('tanggal', e.target.value)}
                style={{ border:'none', borderBottom:'1px solid #555', padding:'2px 4px', fontFamily:'inherit', fontSize:12, background:'transparent' }} />
            </div>
            <div className="sign-space" />
            <div className="sign-line" />
            <div className="sign-name-box">
              <div>( {identity.nama || '                              '} )</div>
              <div style={{ marginTop:3 }}>{identity.jabatan || 'Jabatan'}</div>
              <div>NIP: {identity.nip || '_______________________'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="export-panel">
        <span className="ep-label">Aksi</span>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Mengirim...' : '↑ Simpan ke Google Sheets'}
        </button>
        <button className="btn btn-outline" onClick={handleExport}>↓ Unduh JSON</button>
        <button className="btn btn-outline" onClick={() => window.print()}>⎙ Print</button>
        <button className="btn btn-danger"  onClick={handleReset}>✕ Reset</button>
        {submitMsg && <span className={`ep-status ${submitMsg.ok ? 'ok' : 'err'}`}>{submitMsg.text}</span>}
        <span style={{ marginLeft:'auto', fontSize:11, color:'#888' }}>Tersimpan otomatis · {doneCnt}/{SAMPLES.length} selesai</span>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
