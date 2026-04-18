---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/PBR
- tech/diffusion
source_url: https://arxiv.org/abs/2508.19789
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 다단계 디퓨전의 확률적 추론이 결정적 material 추정과 충돌하는 문제를 해결. 단일 스텝 디퓨전 + Detail Injection
  Network(DIN)으로 과도한 스무딩 없이 고품질 multi-view material 추정. Albedo PSNR 9.9% 개선, 추론 10.5배
  가속.
slug: 260413-stable-intrinsic-one-step-multi-view
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2508.19789/gradient.png
  alt: 260413-stable-intrinsic-one-step-multi-view
date: '2026-04-13'
---


# StableIntrinsic: Detail-preserving One-step Diffusion Model for Multi-view Material Estimation

**저자**: (arXiv:2508.19789, 2025-08-27)

## 핵심 요약

기존 다단계 디퓨전 기반 material estimation은 시간이 오래 걸리고, 확률적 추론이 결정적 재질 추정 태스크와 충돌하여 높은 분산의 결과를 생성한다. StableIntrinsic은 **단일 스텝 디퓨전**으로 전환하되, 과도한 스무딩 문제를 **픽셀 공간 손실 + Detail Injection Network(DIN)**으로 해결. VAE 인코딩에서 손실되는 고주파 디테일을 DIN이 복원하며, 각 재질 채널의 특성에 맞는 개별 손실 설계로 albedo PSNR 9.9% 개선.

## 방법론

1. **One-step diffusion**: 50스텝 → 1스텝으로 추론 가속 (10.5배)
2. **Pixel-space losses**: 각 재질 채널(albedo, roughness, metallic)의 물리적 특성에 맞춘 개별 손실 함수
3. **Detail Injection Network (DIN)**: VAE 인코딩 시 손실되는 고주파 디테일을 입력 이미지에서 직접 주입하여 선명도 회복
4. **Multi-view 지원**: 다시점 이미지에서 일관된 material 추정

## 정량 결과

### 합성 데이터

| 데이터셋 | 메트릭 | StableIntrinsic | IDArb (baseline) | 개선율 |
|----------|--------|-----------------|------------------|--------|
| Objaverse | Albedo PSNR↑ | **32.67** | 29.73 | +9.9% |
| Objaverse | Metallic MSE↓ | **0.015** | 0.029 | −44.4% |
| Objaverse | Roughness MSE↓ | **0.008** | 0.020 | −60.0% |
| ShinyBlender | Albedo PSNR↑ | **34.28** | 30.20 | +13.5% |

### 실세계

| 데이터셋 | PSNR↑ | SSIM↑ |
|----------|-------|-------|
| Stanford-ORB | 32.33 | 0.882 |
| MIT-Intrinsic | 25.72 | 0.842 |

### 추론 속도 (NVIDIA V100)

| 태스크 | StableIntrinsic | IDArb | 가속 |
|--------|-----------------|-------|------|
| Single-view | **0.581s** | 6.130s | 10.5× |
| Multi-view | **2.344s** | 27.339s | 11.7× |

### DIN Ablation

| 설정 | Albedo PSNR | Metallic MSE |
|------|-------------|-------------|
| w/o DIN | 31.33 | 0.016 |
| **w/ DIN** | **32.67** | **0.015** |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 요구사양 | V100 (추론 0.58s/view) |

## PathFinder R&D 적용 가능성

- **Phase 1 속도 최적화 참조**: Ouroboros와 함께 단일 스텝 디퓨전의 실용성을 입증. PathFinder의 120fps 목표에 기여하는 아키텍처 패턴.
- **DIN 모듈 범용성**: VAE bottleneck에서의 디테일 손실 해결은 DiffusionRenderer/VideoMatGen 등 VAE 기반 파이프라인 전반에 적용 가능한 기법.
- **Multi-view 일관성**: 3DGS 복원 후 multi-view material 추정에 직접 활용 가능 (PathFinder Phase 2).

## 한계점

1. **조명 조건 민감**: 강한 조명에서 일관성 저하
2. **DIN 부작용**: 강한 조명의 텍스처 영역에서 고주파 하이라이트를 잘못 주입할 수 있음
3. **코드 미공개**: 재현 불가

## 관련 노트

- 260413_Ouroboros_CycleConsistent_Diffusion_Rendering_OURO — 동일 단일 스텝 패러다임, cycle consistency
- 260413_Neural_LightRig_MultiLight_Diffusion_Normal_Material_NLRG — Multi-light로 추정 불확실성 해소
- PathFinder_Master — PathFinder 프로젝트 허브
