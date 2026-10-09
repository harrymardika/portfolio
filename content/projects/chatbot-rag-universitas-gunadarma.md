---
title: Chatbot RAG Universitas Gunadarma
summary:
  en: A production-ready, RAG-based chatbot system designed to provide accurate, context-aware academic information for Universitas Gunadarma, reducing LLM hallucinations through university-specific grounded data.
  id: Sistem chatbot berbasis RAG siap produksi yang dirancang untuk menyediakan informasi akademik Universitas Gunadarma secara akurat dan kontekstual, mengurangi halusinasi LLM menggunakan data terverifikasi.
role:
  en: Developer
  id: Pengembang
year: 2025
tags:
  - FastAPI
  - LangChain
  - React
  - TypeScript
  - Docker
  - Google Generative AI
metrics: []
links:
  repo: https://github.com/harrymardika/gunadarma-ai
featured: false
draft: false
---

## Problem
Accessing fast and accurate academic information is a common challenge in university environments. Large Language Models (LLMs) often hallucinate when asked about specific campus rules, schedules, and procedures, leading to unreliable answers.

## Approach
I built a complete Retrieval-Augmented Generation (RAG) pipeline consisting of an automated web crawler to gather verified university data, a FastAPI backend using LangChain and Google Generative AI for processing, and multiple frontend options (React and Chainlit). I implemented hybrid search (vector embeddings combined with TF-IDF keyword search) to improve document relevance, integrated semantic caching to reduce latency and API costs, and structured the system with Clean Architecture and Docker containerization.

## Result
- Developed a containerized RAG-based chatbot with a production-ready FastAPI backend and scalable Docker Compose orchestration.
- Built two responsive frontends: a modern React web application with TypeScript and a Python-based Chainlit interface.
- Implemented hybrid search merging vector similarity with TF-IDF keyword matching to deliver highly relevant academic documents.
- Integrated semantic caching to store frequent query-answer pairs, effectively minimizing API response latency.
- Created an automated web crawler that periodically updates the system's knowledge base from official university sites.
