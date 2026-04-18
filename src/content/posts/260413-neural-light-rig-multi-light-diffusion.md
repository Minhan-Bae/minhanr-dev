---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/PBR
- tech/relighting
- tech/diffusion
- venue/CVPR2025
source_url: https://arxiv.org/abs/2412.09593
code_url: https://github.com/ZexinHe/Neural-LightRig
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 2D 디퓨전 모델의 조명 프라이어를 활용한 multi-light relighting → 다방향 조명 이미지 9장 생성 → 조명 불확실성을
  해소하여 G-buffer 모델의 normal/material 추정 정확도를 대폭 향상. Normal angular error 6.41°로 StableNormal(8.03°)
  대비 20% 개선, albedo PSNR 26.62.
slug: 260413-neural-light-rig-multi-light-diffusion
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2412.09593/gradient.png
  alt: 260413-neural-light-rig-multi-light-diffusion
date: '2026-04-13'
---


# Neural LightRig: Unlocking Accurate Object Normal and Material Estimation with Multi-Light Diffusion

**저자**: Zexin He, Tengfei Wang, Xin Huang, Xingang Pan, Ziwei Liu
**발표**: CVPR 2025 (arXiv:2412.09593)
**프로젝트**: [projects.zxhezexin.com/neural-lightrig](https://projects.zxhezexin.com/neural-lightrig/)

## 핵심 요약

단일 이미지에서의 intrinsic 추정은 조명 ambiguity로 인해 정확도가 제한된다. Neural LightRig은 **(1) multi-light diffusion model**이 입력 이미지에서 9방향 점광원 조명 이미지를 일관되게 생성하고, **(2) 대규모 G-buffer model**(U-Net)이 다방향 조명 이미지로부터 normal과 PBR material을 정확히 추정하는 2단계 프레임워크. 다방향 조명으로 단일 뷰의 조명 불확실성을 구조적으로 해소.

## 방법론

1. **Multi-Light Diffusion Model**: 합성 relighting 데이터셋에서 학습, 입력 이미지로부터 9개 방향의 점광원 조명 이미지를 일관되게 생성
2. **G-Buffer Model (U-Net)**: 9장의 multi-light 이미지를 입력으로 surface normal + albedo + roughness + metallic 추정
3. **Data augmentation**: Random degradation, intensity variation, orientation perturbation으로 합성-실세계 도메인 갭 해소
4. **Relighting 응용**: 추정된 G-buffer로 임의 조명 조건의 사실적 렌더링

## 정량 결과

### Surface Normal Estimation

| 방법 | Mean Error↓ | Median↓ | 11.25° Acc↑ |
|------|------------|---------|-------------|
| **Neural LightRig** | **6.413°** | **4.897°** | **82.85%** |
| StableNormal | 8.034° | 6.568° | 78.57% |
| GeoWizard | 8.455° | 6.926° | 74.92% |
| DSINE | 9.161° | 7.457° | 72.00% |
| RGB↔X | 14.847° | 13.704° | 49.83% |

### PBR Material & Relighting

| 방법 | Albedo PSNR↑ | Rough. PSNR↑ | Metal. PSNR↑ | Relight PSNR↑ | SSIM↑ | Time |
|------|-------------|-------------|-------------|-------------|-------|------|
| **Neural LightRig** | **26.62** | **23.44** | **26.23** | **30.12** | **0.960** | 5s |
| IntrinsicAnything | 23.88 | 17.25 | 22.00 | 27.98 | 0.947 | 120s |
| Yi et al. | 21.10 | 16.88 | 20.30 | 26.47 | 0.932 | 5s |
| RGB↔X | 16.26 | 19.21 | 16.65 | 20.78 | 0.893 | 15s |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [ZexinHe/Neural-LightRig](https://github.com/ZexinHe/Neural-LightRig) |
| 모델 | ✅ 체크포인트 + 데이터셋 공개 |
| 라이선스 | 미명시 |
| 요구사양 | 추론 5초 (IntrinsicAnything 120초 대비 24배 빠름) |

## PathFinder R&D 적용 가능성

- **Phase 1 핵심 기술**: Normal angular error 6.41°는 현존 최고 성능. PathFinder의 G-buffer 추출 파이프라인에서 normal 채널의 품질 기준점.
- **Albedo PSNR 26.62**: DiffusionRenderer(25.0)와 Materialist(19.53)를 크게 상회 → 단일 이미지 역렌더링의 새 기준.
- **Multi-light 전략**: 조명 ambiguity 해소를 위해 가상 조명을 디퓨전으로 생성하는 접근은 PathFinder의 실세계 비디오 처리에서 프레임별 조명 추정의 대안.
- **5초 추론**: 실시간은 아니지만 IntrinsicAnything(120s) 대비 24배 빠르며, PathFinder Phase 3의 프로덕션 워크플로에서 실용적 범위.

## 한계점

1. **극단 하이라이트/섀도**: Albedo 복원에서 강한 하이라이트 영역 오류
2. **해상도 제한**: 디퓨전 백본이 256×256로 디테일 캡처 한계
3. **단일 오브젝트 전용**: 복잡한 다중 오브젝트 씬 미지원

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 비디오 기반 역/순방향 렌더링
- 260413_Materialist_SingleImage_Inverse_Rendering_MTRL — 단일 이미지 물리 기반 편집
- 260413_StableIntrinsic_OneStep_MultiView_Material_SINT — 단일 스텝 multi-view material
- PathFinder_Master — PathFinder 프로젝트 허브
