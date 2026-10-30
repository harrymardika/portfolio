---
title: Image Processing Learning Tool (Go Clean Architecture)
summary:
  en: A web-based image processing application built in Go with a clean-architecture redesign, offering real-time filters, histogram analysis and Sobel edge detection for learning purposes.
  id: Aplikasi web pemrosesan citra berbasis Go dengan arsitektur bersih, menyediakan filter real-time, analisis histogram, dan deteksi tepi Sobel untuk tujuan belajar.
role:
  en: Developer
  id: Pengembang
year: 2025
tags:
  - Go
  - Clean Architecture
  - HTML5 Canvas
  - CSS Grid
  - Vanilla JavaScript
  - Goroutines
metrics:
  - value: 30 FPS
    label:
      en: Processing frame rate
      id: Kecepatan pemrosesan (FPS)
  - value: 50 images
    label:
      en: Cache size limit
      id: Batas ukuran cache (gambar)
  - value: 3,104 lines
    label:
      en: Original file line count
      id: Jumlah baris file asli
links:
  repo: https://github.com/harrymardika/pengolahan-citra
featured: false
draft: false
---

## Problem
I needed a platform where students and hobbyists could experiment with digital image processing concepts interactively, while also maintaining a codebase that is easy to extend and test.

## Approach
I built a Go web server that serves an HTML5 Canvas UI and refactored the monolithic code into a clean-architecture layout with separate layers for handlers, services, and models. I leveraged goroutine-based parallel processing, dependency injection, and interface-driven design to enable real-time sliders, histogram analysis, Otsu thresholding, and Sobel edge detection, all without external libraries.

## Result
- Implemented real-time image adjustments (brightness, zoom 0.1-5.0×, rotation ±360°) via responsive sliders.
- Added a full suite of transformations: color conversions, flips, translations, arithmetic and Boolean operations on two images.
- Provided histogram visualizations, Otsu automatic thresholding, histogram equalization, and statistical metrics (mean, standard deviation).
- Integrated Sobel edge detection with magnitude, gradient, and kernel visualizations for educational insight.
- Achieved smooth performance at ~30 FPS using parallel goroutine processing and an LRU cache limited to 50 images, all organized in a testable clean-architecture codebase.
