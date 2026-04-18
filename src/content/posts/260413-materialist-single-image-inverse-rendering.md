---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/PBR
- tech/relighting
source_url: https://arxiv.org/abs/2501.03717
code_url: https://github.com/lez-s/Materialist
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 단일 이미지에서 학습 기반 초기 재질 예측 + 물리 기반 progressive differentiable rendering으로 환경맵과
  재질을 공동 최적화. Material editing, object insertion, relighting을 물리적으로 올바르게 수행.
slug: 260413-materialist-single-image-inverse-rendering
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2501.03717/gradient.png
  alt: 260413-materialist-single-image-inverse-rendering
date: '2026-04-13'
---


# Materialist: Physically Based Editing Using Single-Image Inverse Rendering

**저자**: Lezhong Wang 외 7인
**발표**: arXiv:2501.03717 (2025-01-07, v2 2025-06-26)
**프로젝트**: [lez-s.github.io/materialist_project](https://lez-s.github.io/materialist_project/)

## 핵심 요약

기존 이미지 편집은 neural network 기반(그림자/굴절 처리 약함) 또는 물리 기반 inverse rendering(다시점 필수)으로 양분되어 있었다. Materialist는 **단일 이미지**에서 (1) MatNet으로 초기 재질 속성(albedo, roughness, metallic, normal)을 예측하고, (2) progressive differentiable rendering으로 환경맵과 재질을 공동 최적화하여, 물리적으로 올바른 relighting, material editing, object insertion을 가능하게 한다. 투명도 편집도 완전한 장면 geometry 없이 동작.

## 방법론

1. **MatNet**: 사전학습된 네트워크로 albedo, roughness, metallic, normal, depth 초기 예측
2. **Progressive Differentiable Rendering**: 저해상도(4×2)에서 시작해 고해상도(32×16)까지 환경맵을 점진적 최적화. 렌더링 결과와 입력 이미지의 차이를 최소화하며 재질도 공동 미세조정
3. **δ-weighted refinement**: 재질 채널별 최적화 강도를 제어하는 δ 파라미터로 albedo vs roughness/metallic 업데이트 균형 조절
4. **투명도 편집**: 완전 geometry 없이도 단일 뷰에서 투명/반투명 재질 속성 조작 지원

## 정량 결과

### Inverse Rendering (InteriorVerse, 합성)

| 메트릭 | Materialist | Kocsis et al. | Zhu et al. | Li et al. |
|--------|-------------|---------------|-----------|----------|
| Albedo PSNR↑ | **19.53** | 12.77 | 13.41 | 6.17 |
| Albedo SSIM↑ | **0.811** | 0.656 | 0.680 | 0.488 |
| Roughness PSNR↑ | **16.63** | 9.07 | 13.67 | 8.67 |
| Metallic PSNR↑ | **18.66** | 7.23 | 15.60 | — |
| Normal Error↓ | **11.36°** | — | 26.87° | 37.70° |

### 실세계 (IIW Dataset)

| 메트릭 | Materialist | Kocsis | Zhu | Li |
|--------|-------------|--------|-----|-----|
| WHDR↓ | **0.197** | 0.206 | 0.232 | 0.342 |

### Environment Map 최적화

| 메트릭 | Materialist (w/ MatNet) | DPI | DiffusionLight |
|--------|------------------------|-----|----------------|
| Envmap PSNR↑ | **4.507** | 1.115 | 0.635 |
| Rerender PSNR↑ | **18.98** | 15.16 | 13.60 |
| SH Error↓ | **3.049** | 6.768 | 7.800 |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [lez-s/Materialist](https://github.com/lez-s/Materialist) |
| 모델 | ✅ 체크포인트 공개 |
| 라이선스 | 미명시 |
| 요구사양 | GPU (differentiable rendering 최적화 필요) |

## PathFinder R&D 적용 가능성

- **Phase 1 보완**: DiffusionRenderer가 scene-level 비디오 역렌더링이라면, Materialist는 **단일 이미지 정밀 역렌더링** + 물리 기반 편집의 보완 경로. 특히 환경맵 공동 최적화는 DiffusionRenderer가 약한 lighting estimation을 보완.
- **VFX 워크플로**: 단일 프레임에서 material decomposition → 물리 기반 편집은 comp 아티스트 워크플로와 직접 호환.
- **Object Insertion**: 물리적으로 올바른 그림자/반사가 포함된 오브젝트 합성은 PathFinder의 forward rendering 파이프라인에 통합 가능.

## 한계점

1. **Subsurface scattering 미모델링**: 얼굴 relighting에서 SSS 고정
2. **단일 뷰 geometry**: 전면만 복원, 후면 geometry 부재
3. **Specular highlight 고정**: 최적화 시 albedo에 고정되어 relighting 후에도 잔존
4. **환경맵 해상도**: 32×16 제한
5. **실외 씬**: 학습 데이터 편향으로 비실내 환경에서 성능 저하

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — Scene-level 비디오 역렌더링
- 260413_Neural_LightRig_MultiLight_Diffusion_Normal_Material_NLRG — Multi-light 기반 normal/material 추정
- 260413_IntrinsiX_HighQuality_PBR_Image_Priors_INTX — Text-to-PBR 생성
- PathFinder_Master — PathFinder 프로젝트 허브
