---
tags:
- AI_R&D_Paper
- domain/3d
- tech/PBR
- tech/video-diffusion
- tech/3d-generation
- venue/ICCV2025
source_url: https://arxiv.org/abs/2510.08271
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 최초의 camera-controllable multi-view 모델로 spatially varying PBR(basecolor, roughness,
  metallic) + normal + RGB를 동시 생성. Latent video diffusion 확장. Stability AI. ICCV 2025.
  Basecolor PSNR 28.68, SV3D 대비 multi-view consistency 0.57 vs 0.51.
slug: 260413-svi-m3d-stable-video-material-diffusion
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2510.08271/gradient.png
  alt: 260413-svi-m3d-stable-video-material-diffusion
date: '2026-04-13'
---


# SViM3D: Stable Video Material Diffusion for Single Image 3D Generation

**저자**: Engelhardt et al.
**소속**: Stability AI
**발표**: ICCV 2025 (arXiv:2510.08271)
**프로젝트**: [svim3d.aengelhardt.com](https://svim3d.aengelhardt.com/)

## 핵심 요약

SViM3D는 **최초의 camera-controllable multi-view 모델**로, 단일 이미지에서 **spatially varying PBR 파라미터(basecolor, roughness, metallic) + surface normal + RGB**를 동시 생성. Latent video diffusion model(SV3D)을 확장하여 카메라 포즈 시퀀스에 따른 다시점 PBR 출력을 지원. Object-centric inverse rendering을 확률적 생성 모델로 접근.

## 방법론

1. **SV3D 확장**: Latent video diffusion model에 PBR 출력 채널(basecolor, roughness, metallic, normal) 추가
2. **Camera conditioning**: 카메라 포즈 시퀀스 입력으로 다시점 제어
3. **Joint generation**: RGB + PBR + normal을 단일 디노이징 과정에서 동시 생성
4. **3D reconstruction**: 생성된 multi-view PBR로 relightable 3D 에셋 복원
5. **Homography correction**: Multi-view 정합성 향상 기법

## 정량 결과

### 단일 프레임 Material 품질

| 채널 | PSNR↑ | SSIM↑ | LPIPS/RMSE |
|------|-------|-------|-----------|
| Basecolor | **28.68** | **0.92** | 0.037 |
| Roughness-Metallic | 25.36 | — | RMSE 0.09 |
| Normal | 27.57 | — | RMSE 0.05 |

### Multi-view NVS (21 frames)

| 메트릭 | SViM3D | SV3D | SV3D+IID | SV3D+RGB↔X |
|--------|--------|------|----------|-----------|
| RGB PSNR↑ | **19.57** | 18.41 | — | — |
| Basecolor PSNR↑ | **18.27** | — | 15.62 | 15.15 |
| Multi-view Consistency↑ | **0.57** | — | 0.51 | 0.54 |

### 3D Reconstruction

| 설정 | PSNR↑ | SSIM↑ |
|------|-------|-------|
| Full | **22.4** | **0.90** |
| w/o Homography | 13.7 | 0.76 |

### Relighting (Stanford Orb)

| 메트릭 | 값 |
|--------|---|
| Relighting PSNR↑ | 21.86 |
| Relighting SSIM↑ | 0.90 |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 (Stability AI) |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 요구사양 | 20초 (21 views, 576×576), 15분 (3D 복원) |

## PathFinder R&D 적용 가능성

- **Phase 2 핵심 참조**: Video diffusion → multi-view PBR 동시 생성은 PathFinder의 "비디오에서 PBR 추출" 목표와 직접 부합. VideoMatGen(텍스트→PBR)과 상호보완.
- **Camera-controllable**: 카메라 포즈 제어가 가능하여 PathFinder의 다시점 렌더링 파이프라인에 통합 적합.
- **Stability AI 기반**: SV3D 생태계 위에 구축 → 오픈소스 공개 가능성.

## 한계점

1. **Object-centric**: 일반 비디오/씬 레벨 미지원
2. **투명 물체 미지원**: 복잡한 material 한계
3. **코드 미공개**: Stability AI 내부

## 관련 노트

- 260413_Large_Material_Gaussian_Relightable_3D_LMGM — Gaussian 기반 relightable 3D
- 260413_MAGE_Material_Aware_3D_GBuffer_Estimation_MAGE — Multi-view G-buffer
- 260330_VideoMatGen_PBR_Materials_Video_Diffusion_VMTG — NVIDIA PBR 비디오 디퓨전
- PathFinder_Master
