---
title: ETL Pipeline for E-Commerce Fashion Product Data
---

## Masalah
Mengumpulkan detail produk dari halaman e-commerce sering kali menghasilkan data acak yang mengandung bidang hilang, format tidak konsisten, dan mata uang yang bercampur. Agar data ini dapat digunakan untuk analisis lebih lanjut, dibutuhkan sistem otomatis untuk melakukan scraping data mentah, menstandarkan atribut, menerapkan logika bisnis, dan menyalurkan data bersih ke beberapa target penyimpanan.

## Pendekatan
Saya membangun pipeline ETL end-to-end menggunakan `Python 3.9` yang terstruktur dalam modul ekstraksi, transformasi, dan pemuatan. Untuk ekstraksi, saya menggunakan Requests dan BeautifulSoup dengan dukungan pagination untuk mengumpulkan atribut produk. Pada tahap transformasi, saya menggunakan Pandas untuk membersihkan spasi, menangani bidang yang hilang atau tidak valid, mengonversi harga USD ke IDR, menambahkan timestamp pemrosesan berbasis zona waktu, menghapus duplikat, dan menerapkan schema yang ketat. Untuk pemuatan, saya membuat modul penulisan yang dapat dikonfigurasi untuk file CSV lokal, Google Sheets via gspread, dan PostgreSQL via psycopg2, yang diuji dengan unit test menggunakan pytest.

## Hasil
- Membangun scraper web otomatis yang mampu menelusuri halaman katalog terpaginasi untuk mengekstrak detail produk secara lengkap.
- Menerapkan alur kerja transformasi yang fleksibel untuk konversi mata uang, pemfilteran nilai null, eliminasi duplikat, dan penegakan schema.
- Mendukung pemuatan data ke berbagai target seperti file CSV, Google Sheets, dan tabel PostgreSQL yang dikonfigurasi melalui environment variables.
- Membuat unit test beserta pelaporan cakupan kode menggunakan `pytest` dan `pytest-cov`.
