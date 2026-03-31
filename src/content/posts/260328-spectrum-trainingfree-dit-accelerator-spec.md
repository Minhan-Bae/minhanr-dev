---
author: MinHanr
categories:
- Research
date: '2026-03-28'
draft: false
summary: "Spectrum은 Chebyshev 다항식 기반 feature forecasting으로 DiT 모델의 추론을 최대 4.79배 가속하는 training-free 가속기로, FLUX.1과 Wan2.1-14B에서 SOTA 성능을 달성한 CVPR 2026 논문 분석."
slug: 260328-spectrum-trainingfree-dit-accelerator-spec
tags:
- AI_R&D_Paper
- tech/T2I
- tech/T2V
- tech/attention
title: 'Spectrum: Adaptive Spectral Feature Forecasting for Diffusion Sampling Acceleration'
---

# Spectrum: Adaptive Spectral Feature Forecasting for Diffusion Sampling Acceleration

**저자:** Jiaqi Han, Juntong Shi, Puheng Li, Haotian Ye, Qiushan Guo, Stefano Ermon (Stanford University, ByteDance)
**발표:** CVPR 2026 / arXiv:2603.01623 (March 2026)
**프로젝트:** https://hanjq17.github.io/Spectrum/
**코드:** https://github.com/hanjq17/Spectrum

## 핵심 내용

Spectrum은 Diffusion Transformer(DiT) 기반 모델의 **training-free 추론 가속기**다. 기존 50-step 샘플링을 ~10회 실제 연산으로 줄이면서 fidelity를 유지한다.

### 방법론
- Denoiser의 latent feature를 **시간의 함수**로 보고, **Chebyshev 다항식**으로 근사
- 각 basis의 계수를 **ridge regression**으로 피팅 → 여러 미래 diffusion step의 feature를 forecast
- 이론적으로 error bound가 step size에 따라 **누적되지 않음**을 증명 (기존 TeaCache/FORA 대비 우위)

### 핵심 수치

| 모델 | 속도 향상 | 비고 |
|------|----------|------|
| FLUX.1 (T2I) | **4.79×** | 최고 T2I 가속 |
| Stable Diffusion 3.5-Large | 지원 | 벤치마크 포함 |
| SDXL (T2I) | 지원 | 벤치마크 포함 |
| Wan2.1-14B (T2V) | **4.67×** | 높은 품질 유지 |
| HunyuanVideo (T2V) | 지원 | 비디오 벤치마크 포함 |

### TeaCache/FORA 대비 차별점
- **Global, long-range feature reuse**: 국소적 캐싱이 아닌 스펙트럼 기반 전역 예측
- **이론적 보장**: error bound가 step size에 비례하지 않음
- **범용성**: T2I와 T2V 모두에서 SOTA 달성

## 아키텍처

```
Diffusion Steps → Chebyshev Polynomial Fitting → Ridge Regression
→ Feature Forecasting → Skip redundant denoiser evaluations
→ 50 steps → ~10 actual model evaluations
```

## Practical Implications

**our video generation project 프로젝트에 직접적 임팩트.** ComfyUI 기반 영상 생성 파이프라인에서 가장 큰 병목은 DiT 모델의 추론 시간이다. Spectrum은:

1. **FLUX.1에 4.79× 가속** — ComfyUI에서 FLUX 워크플로우 사용 시 추론 시간을 1/5로 단축 가능
2. **Wan2.1-14B에 4.67× 가속** — HiggsField 기반 비디오 생성에 바로 적용 가능
3. **Training-free** — 모델 재학습 없이 기존 파이프라인에 플러그인 방식 적용
4. **코드 공개(GitHub)** — 즉시 실험 가능

TurboDiffusion(하드웨어 최적화)과 결합하면 multiplicative 효과 기대. NVFP4 + Spectrum 조합으로 RTX 5090에서 실시간 T2V에 근접할 수 있다. ComfyUI 커스텀 노드로 래핑하여 our video generation project 파이프라인에 통합하는 것이 다음 단계.