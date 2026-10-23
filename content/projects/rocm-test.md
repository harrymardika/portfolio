---
title: ROCm Deep Learning Benchmark Suite
summary:
  en: A deep learning benchmark suite in Jupyter Notebooks created to evaluate and compare PyTorch, TensorFlow, and JAX performance on AMD ROCm GPUs.
  id: Suite benchmark deep learning dalam Jupyter Notebook yang dibuat untuk mengevaluasi dan membandingkan performa PyTorch, TensorFlow, dan JAX pada GPU AMD ROCm.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - PyTorch
  - TensorFlow
  - JAX
  - ROCm
  - Jupyter
  - AMD
metrics:
  - value: '14.54'
    label:
      en: Peak float16 matmul performance (TFLOPS)
      id: Performa perkalian matriks float16 puncak (TFLOPS)
  - value: '13.40'
    label:
      en: Peak host-to-device bandwidth (GB/s)
      id: Bandwidth host-to-device puncak (GB/s)
links:
  repo: https://github.com/harrymardika/rocm-test
featured: false
draft: false
---

## Problem
Deep learning frameworks exhibit varying performance characteristics on AMD ROCm hardware across primitive operations and neural network architectures. I needed a standardized way to measure matrix operations, layer activations, model training throughput, and memory transfer speeds across PyTorch, TensorFlow, and JAX.

## Approach
I built a benchmark suite using Jupyter Notebooks (`pytorch.ipynb`, `tensorflow.ipynb`, `jax.ipynb`, and `comparison.ipynb`) targeting an AMD Radeon RX 6800S GPU. The suite measures low-level matrix and convolution kernels, common layer types, CNN and Transformer training workloads, memory bandwidth, and JAX JIT compilation overhead, saving execution metrics into JSON files for automated visualization.

## Result
- Recorded PyTorch achieving the highest peak matrix multiplication throughput at 14.54 TFLOPS for float16 and 7.87 TFLOPS for float32.
- Measured PyTorch leading CNN training and inference on a ResNet-18-like model, reaching 1,864.6 images/s during batch 32 inference.
- Found JAX matching PyTorch performance on BERT-base-like transformer training at 265.5 samples/s, while capturing JAX JIT compilation costs on initial function runs.
- Generated comparative visualization charts for matrix operations, element-wise layers, model training, and host-to-device memory transfer bandwidth.
