---
title: NOVA AI Backend
summary:
  en: A REST API backend built with Express, Bun, and MongoDB to manage per-user chat histories and authentication for the NOVA AI multimodal chatbot.
  id: Backend REST API yang dibangun dengan Express, Bun, dan MongoDB untuk mengelola riwayat chat per pengguna dan autentikasi pada chatbot multimodal NOVA AI.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Express
  - Bun
  - MongoDB
  - Clerk
  - ImageKit
  - JavaScript
metrics: []
links:
  repo: https://github.com/harrymardika/novaai-backend
featured: false
draft: false
---

## Problem
Multimodal AI applications require secure user authentication, persistent chat session storage, and media integration so users can maintain conversation context across sessions without compromising data access control.

## Approach
I built an Express API using Bun and MongoDB with Mongoose models to handle per-user conversation histories. I integrated Clerk to enforce user-level access controls across all chat routes and added ImageKit endpoint signatures for direct client-side image uploads. I also set up the Express application to serve static frontend production assets for streamlined deployment on Vercel.

## Result
- Built protected REST endpoints for creating, listing, updating, and deleting per-user chat histories using Clerk authentication.
- Structured MongoDB data models for managing conversation histories with auto-generated chat titles based on initial messages.
- Implemented signed ImageKit parameter generation to support image uploads for multimodal prompt interactions.
- Configured static asset serving to enable single-deployment hosting on Vercel.
