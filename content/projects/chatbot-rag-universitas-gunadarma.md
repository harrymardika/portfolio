---
title: Chatbot RAG Universitas Gunadarma
summary:
  en: I built a Retrieval-Augmented Generation chatbot that delivers accurate, source-cited academic information for Universitas Gunadarma through both a React web app and a Chainlit interface.
  id: Saya membangun chatbot berbasis Retrieval-Augmented Generation yang menyajikan informasi akademik Universitas Gunadarma secara akurat dengan referensi sumber melalui antarmuka web React dan Chainlit.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - FastAPI
  - React
  - TypeScript
  - Docker
  - LangChain
metrics: []
links:
  repo: https://github.com/harrymardika/gunadarma-ai
featured: false
draft: false
---

## Problem
Students, faculty, and staff often struggle to find reliable, up-to-date campus information, and large language models tend to hallucinate when answering without grounding in university-specific data.

## Approach
I designed a modular RAG pipeline that crawls official university sites, chunks and indexes the content, and combines vector similarity with TF-IDF keyword search. The backend, built with FastAPI, LangChain, and Google Generative AI, runs asynchronously and caches frequent query-answer pairs. Two frontends— a React + TypeScript app and a Chainlit UI—consume the API via REST and WebSocket, providing real-time, source-attributed responses, all containerized with Docker Compose for production readiness.

## Result
- Implemented a full RAG pipeline with automated web crawling, chunking, and hybrid (vector + TF-IDF) search.
- Added semantic caching to reduce latency and LLM API costs for frequent queries.
- Provided both a React/TypeScript web client and a Chainlit Python UI for flexible user experiences.
- Exposed a FastAPI RESTful and WebSocket API that returns answers with source citations.
- Containerized all services with Docker Compose, enabling easy deployment and scaling.
