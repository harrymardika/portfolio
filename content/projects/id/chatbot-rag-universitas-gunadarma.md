---
title: Chatbot RAG Universitas Gunadarma
---

## Masalah
Mahasiswa, dosen, dan staf sering kesulitan menemukan informasi kampus yang terpercaya dan terkini, sementara model bahasa besar cenderung menghasilkan halusinasi bila tidak berlandaskan data khusus universitas.

## Pendekatan
Saya merancang pipeline RAG modular yang merayapi situs resmi universitas, memotong dan mengindeks konten, serta menggabungkan pencarian vektor dengan pencarian kata kunci TF-IDF. Backend menggunakan FastAPI, LangChain, dan Google Generative AI, berjalan secara asinkron dan menyimpan cache pasangan pertanyaan-jawaban yang sering muncul. Dua antarmuka depan—aplikasi React + TypeScript dan UI Chainlit—mengonsumsi API melalui REST dan WebSocket, memberikan respons real-time dengan atribusi sumber, semuanya dikemas dalam Docker Compose untuk kesiapan produksi.

## Hasil
- Menerapkan pipeline RAG lengkap dengan perayapan web otomatis, pemotongan, dan pencarian hibrida (vektor + TF-IDF).
- Menambahkan caching semantik untuk mengurangi latensi dan biaya API LLM pada pertanyaan yang sering diajukan.
- Menyediakan klien web React/TypeScript dan UI Chainlit Python untuk pengalaman pengguna yang fleksibel.
- Menyediakan API FastAPI RESTful dan WebSocket yang mengembalikan jawaban beserta sitasi sumber.
- Mengemas semua layanan dengan Docker Compose, memungkinkan deployment dan skala yang mudah.
