import { SAMPLES } from '../data/samples'

const chip = (v) => v === 'erta' ? 'ERTA' : v === 'baseline' ? 'Base' : v === 'sama' ? 'Remis' : ''

export default function RecapTable({ allScores }) {
  let ertaWinsTotal = 0

  return (
    <div className="recap-section">
      <div className="section-title">Rekap Hasil Penilaian</div>
      <table className="recap-table">
        <thead>
          <tr>
            <th style={{ width:28 }}>No</th>
            <th style={{ width:60 }}>Ticker</th>
            <th style={{ width:36 }}>Q</th>
            <th style={{ width:36 }}>Tier</th>
            <th>Akurasi</th>
            <th>Kelengkapan</th>
            <th>Kualitas</th>
            <th>ERTA Unggul</th>
            <th>Base Unggul</th>
            <th>Pemenang</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLES.map(s => {
            const sc       = allScores?.[s.no] || {}
            const ak       = sc.akurasi     || null
            const kl       = sc.kelengkapan || null
            const ku       = sc.kualitas    || null
            const ertaWins = [ak, kl, ku].filter(v => v === 'erta').length
            const baseWins = [ak, kl, ku].filter(v => v === 'baseline').length
            const filled   = [ak, kl, ku].filter(Boolean).length
            const isDone   = filled === 3
            const overall  = isDone
              ? (ertaWins > baseWins ? 'erta' : baseWins > ertaWins ? 'baseline' : 'sama')
              : null

            if (overall === 'erta') ertaWinsTotal++

            return (
              <tr key={s.no} className={isDone ? 'row-done' : filled > 0 ? 'row-partial' : ''}>
                <td>{String(s.no).padStart(2,'0')}</td>
                <td>{s.ticker}</td>
                <td>{s.q}</td>
                <td>T{s.tier}</td>
                <td>{ak ? <span className="winner-chip">{chip(ak)}</span> : ''}</td>
                <td>{kl ? <span className="winner-chip">{chip(kl)}</span> : ''}</td>
                <td>{ku ? <span className="winner-chip">{chip(ku)}</span> : ''}</td>
                <td>{isDone ? ertaWins : ''}</td>
                <td>{isDone ? baseWins : ''}</td>
                <td>{overall ? <span className="winner-chip">{chip(overall)}</span> : ''}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={9} style={{ textAlign:'right' }}>TOTAL SAMPEL ERTA UNGGUL</td>
            <td>{ertaWinsTotal} / 25</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
