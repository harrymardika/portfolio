---
title: Coinbase Review Sentiment Analysis
summary:
  en: An end-to-end sentiment analysis pipeline for Coinbase app reviews that compares classic ML and deep learning models to pick the most accurate classifier.
  id: Pipeline analisis sentimen lengkap untuk ulasan aplikasi Coinbase yang membandingkan model ML klasik dan deep learning untuk memilih classifier paling akurat.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - TensorFlow
  - Scikit-learn
  - XGBoost
  - LightGBM
  - FastText
metrics: []
links:
  repo: https://github.com/harrymardika/coinbase-sentiment-analysis
featured: false
draft: false
---

## Problem
Understanding user sentiment in Coinbase Play Store reviews is essential for product decisions, but the raw data is noisy and unbalanced, making manual analysis impractical.

## Approach
I scraped 30 k+ reviews, cleaned and lemmatized the text, labeled sentiment with VADER and rating thresholds, balanced the classes to 10 k samples each, extracted TF-IDF and FastText embeddings, trained ANN, CNN, Random Forest, XGBoost, and LightGBM models, and selected the best performer based on validation and test accuracy.

## Result
- Achieved 92.63% test accuracy with LightGBM, surpassing the 92% target.
- Balanced dataset with 10 k samples per sentiment class for robust training.
- Implemented a reusable Jupyter notebook pipeline covering scraping, cleaning, labeling, feature extraction, model training, evaluation, and inference.
- Compared classic ML (RF, XGBoost, LightGBM) and deep learning (ANN, CNN) models, documenting performance trade-offs.
- Provided a `predict_sentiment` function for easy inference on new review texts.
