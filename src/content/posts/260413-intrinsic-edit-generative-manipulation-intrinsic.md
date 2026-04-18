---
tags:
- AI_R&D_Paper
- domain/rendering
- domain/vfx
- tech/inverse-rendering
- tech/image-editing
source_url: https://arxiv.org/abs/2505.08889
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: Intrinsic-image latent space에서 동작하는 범용 이미지 편집 워크플로. RGB↔X 위에 exact diffusion
  inversion + disentangled channel manipulation으로 identity 보존과 채널 간 entanglement를
  해결. Color/texture 편집, object insertion/removal, global relighting을 단일 프레임워크로 통합.
slug: 260413-intrinsic-edit-generative-manipulation-intrinsic
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2505.08889/gradient.png
  alt: 260413-intrinsic-edit-generative-manipulation-intrinsic
date: '2026-04-13'
---


# IntrinsicEdit: Precise Generative Image Manipulation in Intrinsic Space

**저자**: Linjie Lyu, Valentin Deschaintre, Yannick Hold-Geoffroy, Miloš Hašan, Jae Shin Yoon, Thomas Leimkühler, Christian Theobalt, Iliyan Georgiev
**소속**: MPI Informatics · Adobe Research
**발표**: ACM Transactions on Graphics 44(4), 2025 (arXiv:2505.08889)
**프로젝트**: [intrinsic-edit.github.io](https://intrinsic-edit.github.io/)

## 핵심 요약

기존 생성적 이미지 편집은 정밀 제어가 부족하고 단일 편집 태스크에 특화되어 있다. IntrinsicEdit은 **RGB↔X diffusion 프레임워크 위에** exact diffusion inversion과 disentangled channel manipulation을 도입하여, intrinsic-image latent space에서 **pixel 정밀도의 다양한 편집**을 수행한다. Color/texture 조정, object insertion/removal, global relighting, 그리고 이들의 조합을 단일 워크플로로 처리하며, 글로벌 조명 효과를 자동 해결.

## 방법론

1. **RGB↔X 기반**: 입력 이미지를 albedo/normal/material/irradiance로 분해
2. **Exact Diffusion Inversion**: 편집 시 identity 보존을 위한 정밀 역추론
3. **Disentangled Channel Manipulation**: intrinsic 채널 간 entanglement 해소 → 특정 채널만 독립 편집
4. **X→RGB Forward Synthesis**: 편집된 intrinsic 채널에서 글로벌 조명 효과가 반영된 RGB 재합성 (50스텝)
5. **Multi-task**: color editing, texture editing, object insertion, object removal, relighting, 조합

## 정량 결과

### Material Editing (합성)
- 10 color-editing 쌍, 4 roughness-editing 쌍에서 PSNR/LPIPS 기준 **모든 baseline 상회**
- 비교 대상: RGB↔X, IID, Grounded-Instruct-Pix2Pix, TurboEdit

### Object Removal (실사, 12 쌍)
- 전체 이미지: Photoshop에 근접한 identity 보존 (마스크 외 영역 pixel 보존)
- 마스크 내: **텍스처 보존 최우수** (Photoshop, SDXL inpainting, AnyDoor 대비)

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 (프로젝트 페이지만 존재) |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 (Adobe Research) |
| 요구사양 | 512×512에서 75초 전처리 + 5초 추론 (50스텝) |
| 해상도 | 4K 불가 (메모리 제한) |

## PathFinder R&D 적용 가능성

- **VFX 편집 레퍼런스**: V-RGBX(비디오)의 이미지 버전 — 단일 프레임에서의 intrinsic 편집 워크플로 표준으로 참조.
- **채널 분리 편집**: Disentangled manipulation은 PathFinder의 G-buffer 편집 UI 설계에 직접 참고 (예: roughness만 변경하고 albedo 유지).
- **Adobe 연구**: 프로덕션 지향 연구로 실무 적용성 검증이 이미 내재.

## 한계점

1. **느린 전처리**: 512×512에서 75초 → 실시간 불가
2. **4K 미지원**: 메모리 한계로 고해상도 편집 불가
3. **코드 미공개**: Adobe Research 소속으로 공개 시기 불명
4. **사용자 연구 부재**: 정량 평가는 있으나 공식 사용자 연구 미수행

## 관련 노트

- 260412_V-RGBX_Intrinsic_Aware_Video_Editing_Keyframe_VRBX — 비디오 버전 intrinsic 편집
- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 기반 RGB↔X 프레임워크
- PathFinder_Master — PathFinder 프로젝트 허브
