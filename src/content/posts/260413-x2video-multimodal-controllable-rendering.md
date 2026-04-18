---
tags:
- AI_R&D_Paper
- domain/rendering
- domain/video
- tech/inverse-rendering
- tech/diffusion
source_url: https://arxiv.org/abs/2510.08530
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: Intrinsic 채널(albedo, normal, roughness, metallicity, irradiance) 가이드 비디오
  렌더링 + reference image/text 멀티모달 제어. Hybrid Self-Attention으로 시간 일관성 + 참조 충실도 동시 확보.
  Recursive Sampling으로 장시간 비디오 생성.
slug: 260413-x2video-multimodal-controllable-rendering
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-x2video-multimodal-controllable-rendering&category=AI_R%26D_Paper
  alt: X2Video Multimodal Controllable Video Rendering
date: '2026-04-13'
---

# X2Video: Adapting Diffusion Models for Multimodal Controllable Neural Video Rendering

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-x2video-multimodal-controllable-rendering/fig-1.png)
*Source: [arXiv 2510.08530 (Fig. 1)](https://arxiv.org/abs/2510.08530)*

**발표**: arXiv:2510.08530 (2025-10-09)
**프로젝트**: [luckyhzt.github.io/x2video](https://luckyhzt.github.io/x2video)

## 핵심 요약

이미지 기반 intrinsic-guided 생성(XRGB)을 비디오로 확장. **Intrinsic 채널**(albedo, normal, roughness, metallicity, irradiance)로 가이드하면서 **reference image + text prompt**로 글로벌/로컬 외형을 제어. Hybrid Self-Attention으로 프레임 간 시간 일관성과 참조 이미지 충실도를 동시 확보. Recursive Sampling으로 장시간 비디오 생성.

## 방법론

1. **XRGB→비디오 확장**: 이미지 기반 intrinsic-to-RGB 모델을 비디오로 확장
2. **Hybrid Self-Attention**: 시간적 일관성 + reference 충실도 동시 확보
3. **Masked Cross-Attention**: 글로벌/로컬 텍스트 프롬프트 분리 적용
4. **Recursive Sampling**: 장시간 temporal coherent 비디오 생성
5. **InteriorVideo 데이터셋**: 295 실내 장면, 1,154실, GT intrinsic 시퀀스

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 데이터셋 | InteriorVideo (1,154 rooms, GT intrinsic) |

## PathFinder R&D 적용 가능성

- **V-RGBX 비교**: V-RGBX(intrinsic 편집) vs X2Video(intrinsic 가이드 렌더링) — 둘 다 intrinsic 채널 기반이지만 X2Video는 **생성(forward rendering)**에 초점. PathFinder의 forward 파이프라인에 참조.
- **Multi-modal 제어**: Reference image + text의 글로벌/로컬 제어는 PathFinder의 VFX 워크플로(아티스트가 참조 + 프롬프트로 제어)와 직접 호환.
- **Recursive Sampling**: 장시간 비디오 생성은 PathFinder Phase 3의 프로덕션 시퀀스 처리에 필요.

## 한계점

1. **실내 편향**: InteriorVideo 데이터셋 기반
2. **코드 미공개**: 재현 불가

## 관련 노트

- 260412_V-RGBX_Intrinsic_Aware_Video_Editing_Keyframe_VRBX — Intrinsic 편집 (역방향)
- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — Forward rendering (보완적)
- PathFinder_Master
