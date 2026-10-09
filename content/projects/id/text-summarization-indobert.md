---
title: BERT-Based Extractive Text Summarization for Academic Proposal Assessment
---

## Masalah
Saya membutuhkan cara untuk mengotomatisasi penilaian proposal kualifikasi akademik, yang memerlukan rangkuman singkat per bagian yang tetap mempertahankan detail teknis penting serta koherensi semantik.

## Pendekatan
Saya merancang pipeline yang pertama mengekstrak teks PDF, memecahnya menjadi bagian, dan menghitung fitur linguistik (overlap judul, kata petunjuk, posisi, panjang). Kalimat dengan skor tertinggi membentuk rangkuman ekstraktif, yang kemudian disempurnakan oleh model BERT yang di-fine-tune khusus untuk teks akademik Indonesia. Terakhir, saya menghitung kesamaan antar-bagian menggunakan TF-IDF, cosine, dan LSA untuk menghasilkan skor kualitas.

## Hasil
- Sistem hibrida menggabungkan ekstraksi berbasis fitur dengan rangkuman neural BERT, meningkatkan cakupan semantik.
- Pemrosesan per bagian mempertahankan terminologi dan struktur khusus domain.
- Penilaian kualitas otomatis memberikan skor koheren untuk setiap proposal.
- Mencapai skor ROUGE kompetitif: 56,63% (R-1), 47,38% (R-2), 51,14% (R-L).
- Dideploy sebagai aplikasi web Streamlit untuk unggah PDF mudah dan rangkuman instan.
