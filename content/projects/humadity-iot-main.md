---
title: Humidity IoT System
summary:
  en: An end-to-end IoT system that reads temperature and humidity data using an ESP32 and DHT11 sensor, transmitting telemetry to a Flask REST API and MQTT broker.
  id: Sistem IoT end-to-end yang membaca data suhu dan kelembapan menggunakan ESP32 dan sensor DHT11, lalu mengirimkan telemetri ke REST API Flask dan broker MQTT.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - ESP32
  - Flask
  - Python
  - C++
  - MQTT
  - Arduino
metrics: []
links:
  repo: https://github.com/harrymardika/humadity_IoT-main
featured: false
draft: false
---

## Problem
For an assignment in SIC 5, I needed to build a connected hardware telemetry system that reads ambient environmental conditions and makes real-time data accessible to external applications.

## Approach
I wrote C++ firmware for an ESP32 to collect temperature and humidity readings from a DHT11 sensor on GPIO 4, handle NTP timestamping, and send HTTP POST requests every 2 seconds via an ngrok tunnel. On the backend, I built a modular Python Flask REST API with CORS support to maintain the latest sensor reading in memory, alongside an alternative Paho MQTT receiver subscribing to public broker topics.

## Result
- Programmed ESP32 firmware with error handling for invalid sensor readings, NTP time synchronization, and HTTP POST logging.
- Created a modular Flask REST API providing specific endpoints for full telemetry, isolated temperature, and isolated humidity data.
- Implemented an alternative MQTT client integration using Paho to receive and process telemetry from test.mosquitto.org topics.
