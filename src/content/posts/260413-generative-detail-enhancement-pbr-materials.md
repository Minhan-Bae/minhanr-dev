---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/PBR
- tech/diffusion
- tech/texture-enhancement
source_url: https://arxiv.org/abs/2502.13994
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 기존 PBR 재질에 마모, 노화, 풍화 등 디테일을 off-the-shelf diffusion 모델로 추가하는 도구. 학습/파인튜닝
  불필요. UV 공간 correlated noise + projective attention bias로 multi-view consistency
  확보. NVIDIA Research + SIGGRAPH 2025.
slug: 260413-generative-detail-enhancement-pbr-materials
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2502.13994/gradient.png
  alt: 260413-generative-detail-enhancement-pbr-materials
date: '2026-04-13'
---


# Generative Detail Enhancement for Physically Based Materials

**저자**: Saeed Hadadan, Benedikt Bitterli, Tizian Zeltner, Jan Novák, Fabrice Rousselle, Jacob Munkberg, Jon Hasselgren, Bartlomiej Wronski, Matthias Zwicker
**소속**: NVIDIA Research
**발표**: SIGGRAPH 2025 (arXiv:2502.13994)

## 핵심 요약

PBR 재질의 마모, 노화, 풍화 등 사실적 디테일을 수작업으로 추가하는 것은 비용이 크다. 이 방법은 **기존 geometry, UV 매핑, 기본 재질에 off-the-shelf diffusion 모델을 적용**하여 텍스트 프롬프트로 디테일을 자동 생성. **학습/파인튜닝 없이** 기존 디퓨전 모델을 그대로 사용하며, 결과물은 2D PBR 텍스처로 출력되어 아티스트가 추가 편집 가능.

## 방법론

1. **Multi-view rendering**: 기존 geometry + UV + 기본 재질에서 다시점 렌더링
2. **Text-conditioned diffusion**: 텍스트 프롬프트 + 렌더 이미지로 디퓨전 모델 조건화 → 디테일 생성
3. **UV-space correlated noise**: 뷰 독립적 UV 공간에서 초기 노이즈를 생성 → multi-view consistency
4. **Projective attention bias**: Attention 메커니즘에 projective 제약 → 픽셀이 대응 위치에 강하게 attend
5. **Inverse differentiable rendering**: 생성된 이미지를 material 파라미터로 역투영 (backpropagation)

## 정량 결과

- **정량 메트릭 부재**: PSNR/SSIM/FID 미보고. 정성적 비교 + ablation 위주
- **Computational cost** (RTX 5880):
  - 16 views, 1024²: **2816초**, 20.4GB peak
  - 4 views, 512²: 6.2GB
- **비교 대상**: SPAD, Diffusion Handles, RGB↔X, DreamMat, TexPainter — 정성 비교에서 우위

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 (NVIDIA Research) |
| 모델 | ❌ (off-the-shelf diffusion 사용, 별도 모델 불필요) |
| 라이선스 | 미명시 |
| 요구사양 | RTX 5880, 6.2-20.4GB (views/해상도에 따라) |
| 특이사항 | **학습/파인튜닝 불필요** — plug-and-play |

## PathFinder R&D 적용 가능성

- **Phase 3 텍스처 향상**: PathFinder의 3DGS/mesh 에셋에 사실적 디테일(마모, 풍화)을 자동 추가. 기존 재질에 후처리로 적용 가능.
- **VideoMatGen 후처리**: VideoMatGen이 기본 PBR을 생성한 뒤, 이 방법으로 디테일을 강화하는 파이프라인.
- **Zero-training**: 파인튜닝 없이 기존 디퓨전 모델 활용 → 빠른 프로토타이핑.
- **NVIDIA 동일 팀**: DiffusionRenderer, VideoMatGen과 같은 NVIDIA 팀(Munkberg, Hasselgren) → 통합 가능성 높음.

## 한계점

1. **정량 평가 부재**: 객관적 성능 비교 어려움
2. **긴 처리 시간**: 16뷰 1024²에서 47분
3. **코드 미공개**: NVIDIA 내부 도구 수준
4. **Multi-view consistency**: UV-noise + attention bias로 개선했으나 완벽하지 않음

## 관련 노트

- 260330_VideoMatGen_PBR_Materials_Video_Diffusion_VMTG — 동일 NVIDIA 팀의 PBR 생성
- 260413_IntrinsiX_HighQuality_PBR_Image_Priors_INTX — Text-to-PBR 생성
- PathFinder_Master
