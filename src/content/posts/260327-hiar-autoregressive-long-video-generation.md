---
author: MinHanr
categories:
- Research
cover:
  alt: 260327 HiAR Hierarchical Denoising fig
  caption: ''
  image: /images/posts/260327-hiar-autoregressive-long-video-generation/260327_HiAR_Hierarchical_Denoising_fig.png
date: '2026-03-27'
draft: false
summary: "HiAR는 계층적 노이즈 매칭으로 오토리그레시브 비디오 생성의 temporal drift를 구조적으로 해결하여, 20초 영상에서 VBench 최고 점수(0.821)와 1.8배 추론 속도 향상을 달성한 논문 분석."
slug: 260327-hiar-autoregressive-long-video-generation
tags:
- AI_R&D_Paper
title: 'HiAR: Efficient Autoregressive Long Video Generation via Hierarchical Denoising'
---

# HiAR: Efficient Autoregressive Long Video Generation via Hierarchical Denoising

> 계층적 노이즈 매칭 기반 오토리그레시브 프레임워크로, 20초 영상 생성에서 VBench 최고 점수(0.821)와 최저 temporal drift(0.257)를 달성하며 1.8배 추론 속도 향상.

![260327 HiAR Hierarchical Denoising fig](/images/posts/260327-hiar-autoregressive-long-video-generation/260327_HiAR_Hierarchical_Denoising_fig.png)

## 핵심 내용

**방법론**: 기존 오토리그레시브 비디오 생성은 이전 청크를 거의 완전히 디노이즈한 후 다음 청크의 컨텍스트로 사용하여 에러 누적(temporal drift) 발생. HiAR는 컨텍스트를 현재 청크와 동일한 노이즈 레벨에서 제공하는 계층적 디노이징 방식을 도입. Forward-KL 정규화로 모션 다양성 보존.

**핵심 기술적 기여**:
- **Hierarchical Noise Matching**: 컨텍스트 프레임과 생성 프레임의 노이즈 스케줄을 계층적으로 정렬하여, 디노이징 과정에서 에러가 누적되지 않도록 설계. 기존 방식은 거의 clean한 컨텍스트 → noisy 생성 프레임 간 gap이 temporal inconsistency의 주원인이었으나, HiAR는 양쪽을 동일 노이즈 레벨에서 시작하여 함께 디노이즈.
- **Forward-KL Regularization**: 오토리그레시브 생성 시 mode collapse로 인한 모션 다양성 저하를 방지. 생성 분포가 학습 분포를 과도하게 좁히지 않도록 정규화.
- **Pipeline-Parallel Inference**: 청크 간 디노이징을 파이프라인 병렬 방식으로 수행하여 wall-clock 시간 대폭 단축.

**정량 결과 (VBench 20s Generation)**:

| 모델 | Total | Quality | Semantic | Dynamic | Drift↓ |
|------|-------|---------|----------|---------|--------|
| **HiAR** | **0.821** | **0.846** | 0.723 | **0.686** | **0.257** |
| Self-Forcing | 0.805 | 0.829 | 0.708 | 0.542 | 0.355 |
| Causal Forcing | 0.810 | 0.837 | 0.701 | 0.672 | 0.615 |
| CausVid | 0.764 | 0.771 | 0.740 | 0.621 | 0.842 |

**효율성**: 30 fps 처리량, 청크당 0.30초 레이턴시 — 기존 distilled AR 모델(17 fps, 0.69초) 대비 약 1.8배 wall-clock 속도 향상. 파이프라인 병렬 추론 가능.

**저자**: Kai Zou, Dian Zheng, Hongbo Liu, Tiankai Hang, Bin Liu, Nenghai Yu
**발표일**: 2026-03-09

## 시사점

HiAR의 계층적 디노이징 전략은 오토리그레시브 비디오 생성에서 **temporal drift 문제를 구조적으로 해결**한 첫 번째 접근법이라는 점에서 중요한 전환점이다. Drift가 0.257로 CausVid(0.842)의 1/3 수준이라는 것은 20초 이상의 장편 생성에서도 시각적 일관성을 유지할 수 있음을 의미한다.

