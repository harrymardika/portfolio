---
title: Netflix Prize data warehouse & recommender
summary:
  en: I built a full-stack data pipeline that ingests the Netflix Prize dataset, stores it in a PostgreSQL star schema, and trains collaborative-filtering models for movie recommendations.
  id: Saya membangun pipeline data end-to-end yang mengolah dataset Netflix Prize, menyimpannya dalam star schema PostgreSQL, dan melatih model collaborative-filtering untuk rekomendasi film.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Apache Spark
  - PostgreSQL
  - PySpark
  - Scikit-Learn
  - Spark MLlib
  - Docker
metrics:
  - value: 100M+
    label:
      en: total rating records
      id: total rating records
  - value: 480K+
    label:
      en: unique customers
      id: unique customers
  - value: 17K+
    label:
      en: unique movies
      id: unique movies
links:
  repo: https://github.com/harrymardika/netflix-big-data-analytics
featured: false
draft: false
---

## Problem
The streaming industry generates massive interaction logs that need to be transformed into a clean, queryable warehouse to enable data-driven decisions, personalization, and content optimization.

## Approach
I designed a resumable ETL pipeline with PySpark that extracts, transforms, and loads 100M+ ratings into a dimensional PostgreSQL warehouse, then implemented both a Scikit-Learn TruncatedSVD baseline and a Spark MLlib ALS model, adding graph analytics for community detection.

## Result
- Implemented a production-grade, resumable ETL pipeline with automatic checkpointing to safely process the full dataset.
- Created a star-schema PostgreSQL data warehouse optimized for analytical queries.
- Trained collaborative-filtering models (TruncatedSVD and ALS) and evaluated them with MAE, MSE, RMSE, etc.
- Performed graph analytics to identify movie communities, hub movies, and co-viewing patterns.
- Provided Docker-Compose scripts for one-click deployment of the entire stack.
