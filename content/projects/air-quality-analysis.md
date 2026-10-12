---
title: Beijing Air Quality Analysis & Dashboard
summary:
  en: I performed exploratory analysis on four years of hourly air-quality data from 12 Beijing stations and delivered an interactive Streamlit dashboard for trend monitoring and alerts.
  id: Saya melakukan analisis eksplorasi data kualitas udara selama empat tahun dari 12 stasiun di Beijing dan membuat dashboard interaktif Streamlit untuk memantau tren serta memberi peringatan.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Python
  - pandas
  - Streamlit
  - Plotly
  - Folium
  - seaborn
metrics:
  - value: 420,768
    label:
      en: hourly records in the dataset
      id: rekaman per jam dalam dataset
  - value: '12'
    label:
      en: monitoring stations
      id: stasiun pemantauan
  - value: 35,064
    label:
      en: records per station
      id: rekaman per stasiun
links:
  repo: https://github.com/harrymardika/air-quality-analysis
featured: false
draft: false
---

## Problem
The city’s air-quality data were scattered across 12 CSV files, making it hard to identify pollution drivers, seasonal patterns, and unsafe levels.

## Approach
I merged the files, cleaned missing values with interpolation and median/mode imputation, performed EDA and correlation analysis, answered six business questions with visualizations, and built a Streamlit app that lets users filter stations, pollutants and dates, apply EMA/SMA smoothing, view alerts, and export data.

## Result
- A cleaned dataset `all_stations_cleaned.csv` containing 420,768 hourly records was generated.
- Exploratory analysis revealed CO, NO2, and SO2 as the strongest drivers of PM2.5 and PM10, and highlighted seasonal temperature and pressure trends.
- Six business questions were answered with charts, including station-wise pollutant distributions and city-vs-suburb comparisons.
- An interactive Streamlit dashboard with Plotly visualizations, EMA/SMA smoothing, threshold alerts, and CSV export was deployed.
