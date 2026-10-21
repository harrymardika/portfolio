---
title: Facial Expression Recognition (FER) Classification
summary:
  en: Implemented a CNN-based system that classifies seven basic facial emotions from 48×48 grayscale images, achieving up to 59.3% accuracy. The project also compares a custom baseline model with a MobileNetV2 transfer-learning approach.
  id: Membangun sistem berbasis CNN untuk mengklasifikasikan tujuh emosi wajah dari gambar grayscale 48×48, mencapai akurasi hingga 59,3%. Proyek ini juga membandingkan model baseline dengan pendekatan transfer learning MobileNetV2.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - TensorFlow
  - Convolutional Neural Networks
  - Transfer Learning
  - MobileNetV2
  - Jupyter Notebook
metrics:
  - value: 59.3%
    label:
      en: baseline CNN accuracy
      id: akurasi baseline CNN
  - value: '0.60'
    label:
      en: overall precision
      id: presisi keseluruhan
  - value: '0.59'
    label:
      en: overall F1-score
      id: skor F1 keseluruhan
links:
  repo: https://github.com/harrymardika/facial-expression-recognition
featured: false
draft: false
---

## Problem
I needed to build a model that can recognize human facial expressions from low-resolution, grayscale images, while dealing with an imbalanced dataset and limited computational resources.

## Approach
I designed two pipelines: a lightweight custom CNN trained directly on the 48×48 grayscale FER dataset, and a transfer-learning pipeline using MobileNetV2 pretrained on ImageNet. Both models were trained, evaluated with classification reports and confusion matrices, and the best-performing model was saved for inference.

## Result
- Baseline CNN reached 59.3% accuracy, outperforming the MobileNetV2 transfer-learning model (54.7%).
- The model achieved an overall precision of 0.60 and an F1-score of 0.59 across the seven emotion classes.
- Detailed per-class analysis identified Happy and Surprise as the easiest to detect and Fear and Disgust as the most challenging due to class imbalance.
- The study highlighted why a simple CNN outperformed a complex pretrained network on this domain-specific, grayscale dataset.
- Recommendations were provided for fine-tuning, data augmentation, and class-weighting to further improve performance.
