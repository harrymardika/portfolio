---
title: Indonesian Worker Welfare Pattern Analysis
summary:
  en: A machine learning project that combines unsupervised clustering and supervised classification to segment Indonesian provinces by worker welfare metrics and predict economic groupings.
  id: Proyek machine learning yang menggabungkan unsupervised clustering dan supervised classification untuk memetakan provinsi di Indonesia berdasarkan indikator kesejahteraan pekerja.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - Scikit-learn
  - Pandas
  - NumPy
  - Jupyter
  - Matplotlib
metrics:
  - value: '0.719'
    label:
      en: KMeans Silhouette Score across 9 Clusters
      id: Skor Silhouette KMeans pada 9 Klaster
  - value: '1.0'
    label:
      en: F1-Score across Classification Models
      id: F1-Score pada Model Klasifikasi
links:
  repo: https://github.com/harrymardika/social-welfare-pattern-analysis
featured: false
draft: false
---

## Problem
Understanding worker welfare across Indonesian provinces requires analyzing complex relationships between minimum wages, average hourly wages, poverty lines, and per-capita spending. Standard summary statistics fail to capture distinct regional economic patterns and the urban-rural divide.

## Approach
I integrated four regional socioeconomic datasets and preprocessed the data using KNN imputation and MinMax scaling. I evaluated KMeans, Agglomerative, and DBSCAN clustering algorithms, selecting KMeans with 9 clusters based on silhouette score and elbow analysis. I then built and tuned classification models—including Random Forest, SVM, and Gradient Boosting—to predict cluster membership and evaluate feature importances.

## Result
- Achieved a silhouette score of 0.719 with 9 distinct economic clusters using KMeans.
- Built Random Forest, SVM, and Gradient Boosting classification models achieving 1.0 accuracy and F1-score on predicting economic cluster membership.
- Identified key findings, showing that higher minimum wages do not always increase regional purchasing power and that spending patterns differ significantly between urban and rural areas.
