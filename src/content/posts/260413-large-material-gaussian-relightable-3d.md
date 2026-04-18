---
tags:
- AI_R&D_Paper
- domain/3d
- tech/3DGS
- tech/PBR
- tech/relighting
- tech/diffusion
source_url: https://arxiv.org/abs/2509.22112
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: Multi-view material diffusion + Gaussian material representation으로 RGB 텍스처가
  아닌 PBR material(albedo, roughness, metallic)이 포함된 relightable 3D 에셋을 30초 만에 생성.
  Geometry CLIP 29.87, Appearance CLIP 30.48로 LGM/LaRa 대비 우위.
slug: 260413-large-material-gaussian-relightable-3d
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2509.22112/gradient.png
  alt: 260413-large-material-gaussian-relightable-3d
date: '2026-04-13'
---



# Large Material Gaussian Model for Relightable 3D Generation

**저자**: Jingrui Ye 외 7인
**발표**: arXiv:2509.22112 (2025-09-26)

## 핵심 요약

기존 3D 생성 모델(LGM, GRM)은 RGB 텍스처만 출력하여 조명이 bake-in 된다. MGM은 **(1) multiview material diffusion model**을 depth/normal 조건으로 파인튜닝하여 multi-view PBR material(albedo, roughness, metallic)을 생성하고, **(2) Gaussian material representation**으로 2DGS에 PBR 채널을 직접 모델링. 다양한 ambient light map으로 동적 relighting 가능한 3D 에셋을 **30초**만에 생성.

## 방법론

1. **Multiview material diffusion**: Depth + normal 조건으로 multi-view albedo/roughness/metallic 생성
2. **Gaussian material representation**: 2D Gaussian Splatting에 PBR 채널을 추가하여 각 splat이 material 속성을 보유
3. **Point cloud 렌더링**: 복원된 포인트 클라우드에서 PBR 속성을 렌더링 → ambient light map 적용으로 relighting
4. **Unshaded training**: Shaded 데이터 대신 unshaded material 데이터로 학습 → light baking 방지

## 정량 결과

### Baseline 비교

| 메트릭 | MGM | LaRa | LGM | GaussianAnything |
|--------|-----|------|-----|------------------|
| Geometry CLIP↑ | **29.87** | 27.02 | 27.84 | — |
| Appearance CLIP↑ | **30.48** | 28.77 | 29.31 | — |
| FID↓ | **89.55** | 97.95 | 101.60 | — |
| 생성 시간 | **30s** | — | — | — |

### vs PBR 텍스처 방법

| 메트릭 | MGM | DreamMat | Paint-it |
|--------|-----|----------|---------|
| Appearance CLIP↑ | **30.48** | 28.49 | — |
| FID↓ | **89.55** | — | 113.87 |
| 생성 시간 | **30s** | 1h15m | 40m |

### 사용자 연구 (1-5점)

| 메트릭 | MGM | LaRa | LGM |
|--------|-----|------|-----|
| Overall Quality | **3.80** | 3.45 | 3.63 |
| Geometric Integrity | **3.92** | — | — |
| Albedo Quality | **3.97** | — | — |
| Roughness Quality | **3.55** | — | — |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 요구사양 | 30초 생성 (GPU 미상) |

## PathFinder R&D 적용 가능성

- **Phase 2 3D 에셋 생성**: PathFinder의 3DGS 파이프라인에 PBR material을 포함한 relightable 에셋 생성. 30초 생성은 프로토타이핑에 실용적.
- **Gaussian material representation**: 2DGS + PBR 채널 구조는 PathFinder의 3DGS 기반 렌더링 파이프라인에 직접 통합 가능.
- **Unshaded training 전략**: Light baking 방지 기법은 VideoMatGen과 공유 가능한 학습 전략.

## 한계점

1. **Ill-posed material estimation**: Roughness/metallic 생성 부정확 사례
2. **투명/고반사/SSS 미지원**: BRDF 모델 한계
3. **고주파 디테일 한계**: Geometry/texture의 미세 디테일 복원 제한
4. **코드 미공개**

## 관련 노트

- 260413_MAGE_Material_Aware_3D_GBuffer_Estimation_MAGE — Multi-view G-buffer 추정
- 260413_SViM3D_Stable_Video_Material_Diffusion_3D_SVM3 — Video material diffusion 3D
- 260413_3DGS_Inverse_Rendering_Approximated_GI_3GIR — 3DGS + GI 역렌더링
- PathFinder_Master
