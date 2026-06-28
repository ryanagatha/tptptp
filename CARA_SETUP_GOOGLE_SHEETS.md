# Cara Setup Google Sheets — Formulir ERTA

Panduan ini menghubungkan formulir web ke Google Sheet agar jawaban ahli tersimpan otomatis.

---

## Langkah 1 — Buat Google Sheet baru

1. Buka [sheets.google.com](https://sheets.google.com)
2. Klik **+ Blank** untuk buat spreadsheet baru
3. Beri nama, misal: `Penilaian Ahli ERTA 2026`

---

## Langkah 2 — Buka Apps Script

1. Di dalam spreadsheet, klik menu **Extensions → Apps Script**
2. Jendela editor Apps Script terbuka (tab baru)

---

## Langkah 3 — Paste kode

1. Hapus semua kode default yang ada (`function myFunction() {}`)
2. Buka file `apps-script/Code.gs` dari folder project ini
3. Copy **seluruh isi** file tersebut
4. Paste ke editor Apps Script
5. Klik ikon **Save** (💾) atau tekan `Ctrl+S`

---

## Langkah 4 — Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas) → **New deployment**
2. Klik ikon ⚙️ di samping "Select type" → pilih **Web app**
3. Isi konfigurasi:

   | Field | Nilai |
   |-------|-------|
   | Description | `ERTA Penilaian Ahli v1` |
   | Execute as | **Me** (email Google kamu) |
   | Who has access | **Anyone** |

4. Klik **Deploy**
5. Google akan meminta izin akses — klik **Authorize access** → pilih akun Google → klik **Allow**
6. Setelah deploy berhasil, copy **Web app URL** yang muncul

   Contoh URL:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

---

## Langkah 5 — Tempel URL ke formulir

1. Buka formulir web di browser (`npm run dev` lalu buka `localhost:5173`)
2. Di bagian atas ada kotak **Google Sheets URL**
3. Paste URL Web App tadi ke kotak tersebut
4. URL tersimpan otomatis di browser (tidak perlu paste ulang jika refresh)

---

## Langkah 6 — Test koneksi (opsional)

Buka URL di browser (ganti `/exec` dengan `/exec` dan akses langsung):

```
https://script.google.com/macros/s/XXXX/exec
```

Harus muncul respons JSON:
```json
{"status":"ready","app":"ERTA Penilaian Ahli"}
```

---

## Cara Kerja Submit

Saat ahli klik **Simpan ke Google Sheets**:

1. Formulir mengirim 25 baris data (1 baris per sampel) ke URL Apps Script
2. Apps Script menerima data → menulis ke sheet tab **"Penilaian"**
3. Sheet dibuat otomatis jika belum ada (lengkap dengan header)

**Kolom yang tersimpan per baris:**

| Kolom | Isi |
|-------|-----|
| Timestamp | Waktu submit (WIB) |
| Nama, NIP, Jabatan, Instansi, LamaJabatan, Tanggal | Data evaluator |
| No, Ticker, Perusahaan, Q, Tier | Identitas sampel |
| Akurasi_ERTA/Baseline/Pemenang | Skor akurasi |
| Kelengkapan_ERTA/Baseline/Pemenang | Skor kelengkapan |
| Kualitas_ERTA/Baseline/Pemenang | Skor kualitas bukti |
| Total_ERTA, Total_Baseline | Total skor (0–3) |
| Pemenang | Pemenang keseluruhan per sampel |
| Catatan | Catatan tambahan (opsional) |

---

## Catatan Teknis (CORS)

Google Apps Script tidak mendukung CORS penuh. Formulir menggunakan `mode: 'no-cors'` saat fetch, sehingga:

- Data **tetap terkirim** ke sheet meskipun browser tidak menerima respons
- Pesan "Berhasil dikirim" muncul selama tidak ada error jaringan
- Untuk verifikasi, buka Google Sheet langsung dan cek tab "Penilaian"

---

## Jika Perlu Update Script

Jika ada perubahan di `Code.gs`:

1. Buka Apps Script editor lagi
2. Update kode
3. Klik **Deploy → Manage deployments**
4. Pilih deployment yang ada → klik ✏️ Edit → ubah version ke **New version** → **Deploy**
5. URL tidak berubah, tidak perlu update di formulir

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Data tidak masuk sheet | Pastikan "Who has access" = **Anyone** saat deploy |
| Error "Authorization required" | Re-deploy dan authorize ulang izin akses |
| Sheet "Penilaian" tidak muncul | Klik tombol Submit sekali, sheet dibuat otomatis |
| URL sudah benar tapi gagal | Coba buka URL langsung di browser untuk test |
