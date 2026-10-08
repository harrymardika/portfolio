---
title: Netflix Prize Data Warehouse & Recommendation System
summary:
  en: An end-to-end data engineering and machine learning project that processes over 100 million movie ratings to build a scalable recommendation system using Apache Spark and PostgreSQL.
  id: Proyek data engineering dan machine learning end-to-end yang memproses lebih dari 100 juta rating film untuk membangun sistem rekomendasi yang skalabel menggunakan Apache Spark dan PostgreSQL.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Apache Spark
  - PySpark
  - PostgreSQL
  - Docker
  - Python
  - Scikit-Learn
metrics: []
links:
  repo: https://github.com/harrymardika/netflix-big-data-analytics
featured: false
draft: false
---

## Problem
Processing massive datasets like the Netflix Prize dataset, which contains over 100 million movie ratings, requires a robust and scalable infrastructure. Raw rating data must be validated, transformed, and organized into an optimized data warehouse schema before it can be effectively utilized for large-scale recommendation modeling without performance bottlenecks.

## Approach
I built a modular system split into a data ingestion pipeline and a recommendation modeling engine. For data ingestion, I used `Apache Spark 3.5` with PySpark to extract, validate, and load raw data into a `PostgreSQL 12` star schema data warehouse, implementing a resumable checkpoint system. For modeling, I trained collaborative filtering models using Scikit-Learn (SVD) and Spark MLlib (ALS) within a `Python 3.11` environment, utilizing Docker to simplify database deployment.

## Result
- Developed a production-grade ETL pipeline using `Apache Spark 3.5` to efficiently ingest and process over 100 million ratings.
- Designed and implemented an analytical star schema data warehouse in `PostgreSQL 12` with dimensional tables for customers, movies, and dates.
- Built scalable collaborative filtering recommendation models using Matrix Factorization (SVD) and Spark MLlib ALS algorithms.
- Created a resumable pipeline checkpoint system to ensure data ingestion reliability and prevent data loss during processing runs.
