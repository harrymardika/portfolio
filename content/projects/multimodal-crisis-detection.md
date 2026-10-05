---
title: Multimodal crisis-detection model
summary:
  en: A research model that fuses facial emotion, body pose, and speech sentiment to detect early suicide-risk signals, running on a 2-watt edge chip.
  id: Model riset yang menggabungkan emosi wajah, pose tubuh, dan sentimen suara untuk mendeteksi tanda awal risiko bunuh diri, berjalan di chip edge 2 watt.
role: { en: AI Researcher, id: Peneliti AI }
year: 2025
tags: [MobileNetV3, Multimodal AI, NLP, Edge AI, Hailo-8L, Quantization]
metrics:
  - { value: "92.5%", label: { en: "accuracy (AUC 0.96)", id: "akurasi (AUC 0,96)" } }
  - { value: "5–8 ms", label: { en: latency on Hailo-8L, id: latensi di Hailo-8L } }
  - { value: "−35%", label: { en: false negatives, id: false negative } }
links: {}
featured: true
order: 3
draft: false
---

## Problem
Early warning signs of a mental-health crisis show up across face, posture, and voice at the same time, and a single-signal model misses too many cases.

## Approach
Optimized MobileNetV3 CNNs for facial emotion and body pose, a high-recall NLP pipeline for Indonesian speech, and a precision-tuned fusion mechanism. Trained on 11k+ images and 1k+ transcripts, then quantized to 8-bit and compiled to HEF for the Hailo-8L accelerator.

## Result
- 92.5% accuracy, AUC 0.96, F1 0.92.
- 35% fewer life-critical false negatives.
- 5–8 ms latency at 30+ FPS on about 2 W, 300–500% faster than CPU; model size reduced by 40% with no accuracy drop.
