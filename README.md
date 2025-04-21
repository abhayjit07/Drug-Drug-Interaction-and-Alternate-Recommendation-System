# Drug-Drug Interaction Prediction and Alternative Recommendation System

This project focuses on the prediction of Drug-Drug Interactions (DDIs) and recommends safer alternative drug combinations. It addresses the critical need for automated DDI detection due to the complexity and sheer volume of biomedical data and proposes a solution integrating transformer-based and traditional ML models with ensemble learning.

---

## 🧪 Table of Contents

- [Introduction](#introduction)
- [Objectives](#objectives)
- [Methodology](#methodology)
- [Datasets Used](#datasets-used)
- [Pipeline Overview](#pipeline-overview)
  - [Pipeline 1: BioBERT-based Classification](#pipeline-1-biobert-based-classification)
  - [Pipeline 2: Word2Vec + Classifiers](#pipeline-2-word2vec--classifiers)
  - [Pipeline 3: Alternative Drug Recommendation](#pipeline-3-alternative-drug-recommendation)
- [Ensemble Model](#ensemble-model)
- [Results](#results)
- [Conclusion & Future Work](#conclusion--future-work)

---

## Introduction

Detecting drug-drug interactions (DDIs) is crucial in healthcare to avoid harmful side effects from concurrent medications. Manual analysis is impractical due to the vast biomedical literature. This project automates the process and further enhances healthcare decision-making by recommending safe alternatives.

---

## Objectives

- Develop and fine-tune DDI detection models using BioBERT.
- Utilize Word2Vec embeddings for contextual understanding.
- Combine model outputs via ensemble learning for robustness.
- Recommend alternative drug combinations if harmful interactions are found.

---

## Methodology

Three main pipelines were developed:

1. **Pipeline 1**: BioBERT-based and word2vec based models trained on DDI corpus for sentence-level relation classification.
2. **Pipeline 2**: Alternative recommendation system using cosine similarity of Word2Vec vectors, filtered through DDI models.

These pipelines are combined through an ensemble model for final prediction.

---

## Datasets Used

1. **DDI Corpus** – Annotated drug-drug interactions with sentence-level context.
2. **PubMed Abstracts** – Biomedical abstracts used to train Word2Vec.
3. **DrugBank XML** – Drug descriptions, names, and product details.

---

## Pipeline Overview

### Pipeline 1 Model 1: BioBERT-based Classification

- Input: Sentences from DDI Corpus with tagged drug entities.
- Model: Fine-tuned BioBERT with AdamW optimizer.
- Output: Binary classification for drug pair interactions.

### Pipeline 1 Model 2: Word2Vec + Classifiers

- Train Word2Vec on PubMed data.
- Concatenate drug vectors.
- Train multiple classifiers (SVM, XGBoost, Random Forest).
- Address class imbalance with SMOTE.

### Pipeline 2: Alternative Drug Recommendation

- Build similarity matrix of drugs using Word2Vec.
- If interaction exists, recommend the most similar non-interacting alternative pair.
- Verify alternatives using trained DDI models.

---

## Ensemble Model

- Predictions from BioBERT, Word2Vec-based SVM, and XGBoost are stacked.
- Meta-classifiers (Logistic Regression, Gradient Boosting, Random Forest, and XGBoost) are trained.
- Best performance achieved using XGBoost as meta-classifier.

---

## Results

- BioBERT performs well on sentence-level DDI extraction.
- Word2Vec models struggle with class imbalance; balancing improves minority class recall.
- Ensemble model outperforms individual models slightly.
- Recommendation system filters out risky drug pairs and suggests alternatives effectively.

---

## Conclusion & Future Work

This project highlights the effectiveness of combining transformer-based and traditional ML models for DDI prediction. Key future directions include:

- Improving similarity metrics for drug recommendations.
- Building a framework to validate recommended alternatives.
- Extending to multi-drug interactions and integrating with EHR systems.

---

## Contributors
- Abhayjit Singh Gulati
- Soumya Sangam Jha
- Achyut Agarwal
- **Guide:** Prof. Ananthanarayana V. S., NITK Surathkal

---
