---
title: FIFA World Cup Match Prediction & Tournament Simulation
summary:
  en: A machine learning pipeline that predicts international football results from rankings and recent form, then simulates a whole World Cup tournament.
  id: Pipeline machine learning yang memprediksi hasil pertandingan sepak bola internasional dari peringkat dan performa terkini, lalu mensimulasikan seluruh turnamen Piala Dunia.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - pandas
  - scikit-learn
  - NetworkX
  - Matplotlib
  - seaborn
metrics:
  - value: 70.50%
    label:
      en: Random Forest test accuracy
      id: akurasi uji Random Forest
  - value: 84.34%
    label:
      en: Random Forest training accuracy
      id: akurasi pelatihan Random Forest
  - value: 45,315
    label:
      en: International match records in dataset
      id: catatan pertandingan internasional dalam dataset
links:
  repo: https://github.com/harrymardika/prediction-world-cup
featured: false
draft: false
---

## Problem
Predicting the outcome of World Cup matches is challenging due to limited data and the need to account for team strength and recent performance, and I wanted to extend those predictions to a full tournament simulation.

## Approach
I filtered matches from August 2018 onward, merged daily FIFA rankings, engineered features describing recent form for each team, and trained Gradient Boosting and Random Forest models with GridSearchCV. The best Random Forest (max_depth=10, max_features='sqrt', etc.) was used to predict each match twice (team swap) and the higher average probability determined the winner, with draws handled as ties. The tournament bracket was built and simulated using NetworkX.

## Result
- Achieved 70.50% test accuracy with the Random Forest model on 3,695 engineered matches.
- Training accuracy reached 84.34% for the same model.
- Processed a dataset of 45,315 international results spanning 1872-2023, focusing on 4,889 matches since August 2018 for feature engineering.
- Simulated the 2026 World Cup using 2022 group composition, predicting group winners (Netherlands, England, Argentina, France, Spain, Belgium, Brazil, Portugal) and a final where England beats Argentina with 0.54 probability.
- Implemented the full pipeline in a Jupyter Notebook, leveraging pandas, scikit-learn, and NetworkX for data processing, modeling, and bracket simulation.
