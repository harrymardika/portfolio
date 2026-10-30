# Evaluasi CV menurut kriteria HR per posisi (T16.5)

> Dikerjakan 2026-10-30 atas permintaan pemilik (D32): periksa CV umum dan ketujuh CV per posisi, lalu langsung perbaiki. Yang dinilai adalah PDF hasil build (`/downloads/` dan `/downloads/cv/`, EN dan ID), bukan hanya file `content/`. "Sebelum" = keadaan di awal Fase 16; "sesudah" = setelah T16.2 dan T16.5.

## 1. Kriteria

**Kriteria umum** (berlaku untuk semua CV, sesuai praktik rekrutmen dan ATS yang umum dipakai perusahaan):

| # | Kriteria | Cara mengecek |
|---|---|---|
| U1 | Terbaca ATS: satu kolom, teks asli yang bisa disalin, judul bagian standar, tanpa foto/grafik | Teks PDF diekstrak (pdfjs) dan dibaca ulang |
| U2 | Maksimal 2 halaman | Tes `tests/e2e/pdf.spec.ts` |
| U3 | Ringkasan 3–5 baris yang menyebut posisi target dan kata kunci utamanya | Baris pertama ringkasan |
| U4 | Poin diawali kata kerja aksi dan memuat hasil terukur | Poin pengalaman |
| U5 | Kata kunci posisi ada **dan** dibuktikan di pengalaman atau proyek | Bandingkan Skills dengan isi poin |
| U6 | Urutan bagian sesuai posisi (bukti terkuat di halaman 1) | `sections` di `cv-variants.yaml` |
| U7 | Untuk lulusan baru: ada bukti proyek yang relevan | Bagian proyek |
| U8 | Semua klaim bisa dibuktikan saat wawancara atau dicek | Sumber di `content/` dan dokumen PKM-K |
| U9 | Konsisten: tanggal, format angka (D16), nama teknologi | Teks PDF |
| U10 | Kontak lengkap tanpa data sensitif | Header CV |

**Kriteria per posisi** (yang dicari perekrut):

| Posisi | Kata kunci dan bukti yang dicari |
|---|---|
| AI/ML Engineer | Python, PyTorch/TensorFlow, computer vision/NLP, metrik model, deployment (edge, serving), MLOps |
| Data Scientist | Statistik dan pemodelan, eksperimen, metrik (akurasi, AUC, R², ROUGE), peramalan, kompetisi data |
| Data Engineer | Pipeline/ETL, SQL, Spark, Airflow, orkestrasi, gudang data, monitoring, skala data |
| Data Analyst | SQL, Python, BI (Power BI/Tableau/Looker), analisis survei/bisnis, insight → keputusan |
| Product Manager | Riset pengguna, discovery, prioritas, metrik produk (NPS, konversi), peluncuran, model bisnis |
| Project Manager | Jadwal, anggaran, risiko, tim lintas fungsi, pemangku kepentingan, hasil tepat waktu/anggaran |
| Management Trainee | Prestasi akademik, kepemimpinan, keragaman pengalaman, cepat belajar, komunikasi |

## 2. Temuan yang berlaku untuk semua CV

| Temuan | Dampak | Perbaikan |
|---|---|---|
| Tanda hubung setelah angka ("5-person", "F1-score", "8-bit", "Grid-9-Modified") tersalin sebagai tanda minus (U+2212) karena fitur kontekstual font Plus Jakarta Sans | ATS gagal mencocokkan kata kunci seperti "F1-score" | `font-variant-ligatures: no-contextual` di `CvDocument.astro`; tes PDF menolak tanda minus setelah angka (U1) |
| Klaim Decklify tidak sama dengan sumber ("validated product-market fit", "8.39/10 satisfaction", "first 2 weeks", "commercial launch", dana Rp5,85 juta) dan menyiratkan pemilik membangun kodenya | Bisa dipatahkan saat wawancara atau pengecekan latar belakang | Diperbaiki di T16.2 sesuai laporan akhir PKM-K dan peran yang divalidasi pemilik (U8) |
| CV per posisi tanpa bagian proyek | Lulusan baru kehilangan bukti terkuatnya, terutama untuk posisi data | Bagian **Selected projects / Proyek pilihan** (2–3 studi kasus) untuk 5 varian (U5, U7) |
| Ringkasan studi kasus bergaya orang pertama ("I built…", "My thesis…") | Janggal saat dikutip di CV | Ditulis ulang dengan gaya netral (EN dan ID) |
| Tidak ada nomor HP | Perekrut di Indonesia sering menelepon | **Tidak diubah** (aturan keras: nomor HP tidak boleh di repo/web/PDF publik). Lihat §5 |

## 3. Penilaian per CV

Skor = jumlah kriteria umum yang terpenuhi (U1–U10, nilai 1 atau ½), ditambah catatan kriteria posisi.

