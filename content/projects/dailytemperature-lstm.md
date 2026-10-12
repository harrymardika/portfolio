---
title: Daily Temperature Forecasting in Japan with Stacked LSTM
summary:
  en: Built a time series forecasting model using a five-layer stacked LSTM in TensorFlow/Keras to predict daily average temperatures in Japan based on historical 100-day sequence windows.
  id: Membangun model prakiraan time series menggunakan stacked LSTM lima layer di TensorFlow/Keras untuk memprediksi suhu harian rata-rata di Jepang berdasarkan jendela sekuensi 100 hari sebelumnya.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - TensorFlow
  - Keras
  - Python
  - pandas
  - scikit-learn
  - NumPy
metrics:
  - value: '0.0497'
    label:
      en: Training MAE (min-max scaled)
      id: MAE Pelatihan (skala min-max)
  - value: '0.0440'
    label:
      en: Validation MAE (min-max scaled)
      id: MAE Validasi (skala min-max)
  - value: 27,798
    label:
      en: Japan daily temperature records
      id: Catatan suhu harian Jepang
links:
  repo: https://github.com/harrymardika/DailyTemperature-LSTM
featured: false
draft: false
---

## Problem
I needed to forecast daily average temperatures in Japan using historical time series weather data. The source dataset contained millions of global records with missing values and outliers that required clean preprocessing and sequence structuring for neural network modeling.

## Approach
I filtered 27,798 records for Japan, removed outliers and missing values with the IQR rule, and split the data chronologically into train, validation, and test sets. Using MinMaxScaler, I built 100-day windows to train a 5-layer stacked LSTM network (64-128-256-128-64 units) with Dropout layers, Huber loss, and the Adam optimizer. I implemented callbacks for early stopping, model checkpointing, learning rate reduction, and a custom MAE threshold trigger.

## Result
- Achieved a training MAE of 0.0497 and a validation MAE of 0.0440 on min-max scaled temperature data.
- Reached the target threshold of under 0.05 MAE on both training and validation sets, automatically stopping training at epoch 34 of 100.
- Evaluated model predictions against actual temperature values across a test set of 5,540 records.
