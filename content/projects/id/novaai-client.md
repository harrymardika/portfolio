---
title: 'NOVA AI Client: Multimodal AI Chatbot Frontend'
---

## Masalah
Saya perlu membangun klien frontend interaktif untuk chatbot AI multimodal yang mendukung streaming respons, menjaga konteks percakapan antar turn, menangani autentikasi pengguna, dan mensinkronisasikan riwayat chat dengan backend.

## Pendekatan
Saya membangun aplikasi ini menggunakan `React 19`, `Vite 5`, dan `React Router 6`, serta mengintegrasikan `@google/generative-ai` untuk melakukan streaming respons `Gemini 1.5 Flash` langsung di client. Saya mengimplementasikan fitur unggah gambar multimodal menggunakan ImageKit, mengonfigurasi safety settings pada tingkat `BLOCK_LOW_AND_ABOVE`, mengamankan rute dengan Clerk, dan mengelola sinkronisasi state chat ke MongoDB menggunakan TanStack Query.

## Hasil
- Membangun antarmuka chat responsif yang mendukung streaming respons real-time dan rendering Markdown.
- Mengimplementasikan prompt multimodal dengan integrasi ImageKit untuk percakapan berbasis gambar.
- Mengintegrasikan autentikasi Clerk dan pengelolaan riwayat percakapan pada sidebar yang tersinkronisasi dengan database backend.
