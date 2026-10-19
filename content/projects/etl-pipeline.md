---
title: ETL Pipeline for E-Commerce Fashion Product Data
summary:
  en: A modular Python ETL pipeline that scrapes fashion product data from e-commerce pages, cleans and transforms it, and loads structured datasets into CSV, Google Sheets, and PostgreSQL.
  id: Pipeline ETL Python modular yang melakukan scraping data produk fashion dari halaman e-commerce, membersihkan dan mentransformasikannya, lalu memuat dataset terstruktur ke CSV, Google Sheets, dan PostgreSQL.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - Pandas
  - BeautifulSoup
  - PostgreSQL
  - Google Sheets API
  - pytest
metrics: []
links:
  repo: https://github.com/harrymardika/etl-pipeline
featured: false
draft: false
---

## Problem
Gathering product details across e-commerce pages often results in unstructured, noisy data containing missing fields, inconsistent formatting, and mixed currencies. To make this data usable for downstream analysis, I needed an automated system to scrape raw product information, standardize attributes, apply business logic, and deliver clean data to multiple storage targets.

## Approach
I built an end-to-end ETL pipeline in `Python 3.9` structured into extraction, transformation, and loading modules. For extraction, I used Requests and BeautifulSoup with pagination support to collect product attributes. In the transformation step, I used Pandas to strip whitespace, handle missing or invalid fields, convert prices from USD to IDR, insert timezone-aware processing timestamps, remove duplicates, and enforce a strict schema. For loading, I created configurable writers for local CSV files, Google Sheets via gspread, and PostgreSQL via psycopg2, fully covered by unit tests in pytest.

## Result
- Built an automated web scraper capable of traversing paginated catalog pages to extract complete product details.
- Implemented flexible transformation workflows for currency conversion, null value filtering, deduplication, and schema enforcement.
- Supported configurable multi-target data loading into CSV files, Google Sheets, and PostgreSQL tables via environment variables.
- Created unit tests with test coverage reporting using `pytest` and `pytest-cov`.
