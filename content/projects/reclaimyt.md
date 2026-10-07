---
title: Reclaimyt waste-sorting conveyor
summary:
  en: A CNN waste classifier paired with an ESP32-driven sorting conveyor that separates waste automatically; a top-10 finalist project at Samsung Innovation Campus.
  id: Klasifikasi sampah berbasis CNN yang terhubung ke conveyor pemilah berbasis ESP32 untuk memilah sampah secara otomatis; proyek finalis (10 besar) Samsung Innovation Campus.
role: { en: ML Engineer, id: ML Engineer }
year: 2024
tags: [CNN, Computer Vision, IoT, ESP32]
metrics:
  - { value: "90.9%", label: { en: validation accuracy, id: akurasi validasi } }
links: {}
featured: true
order: 4
draft: false
---

## Problem
Waste is still sorted by hand, which takes time and manual effort. Reclaimyt automates that step: sensors detect each item on the conveyor and the system separates it into the right bin.

## Approach
A team of four built a camera-equipped belt conveyor driven by an ESP32, with servo-driven gates that push each item into its bin. As the ML engineer, I collected and prepared the image data, built, trained, and experimented with the computer vision models, evaluated them, and deployed the final model to drive the sorting decisions.

![Design sketches of the conveyor: three layout options, the parts, and the 80 × 15 cm belt](../media/projects/reclaimyt-design.webp)

## Result
- 90.9% validation accuracy.
- A working prototype that classifies and sorts items on the belt.
- Top 10 finalist at Samsung Innovation Campus Batch 5 (April–July 2024).

![The working prototype: a belt conveyor with a phone camera on a stand, servo sorters, and the ESP32 wiring](../media/projects/reclaimyt-prototype.webp)
