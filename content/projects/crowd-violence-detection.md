---
title: Real-time crowd violence detection
summary:
  en: A detection engine that watches several live CCTV streams at once and flags violent crowd behavior in real time.
  id: Mesin deteksi yang memantau beberapa siaran CCTV sekaligus dan menandai perilaku kekerasan massa secara real-time.
role: { en: AI Engineer, id: AI Engineer }
year: 2026
tags: [YOLO, Temporal Shift Module, ByteTrack, RTSP, Gemini API, Qdrant]
metrics:
  - { value: "−45%", label: { en: compute overhead, id: beban komputasi } }
links:
  repo: https://github.com/harrymardika/tsm-grid-camera
featured: true
order: 2
draft: false
---

## Problem
Security teams cannot watch every camera feed at once, and running heavy models on every frame of every stream is too expensive.

## Approach
Combined YOLO detection with a Temporal Shift Module (TSM) for action recognition over concurrent RTSP streams. A "lazy detection" pipeline splits each frame into a modified 3×3 grid and only processes 5 active cells, while ByteTrack keeps identities consistent. The Google Gemini API adds multimodal reasoning on top of detections, and the multi-agent RAG store was moved from local FAISS to Qdrant for faster semantic queries.

## Result
- 45% less computational overhead with accurate tracking maintained.
- Real-time contextual insights from unstructured live camera feeds.
