/**
 * ERTA — Formulir Penilaian Ahli
 * Google Apps Script Web App
 *
 * Cara deploy:
 * 1. Buka Google Sheet baru → Extensions → Apps Script
 * 2. Paste seluruh kode ini
 * 3. Klik Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL yang diberikan → paste ke app di Setup Banner
 */

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet()
    let   sheet = ss.getSheetByName('Penilaian')

    if (!sheet) {
      sheet = ss.insertSheet('Penilaian')
      sheet.appendRow([
        'Timestamp', 'Nama', 'NIP', 'Jabatan', 'Instansi', 'LamaJabatan', 'Tanggal',
        'No', 'Ticker', 'Perusahaan', 'Q', 'Tier',
        'Akurasi_ERTA', 'Akurasi_Baseline', 'Akurasi_Pemenang',
        'Kelengkapan_ERTA', 'Kelengkapan_Baseline', 'Kelengkapan_Pemenang',
        'Kualitas_ERTA', 'Kualitas_Baseline', 'Kualitas_Pemenang',
        'Total_ERTA', 'Total_Baseline', 'Pemenang', 'Catatan'
      ])
      sheet.setFrozenRows(1)
    }

    const payload  = JSON.parse(e.postData.contents)
    const identity = payload.identity || {}
    const rows     = payload.rows     || []
    const ts       = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

    rows.forEach(r => {
      sheet.appendRow([
        ts,
        identity.nama        || '',
        identity.nip         || '',
        identity.jabatan     || '',
        identity.instansi    || '',
        identity.lamaJabatan || '',
        identity.tanggal     || '',
        r.no, r.ticker, r.company, r.q, r.tier,
        r.akurasi_erta,      r.akurasi_baseline,      r.akurasi_pemenang,
        r.kelengkapan_erta,  r.kelengkapan_baseline,  r.kelengkapan_pemenang,
        r.kualitas_erta,     r.kualitas_baseline,     r.kualitas_pemenang,
        r.total_erta, r.total_baseline, r.pemenang,
        r.catatan || ''
      ])
    })

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', saved: rows.length }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Test endpoint
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready', app: 'ERTA Penilaian Ahli' }))
    .setMimeType(ContentService.MimeType.JSON)
}
