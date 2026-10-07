---
title: Real-Time Unusual Behavior Detection with Gemini Vision
summary:
  en: I created a real-time computer-vision system that samples video frames every
    500 ms, sends them to Gemini’s vision-language model, and visualizes
    detected anomalies as JSON-driven bounding boxes using OpenCV.
  id: Saya membangun sistem visi komputer real-time yang mengambil frame tiap
    500 ms, mengirim ke model Gemini, dan menampilkan anomali sebagai kotak
    batas berbasis JSON dengan OpenCV.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Gemini
  - OpenCV
  - Python
  - Google GenAI
  - Jupyter Notebook
  - RTSP
links:
  repo: https://github.com/harrymardika/camera-genai
featured: false
draft: false
---
## Problem

I needed a way to detect unusual behaviors in live security footage without training a custom detector, while keeping the processing fast enough for real-time monitoring.

## Approach

I built an asynchronous pipeline that captures frames from a local or RTSP camera, samples them at 500 ms intervals, and sends each frame to the Gemini API with a system prompt containing an anomaly dictionary. The model returns structured JSON with normalized coordinates and priority labels, which I map back to the original video resolution and draw bounding boxes with OpenCV, all while maintaining UI responsiveness through multithreading.

## Result

- Implemented frame sampling at 2 fps to reduce latency and API cost
- Integrated Gemini Vision API for zero-shot detection of objects and anomalous behaviors
- Generated structured JSON output with normalized 0-1000 coordinates and priority labels
- Rendered real-time bounding boxes and a security dashboard using OpenCV without UI freezes
- Enabled easy updates to the anomaly dictionary via configurable system prompts

