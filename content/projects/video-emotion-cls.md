---
title: Video Emotion Classification for Satria Data 2025
summary:
  en: Developed a multimodal video emotion classification system for the Satria Data 2025 competition using ensemble learning on video, audio, and text features.
  id: Mengembangkan sistem klasifikasi emosi video multimodal untuk kompetisi Satria Data 2025 menggunakan ensemble learning dari fitur video, audio, dan teks.
role:
  en: Project Lead & Data Scientist
  id: Ketua Proyek & Data Scientist
year: 2025
tags:
  - Python
  - CatBoost
  - Machine Learning
  - Jupyter Notebook
  - Feature Engineering
  - Multimodal AI
metrics:
  - value: 41%
    label:
      en: Validation Accuracy
      id: Akurasi Validasi
  - value: '0.254'
    label:
      en: F1-Score
      id: F1-Score
  - value: '803'
    label:
      en: Training Samples
      id: Sampel Data Latih
links:
  repo: https://github.com/harrymardika/video-emotion-cls
featured: false
draft: false
---

## Problem
Classifying human emotions into 8 distinct categories from Instagram reels content is challenging due to the complex nature of multimodal data (video, audio, text) and severe class imbalance, with the 'Surprise' category comprising roughly 50% of the dataset.

## Approach
I built a multimodal processing pipeline to extract visual, audio (MFCC and spectral), and text transcription features from 803 training samples. I then developed and tuned machine learning models, primarily leveraging CatBoost and ensemble voting techniques evaluated with stratified cross-validation.

## Result
- Achieved a validation accuracy of 41% and an F1-score of 0.254 using an ensemble Voting Classifier.
- Designed an end-to-end processing pipeline covering feature extraction across audio, video, and text data.
- Built dedicated workflows for automated data labeling and submission analysis to analyze model performance across emotion classes.
