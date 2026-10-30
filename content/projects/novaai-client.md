---
title: 'NOVA AI Client: Multimodal AI Chatbot Frontend'
summary:
  en: A `React 19` frontend for NOVA AI, a multimodal AI chatbot that supports real-time streaming responses, image attachments, and conversation history using Google `Gemini 1.5 Flash`.
  id: Frontend `React 19` untuk NOVA AI, sebuah chatbot AI multimodal yang mendukung streaming respons real-time, lampiran gambar, dan riwayat percakapan menggunakan Google `Gemini 1.5 Flash`.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - React
  - Vite
  - Google Gemini
  - Clerk
  - ImageKit
  - JavaScript
metrics: []
links:
  repo: https://github.com/harrymardika/novaai-client
featured: false
draft: false
---

## Problem
I needed to build an interactive frontend client for a multimodal AI chatbot that supports streaming responses, retains conversation context across turns, handles user authentication, and synchronizes saved chats with a backend.

## Approach
I built the application using `React 19`, `Vite 5`, and `React Router 6`, integrating `@google/generative-ai` to stream `Gemini 1.5 Flash` responses directly in the client. I implemented multimodal image upload functionality using ImageKit, configured safety settings to `BLOCK_LOW_AND_ABOVE`, managed authenticated routes using Clerk, and synchronized chat state with MongoDB via TanStack Query.

## Result
- Built a responsive chat interface supporting real-time response streaming and Markdown rendering.
- Implemented multimodal prompting with ImageKit integration for image-based conversation turns.
- Integrated Clerk authentication and sidebar chat history management synced with a backend database.
