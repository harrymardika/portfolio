---
title: Chatbot RAG Universitas Gunadarma
---

## Masalah
Akses informasi akademik yang cepat dan akurat merupakan tantangan umum di lingkungan universitas. Large Language Model (LLM) sering kali berhalusinasi saat ditanya tentang aturan, jadwal, dan prosedur kampus yang spesifik, sehingga menghasilkan jawaban yang tidak andal.

## Pendekatan
Saya membangun pipeline Retrieval-Augmented Generation (RAG) lengkap yang terdiri dari web crawler otomatis untuk mengumpulkan data universitas yang terverifikasi, backend FastAPI menggunakan LangChain dan Google Generative AI untuk pemrosesan, serta beberapa pilihan frontend (React dan Chainlit). Saya mengimplementasikan hybrid search (pencarian vektor dikombinasikan dengan pencarian kata kunci TF-IDF) untuk meningkatkan relevansi dokumen, mengintegrasikan semantic caching guna mengurangi latensi serta biaya API, dan menyusun sistem dengan Clean Architecture dan kontainerisasi Docker.

## Hasil
- Mengembangkan chatbot berbasis RAG dalam kontainer dengan backend FastAPI siap produksi dan orkestrasi Docker Compose yang skalabel.
- Membangun dua antarmuka yang responsif: aplikasi web React modern berbasis TypeScript dan antarmuka Chainlit berbasis Python.
- Mengimplementasikan hybrid search yang menggabungkan kemiripan vektor dengan pencocokan kata kunci TF-IDF untuk menyajikan dokumen akademik yang sangat relevan.
- Mengintegrasikan semantic caching untuk menyimpan pasangan pertanyaan-jawaban yang sering muncul, sehingga meminimalkan latensi respons API secara efektif.
- Membuat web crawler otomatis yang memperbarui basis pengetahuan sistem secara berkala dari situs resmi universitas.
