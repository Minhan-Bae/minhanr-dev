---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/flow-matching
- venue/ICCV2025
source_url: https://arxiv.org/abs/2507.03924
code_url: https://github.com/OnlyZZZZ/DNF-Intrinsic
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: Noise-to-intrinsic 패러다임의 구조 손실 문제를 해결. 원본 이미지를 직접 입력으로 flow matching 기반 결정적
  intrinsic 예측 + generative renderer로 물리적 충실도 검증. 실내 역렌더링에서 albedo PSNR 21.95로 RGBX(18.84)
  대비 대폭 개선.
slug: 260413-dnf-intrinsic-noise-free-indoor-inverse
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2507.03924/gradient.png
  alt: 260413-dnf-intrinsic-noise-free-indoor-inverse
date: '2026-04-13'
---


# DNF-Intrinsic: Deterministic Noise-Free Diffusion for Indoor Inverse Rendering

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-dnf-intrinsic-noise-free-indoor-inverse/fig-1.png)
*Source: [arXiv 2507.03924 (Fig. 1)](https://arxiv.org/abs/2507.03924)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-dnf-intrinsic-noise-free-indoor-inverse/fig-2.png)
*Source: [GitHub · OnlyZZZZ/DNF-Intrinsic](https://github.com/OnlyZZZZ/DNF-Intrinsic)*

**저자**: Zheng et al.
**발표**: ICCV 2025 (arXiv:2507.03924)

## 핵심 요약

기존 디퓨전 기반 역렌더링은 **noise-to-intrinsic** 패러다임으로, 노이즈가 섞인 이미지에서 intrinsic 속성을 예측하여 구조/외형 정보가 심각하게 훼손된다. DNF-Intrinsic은 **원본 이미지를 직접 입력**으로 사용하여 flow matching 기반으로 결정적(deterministic) intrinsic 속성을 예측하고, **generative renderer**가 예측된 속성이 원본과 물리적으로 충실한지 검증하는 구조.

## 방법론

1. **Source-to-Intrinsic**: Gaussian noise 대신 원본 RGB 이미지를 시작점으로 flow matching → 구조/외형 정보 보존
2. **Generative Renderer**: 예측된 intrinsic 속성(albedo, metallic, roughness, normal, depth)으로부터 원본을 재합성 → 물리적 충실도 제약
3. **사전학습 디퓨전 모델 파인튜닝**: InteriorVerse 합성 데이터(45,073 샘플)에서 학습
4. **최적 스텝 수**: 10 디퓨전 스텝에서 최적 성능 (기존 50스텝 대비 효율적)

## 정량 결과

### 합성 데이터 (InteriorVerse)

| 메트릭 | DNF-Intrinsic | RGBX | IntrinsicDiff | IndoorIR |
|--------|---------------|------|---------------|----------|
| Albedo PSNR↑ | **21.95** | 18.84 | 17.42 | 15.92 |
| Albedo SSIM↑ | **0.87** | 0.81 | 0.80 | 0.78 |
| Albedo LPIPS↓ | **0.12** | 0.18 | 0.22 | 0.34 |
| Metallic PSNR↑ | **17.64** | 11.92 | 16.46 | 16.72 |
| Roughness PSNR↑ | **16.72** | 11.67 | 13.33 | 16.13 |
| Normal AE↓ | **12.23°** | 18.57° | — | 15.41° |
| Depth AMRE↓ | **0.08** | — | — | 0.13 |

### 실세계

| 데이터셋 | 메트릭 | DNF-Intrinsic | RGBX | IndoorIR |
|----------|--------|---------------|------|----------|
| IIW | WHDR↓ | **20.90** | 21.80 | 22.90 |
| NYUv2 | Normal AE↓ | **28.40°** | 35.24° | 34.38° |
| NYUv2 | Depth AMRE↓ | **0.07** | — | 0.23 |
| DIODE | Normal AE↓ | **28.29°** | 42.41° | 36.03° |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [OnlyZZZZ/DNF-Intrinsic](https://github.com/OnlyZZZZ/DNF-Intrinsic) |
| 모델 | ✅ 공개 |
| 라이선스 | 미명시 |
| 요구사양 | 10 디퓨전 스텝 (경량) |

## PathFinder R&D 적용 가능성

- **실내 씬 최적 솔루션**: PathFinder의 실내 VFX 워크플로에서 가장 정확한 단일 이미지 역렌더링 (albedo PSNR 21.95, RGBX 대비 +3.11).
- **Flow matching 아키텍처**: Ouroboros(단일 스텝)와 DNF-Intrinsic(10스텝 flow matching) 중 품질-속도 트레이드오프 비교 → PathFinder Phase 1 아키텍처 선택에 참고.
- **Generative renderer 제약**: 물리적 충실도 검증 메커니즘은 PathFinder의 G-buffer 품질 QA 모듈 설계에 참조.

## 한계점

1. **실내 전용**: 실외 씬 미지원
2. **조명 GT 부재**: 학습 데이터에 조명 ground truth 없음 → 사후 최적화 필요
3. **합성 데이터 편향**: InteriorVerse(45K 샘플) 한정 학습

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 비디오 기반 다단계 역렌더링
- 260413_Ouroboros_CycleConsistent_Diffusion_Rendering_OURO — 단일 스텝 cycle-consistent 대안
- 260413_Materialist_SingleImage_Inverse_Rendering_MTRL — 물리 기반 differentiable rendering 최적화
- PathFinder_Master — PathFinder 프로젝트 허브
