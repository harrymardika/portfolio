---
title: Sentiment Analysis for Hatred Speech Detection
summary:
  en: A comprehensive deep learning project comparing BERT, RNN, LSTM, and Deep CNN architectures for sentiment analysis and hate speech detection on Twitter data.
  id: Proyek deep learning komprehensif yang membandingkan arsitektur BERT, RNN, LSTM, dan Deep CNN untuk analisis sentimen dan deteksi ujaran kebencian pada data Twitter.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - PyTorch
  - TensorFlow
  - BERT
  - NLP
  - Python
  - Keras
metrics:
  - value: 31,962
    label:
      en: training samples
      id: sampel pelatihan
  - value: 17,197
    label:
      en: test samples
      id: sampel pengujian
links:
  repo: https://github.com/harrymardika/sentiment-analysis-hatred-speech
featured: false
draft: false
---

## Problem
Social media platforms contain massive volumes of user-generated content that require fast, automated moderation to filter out hate speech and analyze public sentiment. To build an effective moderator, there is a need to systematically preprocess messy social media text and compare different deep learning architectures to determine which model handles context and sequence dependencies best.

## Approach
I built a text preprocessing pipeline utilizing libraries like NLTK, contractions, and emoji to clean raw tweets by expanding contractions, converting emojis to text, and applying lemmatization. I labeled the dataset using the VADER sentiment analyzer to balance the classes with 6,000 samples per sentiment, and then trained and compared four different architectures: fine-tuned BERT (PyTorch), RNN, LSTM, and Deep CNN (TensorFlow/Keras).

## Result
- Developed a robust preprocessing pipeline that handles social media-specific text issues including contractions, emojis, URLs, mentions, and lemmatization.
- Created a balanced dataset of 6,000 samples per sentiment class using VADER sentiment automatic labeling.
- Implemented and compared four distinct deep learning architectures (BERT, LSTM, Deep CNN, and RNN) for tweet classification.
