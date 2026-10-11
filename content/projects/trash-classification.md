---
title: 'Trash Classification: Recyclable vs. Other Waste'
summary:
  en: An image classification project that uses transfer learning with EfficientNetV2M to categorize waste into recyclable and other waste, exported to TensorFlow Lite for mobile deployment.
  id: Proyek klasifikasi gambar yang menggunakan transfer learning dengan EfficientNetV2M untuk mengategorikan sampah menjadi daur ulang dan non-daur ulang, diekspor ke TensorFlow Lite untuk deployment seluler.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - TensorFlow
  - Keras
  - EfficientNetV2M
  - TensorFlow Lite
  - OpenCV
  - Python
metrics:
  - value: 93.00%
    label:
      en: Validation accuracy
      id: Akurasi validasi
  - value: 97.06%
    label:
      en: Training accuracy
      id: Akurasi pelatihan
  - value: 12,000
    label:
      en: Images processed
      id: Gambar diproses
links:
  repo: https://github.com/harrymardika/Trash-Classification
featured: false
draft: false
---

## Problem
Sorting waste manually into recyclable and non-recyclable categories is inefficient. I needed an automated image classification model lightweight enough to run efficiently on mobile and edge devices.

## Approach
I built a classification pipeline using transfer learning with an ImageNet-pretrained EfficientNetV2M architecture in TensorFlow/Keras. I preprocessed and resized 12,000 images to 200x200 pixels using OpenCV, applied data augmentation, and appended custom convolutional and dense layers with dropout for regularization. The model was trained using the Adam optimizer with early stopping and model checkpointing, then converted into TensorFlow Lite format for edge deployment.

## Result
- Achieved a validation accuracy of 93.00% and training accuracy of 97.06% in 34 epochs.
- Processed a balanced dataset subset of 12,000 images split into 9,600 training images and 2,400 validation images.
- Exported the trained model to TensorFlow Lite format (`best_model.tflite`) for lightweight edge deployment.
