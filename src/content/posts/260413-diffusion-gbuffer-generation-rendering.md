---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/G-buffer
- tech/diffusion
- tech/image-generation
source_url: https://arxiv.org/abs/2503.15147
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 텍스트 프롬프트 → G-buffer(albedo, normal, depth, roughness, metallic) 생성 → PBR-inspired
  branch network으로 최종 이미지 렌더링. 중간 G-buffer 표현을 통한 세밀한 편집 제어(object insertion, 조명 조절).
  156명 사용자 연구에서 68.48% 선호.
slug: 260413-diffusion-gbuffer-generation-rendering
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2503.15147/gradient.png
  alt: 260413-diffusion-gbuffer-generation-rendering
date: '2026-04-13'
---


# Diffusion-based G-buffer Generation and Rendering (PBR-Inspired Controllable Diffusion)

**발표**: arXiv:2503.15147 (2025-03-18, 개정 2026-02-07)

## 핵심 요약

기존 text-to-image 모델은 최종 RGB만 출력하여 사후 편집이 제한적이다. 이 논문은 **텍스트 프롬프트에서 G-buffer(albedo, normal, depth, roughness, metallic)를 먼저 생성**하고, **PBR-inspired modular branch network**이 G-buffer에서 최종 이미지를 렌더링하는 2단계 파이프라인. G-buffer 중간 표현 덕분에 특정 채널을 복사/붙이기(object insertion)하거나 irradiance 채널 마스킹(조명 조절)이 가능.

## 방법론

1. **G-buffer 생성**: 텍스트 프롬프트 → Stable Diffusion 기반 → 5채널 G-buffer (albedo, normal, depth, roughness, metallic)
2. **PBR branch network**: G-buffer 각 채널을 별도 branch로 처리 후 합성 → 최종 렌더링
3. **학습 데이터**: InteriorVerse(50K+) + Hypersim(70K+) = 120K+ 샘플
4. **편집 인터페이스**: G-buffer 채널별 복사/붙이기, 마스킹으로 직관적 편집

## 정량 결과

### Branch Network 효과

| 메트릭 | w/o Branch | w/ Branch |
|--------|-----------|-----------|
| MSE↓ | 0.0288 | **0.0068** |
| PSNR↑ | 15.99 | **21.99** |
| SSIM↑ | 0.635 | **0.807** |
| LPIPS↓ | 0.269 | **0.097** |

### 사용자 연구 (156명)

| 비교 | 선호도 |
|------|--------|
| 전체 품질 vs RGBX | **68.48%** |
| Object insertion vs RGBX | **72.67%** |
| Object movement vs Diffusion Handles | **65.38%** |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 요구사양 | 실내 데이터 기반 학습 |

## PathFinder R&D 적용 가능성

- **Forward rendering 경로**: DiffusionRenderer(이미지→G-buffer→이미지)의 보완 — 이 논문은 **텍스트→G-buffer→이미지**. PathFinder에서 "프롬프트 기반 VFX 씬 생성"의 직접 레퍼런스.
- **G-buffer 편집 UI**: 채널별 복사/붙이기/마스킹 인터페이스는 PathFinder의 G-buffer 편집 워크플로 설계에 참고.
- **PBR branch architecture**: 채널별 분리 처리 후 합성은 PathFinder의 모듈러 렌더링 파이프라인 설계 패턴.

## 한계점

1. **실내 편향**: InteriorVerse + Hypersim 기반으로 실외 성능 제한
2. **코드 미공개**: 재현 불가
3. **해상도 제한**: Stable Diffusion 기반 해상도 제약

## 관련 노트

- 260413_MAGE_Material_Aware_3D_GBuffer_Estimation_MAGE — Image → multi-view G-buffer
- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — Video → G-buffer (역방향)
- PathFinder_Master
