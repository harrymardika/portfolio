---
title: Javanese script (Aksara Jawa) classification
summary:
  en: My undergraduate thesis. A fine-tuned YOLO26 classifier for the 20 basic Javanese characters, with a visual look inside how its convolution filters learn.
  id: Skripsi saya. Klasifikasi 20 karakter dasar aksara Jawa dengan YOLO26 yang di-fine-tune, disertai visualisasi cara filter konvolusinya belajar.
role: { en: Researcher (thesis), id: Peneliti (skripsi) }
year: 2026
tags: [YOLO26, PyTorch, Computer Vision, Interpretability]
metrics:
  - { value: "96%", label: { en: test accuracy (25 images), id: akurasi uji (25 citra) } }
  - { value: "99.6%", label: { en: peak validation accuracy, id: akurasi validasi puncak } }
links:
  repo: https://github.com/harrymardika/aksara-jawa
featured: false
draft: false
---

## Problem
Many Javanese characters share nearly identical strokes, so a classifier can be right for the wrong reasons. Accuracy alone does not show what the model actually learned.

## Approach
Fine-tuned the YOLO26 nano classification model in PyTorch on the 20 basic characters, with automatic dataset preprocessing, mixed precision, and class weighting for imbalanced data. During training, the weights of every convolution layer were recorded each epoch to trace how the kernels evolve, how each block transforms the input, and how softmax confidence shifts between look-alike characters.

## Result
- 96% accuracy and 0.97 macro F1 on a held-out test set of 25 images across the 20 characters, with 99.6% peak validation accuracy. The test set is small, so a single sample can move a per-class score noticeably.
- Visual tools that make the network's learning process inspectable, epoch by epoch.
- Successfully defended as my undergraduate thesis at Universitas Gunadarma: “Klasifikasi Aksara Jawa Berbasis YOLO26 dengan Visualisasi dan Interpretasi Filter Konvolusi” (Javanese Script Classification Based on YOLO26 with Visualization and Interpretation of Convolution Filters).

