---
title: Multi-Class Scientific Image Classification with Transfer Learning
summary:
  en: Built and evaluated a 6-class scientific image classifier using MobileNetV2 transfer learning, reaching high test accuracy and exporting the model for web and edge deployment.
  id: Membangun dan mengevaluasi model klasifikasi citra ilmiah 6 kelas menggunakan transfer learning MobileNetV2, mencapai akurasi pengujian tinggi serta mengekspornya untuk deployment web dan edge.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - TensorFlow
  - Keras
  - MobileNetV2
  - Transfer Learning
  - TensorFlow Lite
  - TensorFlow.js
metrics:
  - value: 96.34%
    label:
      en: Test accuracy across 6 classes
      id: Akurasi pengujian pada 6 kelas
links:
  repo: https://github.com/harrymardika/scientific-image-classification
featured: false
draft: false
---

## Problem
Scientific image analysis requires distinguishing between specialized visual categories such as Blot-Gel, FACS, Histopathology, Macroscopy, Microscopy, and non-scientific images, which can suffer from class imbalance across raw datasets.

## Approach
I developed an end-to-end pipeline in `Python 3.9` and `TensorFlow 2.10` using `main.ipynb`. I sampled majority classes to 2,000 images each, constructed an optimized data pipeline with augmentation using `tf.data`, and applied transfer learning with a pre-trained MobileNetV2 backbone. I managed training with EarlyStopping and ReduceLROnPlateau callbacks and converted the trained model into SavedModel, TF-Lite, and TensorFlow.js formats.

## Result
- Achieved approximately 96.34% test accuracy across all 6 scientific image categories.
- Balanced the dataset by capping overrepresented classes at 2,000 samples each.
- Successfully exported model artifacts into SavedModel, TensorFlow Lite, and TensorFlow.js formats for varied deployment scenarios.
