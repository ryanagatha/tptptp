import { SAMPLES } from '../data/samples'

const CRITERIA = ['akurasi', 'kelengkapan', 'kualitas']

function autoWinner(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return null
  if (a > b) return 'erta'
  if (b > a) return 'baseline'
  return 'sama'
}

const WINNER_LABEL = { erta: 'ERTA', baseline: 'Baseline', sama: 'Sama' }

export default function RecapTable({ allScores }) {
  let totalErtaWins = 0

  return (
    <div className="recap-section">
      <div className="section-title">Rekap Hasil Penilaian</div>
      <table className="recap-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}>No</th>
            <th style={{ width: 60 }}>Ticker</th>
            <th style={{ width: 36 }}>Q</th>
            <th style={{ width: 36 }}>Tier</th>
            <th>Akurasi<br/>Faktual</th>
            <th>Kelengkapan<br/>Jawaban</th>
            <th>Kualitas<br/>Bukti</th>
            <th>Skor<br/>ERTA</th>
            <th>Skor<br/>Baseline</th>
            <th>Pemenang</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLES.map(s => {
            const sc = allScores?.[s.no]
            const ak = autoWinner(sc?.akurasi?.erta,     sc?.akurasi?.baseline)
            const kl = autoWinner(sc?.kelengkapan?.erta, sc?.kelengkapan?.baseline)
            const ku = autoWinner(sc?.kualitas?.erta,    sc?.kualitas?.baseline)
            const ertaTotal = CRITERIA.reduce((a, k) => a + (sc?.[k]?.erta     ?? 0), 0)
            const baseTotal = CRITERIA.reduce((a, k) => a + (sc?.[k]?.baseline ?? 0), 0)
            const w = autoWinner(ertaTotal, baseTotal)

            const isDone    = ak && kl && ku
            const isPartial = !isDone && (ak || kl || ku)
            if (w === 'erta') totalErtaWins++

            return (
              <tr key={s.no} className={isDone ? 'row-done' : isPartial ? 'row-partial' : ''}>
                <td>{String(s.no).padStart(2, '0')}</td>
                <td>{s.ticker}</td>
                <td>{s.q}</td>
                <td>T{s.tier}</td>
                <td>{ak ? <WinChip v={ak} /> : ''}</td>
                <td>{kl ? <WinChip v={kl} /> : ''}</td>
                <td>{ku ? <WinChip v={ku} /> : ''}</td>
                <td>{isDone ? ertaTotal : ''}</td>
                <td>{isDone ? baseTotal : ''}</td>
                <td>{w ? <WinChip v={w} /> : ''}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={9} style={{ textAlign: 'right' }}>TOTAL SAMPEL ERTA UNGGUL</td>
            <td>{totalErtaWins} / 25</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function WinChip({ v }) {
  return <span className={`winner-chip ${v}`}>{v === 'erta' ? 'ERTA' : v === 'baseline' ? 'Baseline' : 'Sama'}</span>
}
