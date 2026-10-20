---
title: Bitcoin Price Prediction with LSTM and CNN-LSTM
summary:
  en: I developed a Jupyter Notebook that preprocesses 3,380 days of Bitcoin OHLCV data, engineers features, and trains both LSTM and hybrid CNN-LSTM models to forecast daily closing prices.
  id: Saya membuat notebook Jupyter yang membersihkan 3.380 data harian Bitcoin, menambah fitur, dan melatih model LSTM serta CNN-LSTM hybrid untuk memprediksi harga penutupan harian.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - Jupyter Notebook
  - LSTM
  - CNN-LSTM
  - Deep Learning
  - Time Series
metrics: []
links:
  repo: https://github.com/harrymardika/bitcoin-prediction
featured: false
draft: false
---

## Problem
Bitcoin’s extreme price volatility makes accurate short-term forecasting essential for traders, investors, and institutions, yet its non-linear and non-stationary behavior poses a significant modeling challenge.

## Approach
I cleaned the historical OHLCV CSV (1 Jan 2016 – 2 May 2025), performed feature engineering (lags, rolling statistics, date-based features), and built two deep-learning pipelines: a standard LSTM and a hybrid CNN-LSTM that extracts local patterns before temporal modeling. Both models were trained and evaluated on the same train-test split.

## Result
- Built a cleaned dataset of 3,380 rows with 21 engineered features.
- Implemented and trained both a standard LSTM model and a hybrid CNN-LSTM model using the same training data.
- Evaluated both models on a held-out test set using MAE, RMSE, and MAPE, enabling quantitative comparison.
- Visualized predictions versus actual closing prices to assess forecasting quality.
