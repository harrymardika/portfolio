---
title: Netflix Prize data warehouse & recommender
summary:
  en: I built an end-to-end data pipeline that ingests the Netflix Prize dataset into a PostgreSQL star-schema warehouse and trains collaborative-filtering models for movie recommendations.
  id: Saya membangun pipeline data end-to-end yang mengolah dataset Netflix Prize ke dalam data warehouse berbentuk star-schema di PostgreSQL dan melatih model collaborative-filtering untuk rekomendasi film.
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
      en: Total ratings
      id: Total rating records
  - value: 480K+
    label:
      en: Unique customers
      id: Unique customers
  - value: 17K+
    label:
      en: Unique movies
      id: Unique movies
links:
  repo: https://github.com/harrymardika/netflix-big-data-analytics
featured: false
draft: false
---

## Problem
The streaming industry needs a reliable way to transform massive raw rating logs into a structured warehouse that supports analytics, personalization, churn prediction, and content optimization.

## Approach
I implemented a resumable ETL pipeline with PySpark that extracts, transforms, and loads 100M+ ratings into a dimensional PostgreSQL schema, adding automatic checkpointing and Docker support. Then I trained collaborative-filtering models—Scikit-Learn TruncatedSVD for a local baseline and Spark MLlib ALS for scalable recommendations—plus graph analytics for community detection.

## Result
- A production-grade, resumable ETL pipeline that processes the full Netflix Prize dataset into a star-schema PostgreSQL warehouse.
- Automatic checkpointing enables safe restarts without duplicate data loads.
- Collaborative-filtering models (SVD and ALS) trained on the warehouse data, ready for generating personalized movie recommendations.
- Graph analytics identify movie communities, hub movies, and co-viewing patterns.
- Dockerized setup allows the entire pipeline and modeling environment to be deployed locally in minutes.