| CV | Sebelum | Sesudah | Temuan utama | Perbaikan |
|---|---|---|---|---|
| CV umum (AI Product Manager) | 7/10 | 9/10 | Tanda minus (U1); klaim Decklify (U8); bukti lengkap tetapi poin Research Assistant (2 bulan) cukup panjang | T16.2, perbaikan font. Sisa: nomor HP (U10) |
| AI/ML Engineer | 7/10 | 9,5/10 | Ringkasan belum menyebut stack inti (Python, PyTorch, TensorFlow); tanpa proyek; klaim Decklify | Ringkasan menyebut stack; proyek: skripsi YOLO26 aksara Jawa, deteksi hoaks (TF Serving + Prometheus/Grafana), ReclaimYT (CNN + ESP32) |
| Data Scientist | 7/10 | 9,5/10 | Ringkasan 6 baris; tanpa proyek | Ringkasan dipadatkan dan menyebut alat; proyek: prediksi harga emas (70+ konfigurasi, R² 0,9899), prediksi Piala Dunia, LSTM saham BBCA |
| Data Engineer | 5,5/10 | 8,5/10 | Ringkasan tidak menyebut posisi ("Engineer focused on the data side…"); SQL, Spark, Airflow, BigQuery hanya di Skills tanpa bukti (U5) | Ringkasan dibuka dengan "Data engineer" dan alat yang dikonfirmasi pemilik; proyek: pipeline hoaks (TFX, serving, monitoring), IoT telemetri (ESP32 → MQTT/REST), platform portfolio (CI/CD, Docker). Sisa: bukti Spark/Airflow/SQL di proyek (§5) |
| Data Analyst | 5,5/10 | 8,5/10 | Ringkasan tidak menyebut SQL/BI; klaim "validated product-market fit"; alat BI tanpa bukti | Ringkasan dibuka dengan "Data analyst" + Python, SQL, BI; evaluasi Decklify (survei 38 responden, model biaya); proyek: prediksi Piala Dunia, harga emas, sentimen Coinbase. Sisa: bukti dashboard (§5) |
| Product Manager | 7/10 | 9,5/10 | Klaim PMF dan "first 2 weeks" (U8); kata kunci riset pengguna dan evaluasi belum ada | Ringkasan: perencanaan produk, riset pengguna (survei, FGD), uji beban, model bisnis, 45 transaksi (dengan keterangan voucher); proyek: platform portfolio, Dompet Juara |
| Project Manager | 7/10 | 9/10 | Dana salah (Rp5,85 juta); "100% accountability" kabur | Dana Rp8.125.000 yang **terealisasi dan dilaporkan 100%** dalam 82 kegiatan tercatat; final PIMNAS 2026. Tanpa bagian proyek: bukti terkuatnya kepemimpinan dan acara |
| Management Trainee | 8/10 | 9,5/10 | "commercial launch" (U8) | Final PIMNAS 2026 ditambahkan; sisanya sudah sesuai (prestasi akademik, kepemimpinan, keragaman) |

Semua 16 PDF (8 CV × EN/ID) tetap **2 halaman**, teksnya bisa disalin, tanpa nomor HP, dan dicek ulang setelah perbaikan.

## 4. Yang diubah (file)

- `src/components/print/CvDocument.astro`: bagian `projects` (judul bertaut ke studi kasus, tahun, ringkasan, metrik pertama) dan perbaikan font untuk ATS.
- `src/lib/content/schemas/entities.ts`: bagian CV `projects` dan field `projects` (maks. 4 slug studi kasus) di varian; `.pages.yml` (Pages CMS); `src/lib/i18n/ui.ts` (`cv.projects`).
- `src/pages/[...locale]/print/cv/[variant].astro`: slug proyek diubah menjadi studi kasus terbit; build gagal dengan pesan jelas bila slug tidak ada.
- `content/cv-variants.yaml`: ringkasan ketujuh varian, urutan bagian, dan proyek pilihan.
- `content/projects/*.md`: ringkasan bergaya netral (aksara-jawa-yolo, coinbase-sentiment-analysis, prediction-world-cup, portfolio-site).
- Tes: `integrity.test.ts` (proyek varian harus studi kasus terbit), `cv-variants.test.ts` (skema; `projects` dan bagian `projects` harus berpasangan), `print.spec.ts` (jumlah baris proyek dan tautannya per bahasa), `pdf.spec.ts` (tanpa tanda minus setelah angka).
- `content/projects/hoax-detection.md`: metrik pertama kini akurasi validasi 81,2% (akurasi latih 89,6% di labelnya), agar tidak terbaca melebih-lebihkan saat dikutip di CV. Label metrik `gold-price-prediction` diawali huruf kecil.

## 5. Menunggu keputusan atau bahan dari pemilik

1. **Nomor HP:** aturan proyek melarang nomor HP di PDF publik. Saran: tulis nomor di formulir lamaran, atau cetak salinan pribadi dari halaman `/print/cv/…` (tambahkan nomor di salinan itu saja, jangan di-commit).
2. **Bukti alat data:** pemilik mengonfirmasi pernah memakai SQL, Spark/PySpark, Airflow, BigQuery, Power BI, Tableau, dan Looker Studio, tetapi belum ada studi kasus terbit yang menunjukkannya. Ada draf studi kasus AI yang belum di-merge dan cocok untuk itu (mis. `drafts/case-study-netflix-prize-data-warehouse-recommender`, `drafts/case-study-etl-pipeline`, `drafts/case-study-air-quality-analysis`). Setelah ditinjau dan di-merge, tambahkan slug-nya ke `projects` varian Data Engineer dan Data Analyst.
3. **Poin Research Assistant** (2 bulan, 5 poin) di CV umum boleh dipangkas bila pemilik ingin ruang untuk hal lain; tidak diubah karena poin yang sama tampil di web.
