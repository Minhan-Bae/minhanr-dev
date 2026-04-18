---
tags:
- AI_R&D_Paper
- domain/video
- tech/frame-interpolation
- type/survey
source_url: https://arxiv.org/abs/2506.01061
code_url: https://github.com/CMLab-Korea/Awesome-Video-Frame-Interpolation
code_available: true
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: VFI 분야 250편 이상 커버하는 종합 서베이(AceVFI). Flow/kernel/hybrid/phase/GAN/Transformer/Mamba/diffusion
  기반 분류 체계. CTFI vs ATFI 패러다임 구분. IEEE TCSVT 2026 accepted.
slug: 260413-frame-interpolation-survey-2026
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-frame-interpolation-survey-2026&category=AI_R%26D_Paper
  alt: Frame Interpolation Survey
date: '2026-04-13'
---

# AceVFI: A Comprehensive Survey of Advances in Video Frame Interpolation

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-frame-interpolation-survey-2026/fig-1.png)
*Source: [arXiv 2506.01061 (Fig. 1)](https://arxiv.org/abs/2506.01061)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-frame-interpolation-survey-2026/fig-2.png)
*Source: [GitHub · CMLab-Korea/Awesome-Video-Frame-Interpolation](https://github.com/CMLab-Korea/Awesome-Video-Frame-Interpolation)*

**발표**: IEEE TCSVT 2026 (arXiv:2506.01061, 2025-06-01, 업데이트 2026-03-12)

## 핵심 요약

VFI(Video Frame Interpolation) 분야를 **250편 이상** 커버하는 최신 종합 서베이. 고전적 모션 보상 기반부터 최신 diffusion 기반까지 전체 스펙트럼을 체계적으로 분류. Center-Time(CTFI)와 Arbitrary-Time(ATFI) 두 학습 패러다임으로 구분하고, 대규모 모션, 가림, 조명 변화, 비선형 모션 등 핵심 과제를 분석.

## 분류 체계

1. **Motion compensation**: Optical flow 기반 전통 방법
2. **Kernel-based**: Adaptive convolution kernel
3. **Flow-based**: Optical flow + warping
4. **Hybrid**: Flow + kernel 결합
5. **Phase-based**: 위상 분석 기반
6. **GAN-based**: Adversarial 학습
7. **Transformer-based**: Attention 기반
8. **Mamba-based**: State space model
9. **Diffusion-based**: 최신 생성 모델 기반

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [Awesome-VFI](https://github.com/CMLab-Korea/Awesome-Video-Frame-Interpolation) (논문 목록 + 코드 링크) |
| 모델 | N/A (서베이) |
| 라이선스 | 미명시 |

## PathFinder R&D 적용 가능성

- **참조 문헌**: PathFinder Phase 2의 비디오 기반 material 시퀀스 보간에서 VFI 기법 선택 시 참조.
- **Diffusion-based VFI**: 최신 diffusion VFI 방법들은 PathFinder의 G-buffer 시퀀스 보간에도 적용 가능.

## 한계점

- 서베이 논문으로 자체 기술 기여 없음
- 빠르게 업데이트되는 diffusion 분야 커버에 시차 가능

## 관련 노트

- PathFinder_Master
