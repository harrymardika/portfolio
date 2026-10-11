---
title: IMDB Movie Review Sentiment Classification
summary:
  en: A binary sentiment classification model built with TensorFlow and a Bidirectional LSTM to classify movie reviews as positive or negative.
  id: Model klasifikasi sentimen biner yang dibangun dengan TensorFlow dan Bidirectional LSTM untuk mengklasifikasikan ulasan film sebagai positif atau negatif.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - TensorFlow
  - Keras
  - Python
  - NLTK
  - scikit-learn
  - LSTM
metrics:
  - value: 87.90%
    label:
      en: Best validation accuracy
      id: Akurasi validasi terbaik
  - value: 50,000
    label:
      en: IMDB reviews in dataset
      id: Ulasan IMDB dalam dataset
  - value: '0.3241'
    label:
      en: Validation loss at best epoch
      id: Validation loss pada epoch terbaik
links:
  repo: https://github.com/harrymardika/NLP-BinaryClassification
featured: false
draft: false
---

## Problem
Classifying movie reviews into positive or negative sentiments requires cleaning unstructured natural language text and building a neural network that avoids overfitting on detailed training text.

## Approach
I processed 50,000 IMDB reviews by removing HTML tags and non-alphabetical characters, dropping stopwords, and lemmatizing verbs with NLTK. Using Keras Tokenizer with a vocabulary of 25,000 words, sequences were padded to 100 tokens and trained on an 80/20 train-test split. The model structure consists of an embedding layer, a Bidirectional LSTM with dropout, global max pooling, dense layers with L2 regularization, and a sigmoid output trained with Adam and early stopping.

## Result
- Achieved a best validation accuracy of 87.90% and validation loss of 0.3241 at epoch 3.
- Successfully triggered early stopping at epoch 8 of 20 to halt training and restore the optimal weights from epoch 3.
- Built a complete text processing and classification pipeline capable of correctly predicting positive and negative test review inputs.
