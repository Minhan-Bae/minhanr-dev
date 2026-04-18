---
tags:
- AI_R&D_Paper
- domain/rendering
- domain/3d
- tech/3DGS
- tech/inverse-rendering
- tech/global-illumination
source_url: https://arxiv.org/abs/2504.01358
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 3D Gaussian Splatting에 screen-space ray tracing 기반 1-bounce GI 근사를 통합한 inverse
  rendering. Deferred shading으로 per-pixel G-buffer 생성 → Monte-Carlo SSR로 간접 조명 추정.
  37 FPS 실시간 편집 가능.
slug: 260413-3dgs-inverse-rendering-approximated-gi-3gir
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2504.01358/gradient.png
  alt: 260413-3dgs-inverse-rendering-approximated-gi-3gir
date: '2026-04-13'
---



# 3D Gaussian Inverse Rendering with Approximated Global Illumination

**저자**: Zirui Wu et al.
**발표**: arXiv:2504.01358 (2025-04-02)

## 핵심 요약

기존 3DGS inverse rendering은 직접 조명만 모델링하여 간접 조명(GI) 영향을 material에 bake-in 시킨다. 이 논문은 **screen-space Monte-Carlo ray tracing**으로 1-bounce 간접 조명을 근사하여, 직접/간접 조명을 분리 추정. 핵심 관찰: 간접광의 상당 부분은 현재 뷰 프러스텀 내 가시 표면에서 기원하므로 screen-space에서 효율적 추정 가능. **37 FPS 실시간** geometry/material/lighting 편집 지원.

## 방법론

1. **Deferred shading**: 3DGS 렌더링 → per-pixel G-buffer (normal, albedo, roughness, metallic, depth)
2. **Screen-space ray tracing (SSR)**: G-buffer 위에서 Monte-Carlo 레이 트레이싱 → 1-bounce 간접 조명 추정
3. **Direct + Indirect composition**: 직접 셰이딩 + 간접 셰이딩 합성 → 최종 이미지
4. **Scene editing**: 분해된 geometry/material/lighting 각각 독립 편집 가능

## 정량 결과

### Novel View Synthesis

| 씬 | PSNR↑ | SSIM↑ | LPIPS↓ |
|----|-------|-------|--------|
| Garage-0 | 28.14 | 0.837 | 0.159 |
| Garage-3 | 36.23 | 0.958 | 0.042 |
| Campus-0 | 29.66 | 0.865 | 0.181 |
| Campus-1 | 26.37 | 0.870 | 0.139 |

### vs GaussianShader

| 씬 | Ours PSNR | GShader PSNR | 차이 |
|----|-----------|-------------|------|
| Garage-0 | **28.14** | 25.02 | +3.12 |

### Rendering Speed

| 방법 | FPS (960×540, RTX 4090) |
|------|------------------------|
| **Ours** | **37** |
| Ours (w/o SSR) | 38 |
| PVG/StreetGS | 69-74 |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ (씬별 최적화) |
| 라이선스 | 미명시 |
| 요구사양 | RTX 4090, 37 FPS 실시간 |

## PathFinder R&D 적용 가능성

- **Phase 1 핵심**: PathFinder의 3DGS + 역렌더링 파이프라인에서 **GI 분리**는 핵심 미해결 과제. Screen-space ray tracing은 DiffusionRenderer(이미지 기반)와 달리 **3DGS 네이티브** GI 근사 → 직접 통합 가능.
- **37 FPS**: PathFinder의 120fps 목표에는 미달이지만, GI 포함 실시간 편집이 가능한 최초 사례로 baseline.
- **Deferred shading**: G-buffer 인터페이스가 PathFinder의 다른 모듈(DiffusionRenderer, VideoMatGen)과 호환.

## 한계점

1. **Screen-space 한계**: Non-differentiable ray marching → 최적화 불안정
2. **실외 성능**: 원거리 광원 상호작용에서 성능 저하
3. **1-bounce 제한**: 다중 바운스 GI 미모델링
4. **코드 미공개**: 재현 불가

## 관련 노트

- 260413_InvRGBL_Inverse_Rendering_Color_LiDAR_IRGL — LiDAR 기반 inverse rendering
- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 디퓨전 기반 (보완적)
- PathFinder_Master
