---
title: BERT-Based Extractive Text Summarization for Academic Proposal Assessment
summary:
  en: I built a hybrid extractive-neural summarization system that automatically generates concise summaries and quality scores for Indonesian academic proposals.
  id: Saya membangun sistem rangkuman hibrida ekstraktif-neural yang secara otomatis menghasilkan rangkuman singkat serta skor kualitas untuk proposal akademik berbahasa Indonesia.
role:
  en: Developer
  id: Pengembang
year: 2026
tags:
  - BERT
  - Transformers
  - Python
  - Streamlit
  - ROUGE
  - LSA
metrics:
  - value: 56.63%
    label:
      en: ROUGE-1 score
      id: Skor ROUGE-1
  - value: 47.38%
    label:
      en: ROUGE-2 score
      id: Skor ROUGE-2
  - value: 51.14%
    label:
      en: ROUGE-L score
      id: Skor ROUGE-L
links:
  repo: https://github.com/harrymardika/text-summarization-indobert
featured: false
draft: false
---

## Problem
I needed a way to automate the assessment of academic qualification proposals, which require concise, section-wise summaries that preserve key technical details and semantic coherence.

## Approach
I designed a pipeline that first extracts PDF text, segments it into sections, and computes linguistic features (title overlap, cue words, position, length). The top-scoring sentences form an extractive summary, which is then refined by a fine-tuned BERT model specialized for Indonesian academic texts. Finally, I compute inter-section similarity with TF-IDF, cosine and LSA to generate a quality score.

## Result
- Hybrid system combines feature-based extraction with BERT neural summarization, improving semantic coverage.
- Section-wise processing preserves domain-specific terminology and structure.
- Automated quality assessment provides coherent scores for each proposal.
- Achieved competitive ROUGE scores: 56.63% (R-1), 47.38% (R-2), 51.14% (R-L).
- Deployed as a Streamlit web app for easy PDF upload and instant summarization.
