---
title: ROCm Deep Learning Benchmark Suite
summary:
  en: A benchmarking suite containing Jupyter notebooks to measure and compare the performance of PyTorch, TensorFlow, and JAX on AMD ROCm hardware.
  id: Rangkaian benchmark menggunakan Jupyter notebook untuk mengukur dan membandingkan performa PyTorch, TensorFlow, dan JAX pada perangkat keras AMD ROCm.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - Jupyter Notebook
  - PyTorch
  - TensorFlow
  - JAX
  - ROCm
  - Python
metrics: []
links:
  repo: https://github.com/harrymardika/rocm-test
featured: false
draft: false
---

## Problem
I needed to understand and compare how major Python deep learning frameworks perform and behave on the same AMD ROCm GPU hardware when running identical workloads.

## Approach
I developed a set of Jupyter notebooks targeting PyTorch, TensorFlow, and JAX to measure low-level compute kernels and high-level workloads on an AMD Radeon RX 6800S. The suite runs tests on matrix multiplication, element-wise operations, convolutions, layer operations, and model training (CNN and Transformers), saving execution statistics to JSON files which are then visualized in a comparison notebook.

## Result
- Created benchmark scripts for PyTorch, TensorFlow, and JAX covering matrix multiplication up to size 8192 and element-wise operations up to 100M elements.
- Implemented benchmarks for standard CNN (ResNet-18) and Transformer model training and inference configurations.
- Designed a system to record latency, throughput, memory transfer bandwidth, and JAX JIT compilation overhead, exporting results as structured JSON files.
- Built a visualization notebook to generate comparison plots across frameworks for multi-dimensional performance analysis.
