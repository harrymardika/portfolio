---
title: Gold Price Prediction (1994–2023)
summary:
  en: A machine learning project evaluating over 70 model configurations to predict annual gold prices based on macroeconomic factors and commodity prices spanning 30 years.
  id: Proyek machine learning yang mengevaluasi lebih dari 70 konfigurasi model untuk memprediksi harga emas tahunan berdasarkan faktor makroekonomi dan harga komoditas selama 30 tahun.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - PyCaret
  - scikit-learn
  - XGBoost
  - CatBoost
  - Pandas
metrics:
  - value: '0.9899'
    label:
      en: Best R² score (Lasso LARS)
      id: Skor R² terbaik (Lasso LARS)
  - value: 3.16%
    label:
      en: MAPE of top linear model
      id: MAPE model linier terbaik
  - value: 70+
    label:
      en: Model configurations evaluated
      id: Konfigurasi model dievaluasi
links:
  repo: https://github.com/harrymardika/gold-price-prediction
featured: false
draft: false
---

## Problem
Analyzing and predicting gold price movements over long time horizons requires modeling interactions between macroeconomic indicators and commodity markets. The goal was to build and compare machine learning regression models on a 30-year historical dataset from 1994 to 2023.

## Approach
I worked with a 30-year dataset containing 15 variables, including interest rates, inflation, exchange rates, and commodity prices such as silver, nickel, and CPO. I conducted exploratory data analysis, engineered features using PCA and statistical feature selection, and tested over 70 linear and tree-based model configurations using PyCaret and scikit-learn with cross-validation and hyperparameter tuning.

## Result
- Achieved a top R² score of 0.9899 and MAPE of 3.16% with Lasso Least Angle Regression using all dataset variables.
- Identified Gradient Boosting Regressor as the top-performing tree model with an R² score of 0.9609.
- Saved the trained linear and tree-based models along with preprocessing objects for deployment.
