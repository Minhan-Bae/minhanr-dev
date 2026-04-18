---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/3d-generation
- tech/PBR
- tech/G-buffer
- venue/CVPR2025
source_url: https://openaccess.thecvf.com/content/CVPR2025/papers/Wang_MAGE__Single_Image_to_Material-Aware_3D_via_the_Multi-View_CVPR_2025_paper.pdf
code_url: https://github.com/onpix/mage
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 전통 deferred rendering에서 영감을 받아 단일 이미지에서 multi-view G-buffer(XYZ, normal,
  albedo, roughness, metallic)를 다중 도메인 이미지로 동시 추정. 3D geometry + decomposed material을
  한 번에 생성하는 CVPR 2025 접근.
slug: 260413-mage-material-aware-3d-gbuffer-estimation
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-mage-material-aware-3d-gbuffer-estimation&category=Research
  alt: 260413-mage-material-aware-3d-gbuffer-estimation
date: '2026-04-13'
---


# MAGE: Single Image to Material-Aware 3D via the Multi-View G-Buffer Estimation Model

**저자**: Haoyuan Wang, Zhenwei Wang, Xiaoxiao Long, Cheng Lin, Gerhard Hancke, Rynson W.H. Lau
**소속**: City University of Hong Kong
**발표**: CVPR 2025

## 핵심 요약

기존 single-image 3D 생성은 RGB 텍스처만 생성하고 material 속성을 무시하거나 별도 파이프라인으로 처리했다. MAGE는 **전통 deferred rendering 파이프라인**에서 영감을 받아, 단일 이미지에서 **multi-view G-buffer**(XYZ 좌표, normal, albedo, roughness, metallic)를 다중 도메인 이미지로 동시 추정하는 모델. geometry + material을 한 번에 생성하여 relighting 가능한 3D 에셋을 바로 출력.

## 방법론

1. **Multi-view G-buffer estimation**: 단일 RGB 이미지 → 다시점 G-buffer (XYZ, normal, albedo, roughness, metallic) 동시 예측
2. **Deferred rendering 영감**: 각 G-buffer 채널을 별도 도메인 이미지로 모델링
3. **Diffusion backbone**: 다시점 일관성을 확보하면서 모든 PBR 채널을 joint 생성
4. **3D 복원**: 추정된 multi-view G-buffer에서 3D mesh + PBR material 복원

## 정량 결과

CVPR 2025 논문으로 구체적 수치는 [논문 PDF](https://openaccess.thecvf.com/content/CVPR2025/papers/Wang_MAGE__Single_Image_to_Material-Aware_3D_via_the_Multi-View_CVPR_2025_paper.pdf) 참조. 기존 방법(SyncMVD, GIMDiffusion) 대비 G-buffer 품질과 3D 복원에서 우위.

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [onpix/mage](https://github.com/onpix/mage) |
| 모델 | ✅ 체크포인트 공개 |
| 라이선스 | 미명시 |
| 요구사양 | GPU (diffusion 기반) |

## PathFinder R&D 적용 가능성

- **Phase 1-2 핵심**: 단일 이미지 → multi-view G-buffer는 PathFinder의 "입력 이미지/비디오에서 G-buffer 자동 추출" 목표에 직접 부합. DiffusionRenderer(비디오)와 MAGE(단일 이미지)의 상호보완.
- **Deferred rendering 패러다임**: G-buffer를 중간 표현으로 사용하는 접근은 PathFinder의 아키텍처 설계와 동일한 철학.
- **코드 공개**: 즉시 실험 가능.

## 한계점

1. **단일 이미지 입력 한계**: 가려진 영역의 material 추정 불확실
2. **Multi-view consistency**: 디퓨전 기반으로 뷰 간 미세 불일치 가능

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 비디오 기반 G-buffer (보완적)
- 260413_Neural_LightRig_MultiLight_Diffusion_Normal_Material_NLRG — Multi-light G-buffer
- 260413_Large_Material_Gaussian_Relightable_3D_LMGM — Gaussian 기반 relightable 3D
- PathFinder_Master
