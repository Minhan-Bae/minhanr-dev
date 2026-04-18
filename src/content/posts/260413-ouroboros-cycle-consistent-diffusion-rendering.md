---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/forward-rendering
- tech/diffusion
- venue/ICCV2025
source_url: https://arxiv.org/abs/2508.14461
code_url: https://github.com/Y-Research-SBU/Ouroboros
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 두 개의 단일 스텝 디퓨전 모델이 순방향/역방향 렌더링을 상호 강화하는 cycle-consistent 프레임워크. 기존 다단계 디퓨전
  대비 50배 빠른 추론, 실내/실외 모두 SOTA 달성. 학습 없이 비디오 분해로 전이 가능.
slug: 260413-ouroboros-cycle-consistent-diffusion-rendering
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2508.14461/gradient.png
  alt: 260413-ouroboros-cycle-consistent-diffusion-rendering
date: '2026-04-13'
---


# Ouroboros: Single-step Diffusion Models for Cycle-consistent Forward and Inverse Rendering

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-ouroboros-cycle-consistent-diffusion-rendering/fig-1.png)
*Source: [arXiv 2508.14461 (Fig. 1)](https://arxiv.org/abs/2508.14461)*

**저자**: Shanlin Sun, Yifan Wang, Hanwen Zhang, Yifeng Xiong, Qin Ren, Ruogu Fang, Xiaohui Xie, Chenyu You
**발표**: ICCV 2025 (arXiv:2508.14461)

## 핵심 요약

기존 다단계 디퓨전 기반 렌더링 방법은 순방향/역방향을 독립적으로 처리해 cycle inconsistency와 느린 추론 속도를 유발한다. Ouroboros는 **두 개의 단일 스텝 디퓨전 모델**이 순방향(G-buffer→image)과 역방향(image→intrinsic) 렌더링을 수행하며, cycle consistency 메커니즘으로 상호 강화한다. 실내/실외 모두에서 SOTA 달성, **50배 빠른 추론**, training-free 비디오 분해 전이.

## 방법론

1. **Single-step prediction**: 다단계 디노이징 대신 단일 스텝으로 결정적 출력 → 50배 속도 향상
2. **Cycle consistency**: Forward(G-buffer→RGB) ↔ Inverse(RGB→intrinsic) 모델이 상호 출력을 입력으로 사용하여 일관성 강화
3. **Indoor + Outdoor 지원**: Hypersim(실내) + MatrixCity(실외) + InteriorVerse 다양한 데이터셋에서 학습/평가
4. **Training-free video transfer**: 프레임별 독립 추론으로 비디오 시퀀스의 intrinsic 분해 가능, temporal consistency 개선

## 정량 결과

### Inverse Rendering — Albedo

| 데이터셋 | Ouroboros PSNR/SSIM | RGB↔X PSNR |
|----------|--------------------|-----------| 
| Hypersim (실내) | **18.98 / 0.71** | 18.67 |
| MatrixCity (실외) | **25.38 / 0.77** | 12.61 |
| InteriorVerse | **22.07 / 0.87** | — |

### Inverse Rendering — Normal (Angular Error↓)

| 데이터셋 | Ouroboros | RGB↔X |
|----------|----------|-------|
| Hypersim | **11.98°** | 17.21° |
| InteriorVerse | **9.58°** | 12.10° |

### Forward Rendering

| 데이터셋 | Ouroboros PSNR/LPIPS | RGB↔X PSNR/LPIPS |
|----------|---------------------|-----------------|
| MatrixCity | **21.57 / 0.18** | 9.24 / 0.30 |
| InteriorVerse | **15.79 / 0.28** | — |

### Material Estimation (MatrixCity)

| 채널 | Ouroboros PSNR/LPIPS |
|------|---------------------|
| Roughness | 24.04 / 0.23 |
| Metallicity | 26.32 / 0.14 |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [Y-Research-SBU/Ouroboros](https://github.com/Y-Research-SBU/Ouroboros) (ICCV 2025) |
| 모델 | ✅ 공개 |
| 라이선스 | 미명시 |
| 요구사양 | 단일 스텝 → 추론 경량 (기존 대비 50배 가속) |
| 추론 속도 | 50× faster than multi-step diffusion |

## PathFinder R&D 적용 가능성

- **Phase 1 핵심 후보**: DiffusionRenderer(다단계, 느림)의 대안으로 **단일 스텝 + cycle consistency**는 PathFinder의 실시간 120fps 목표에 가장 부합하는 아키텍처.
- **실외 씬 지원**: DiffusionRenderer/DNF-Intrinsic이 실내 중심인 반면, Ouroboros는 **MatrixCity 실외 데이터**에서도 SOTA → PathFinder의 실외 VFX 워크플로 커버.
- **비디오 전이**: Training-free 비디오 분해는 PathFinder Phase 2의 비디오 기반 material decomposition에 직접 활용 가능.
- **Cycle consistency**: Forward/inverse 모델 간 상호 검증으로 G-buffer 품질 신뢰도 향상.

## 한계점

1. **학습 데이터 병목**: 공개 데이터셋의 intrinsic map 품질과 lighting 정보 부족이 성능 상한을 결정
2. **비디오 temporal consistency**: Training-free 전이 시 프레임 간 flickering 가능
3. **Single-step trade-off**: 결정적 출력으로 ambiguous 영역의 다양성 포기

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 다단계 디퓨전 baseline (Ouroboros가 50배 가속)
- 260412_V-RGBX_Intrinsic_Aware_Video_Editing_Keyframe_VRBX — Video intrinsic editing (V-RGBX cycle consistency 비교)
- 260413_DNF_Intrinsic_NoiseFree_Indoor_Inverse_Rendering_DNFI — 실내 특화 noise-free 접근
- PathFinder_Master — PathFinder 프로젝트 허브
