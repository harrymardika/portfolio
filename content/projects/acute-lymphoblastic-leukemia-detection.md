---
title: Acute lymphoblastic leukemia detection
summary:
  en: I built an end-to-end AI solution that trains and compares three deep-learning models for ALL detection and deploys a Streamlit web app for real-time blood-cell classification.
  id: Saya membangun solusi AI lengkap yang melatih dan membandingkan tiga model deep learning untuk deteksi ALL serta menyajikannya lewat aplikasi Streamlit untuk klasifikasi sel darah secara real-time.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - TensorFlow
  - Keras
  - Streamlit
  - MobileNetV2
  - VGG16
  - scikit-learn
metrics:
  - value: 98.62%
    label:
      en: Accuracy of VGG16 Fine-Tune model
      id: Akurasi model VGG16 Fine-Tune
  - value: 98.31%
    label:
      en: Accuracy of VGG16 Baseline model
      id: Akurasi model VGG16 Baseline
  - value: 95.0%
    label:
      en: Accuracy of custom CNN model
      id: Akurasi model CNN Custom
links:
  repo: https://github.com/harrymardika/leukimia-detection
featured: false
draft: false
---

## Problem
I needed an automated, high-accuracy method to classify peripheral blood smear images into benign and three ALL subtypes, enabling faster and non-invasive screening in clinical settings.

## Approach
I collected a publicly sourced dataset of 3,256 PBS images, performed augmentation, and trained three architectures—VGG16 fine-tuned, VGG16 baseline, and a lightweight custom CNN—using TensorFlow/Keras. After evaluating accuracy, parameters, and inference speed, I selected the baseline VGG16 for production and the CNN for edge deployment. I then packaged the best model into a modular Streamlit application that loads a MobileNetV2 + CBAM model, processes uploaded images, and visualizes confidence scores with Plotly.

## Result
- Trained three deep-learning classifiers (VGG16 Fine-Tune, VGG16 Baseline, custom CNN) achieving up to 98.62% accuracy.
- Developed a lightweight CNN with only 127 K parameters suitable for mobile/edge deployment while maintaining 95% accuracy.
- Packaged the VGG16 Baseline model for clinical production integration.
- Built a modular Streamlit dashboard that loads the MobileNetV2 + CBAM model and provides real-time blood-cell classification with confidence visualizations.
- Organized the codebase with clean architecture, enabling easy extension and reproducible training pipelines.
