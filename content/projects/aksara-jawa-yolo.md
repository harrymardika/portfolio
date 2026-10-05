---
title: Javanese script (Aksara Jawa) classification
summary:
  en: My undergraduate thesis. A fine-tuned YOLO26 classifier for the 20 basic Javanese characters, with a visual look inside how its convolution filters learn.
  id: Skripsi saya. Klasifikasi 20 karakter dasar aksara Jawa dengan YOLO26 yang di-fine-tune, disertai visualisasi cara filter konvolusinya belajar.
role: { en: Researcher (thesis), id: Peneliti (skripsi) }
year: 2026
tags: [YOLO26, PyTorch, Computer Vision, Interpretability]
metrics: []
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
- A working classifier evaluated with per-class precision, recall, and F1.
- Visual tools that make the network's learning process inspectable, epoch by epoch.
- Successfully defended as my undergraduate thesis at Universitas Gunadarma.

<!-- TODO(owner): add the final test accuracy and a sample visualization. -->
