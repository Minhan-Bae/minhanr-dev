---
tags:
- AI_R&D_Paper
- domain/video
- domain/rendering
- tech/diffusion
- tech/controllable-generation
source_url: https://arxiv.org/abs/2511.21129
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 비디오 이해와 제어 가능한 비디오 생성을 통합하는 디퓨전 프레임워크. Hybrid Modality Control Strategy(HMCS)로
  depth/normal/segmentation/edge + intrinsic(albedo, roughness, metallic)을 라우팅/퓨전.
  Layer-wise 편집(relighting, material, object insertion) 지원.
slug: 260413-ctrl-vdiff-controllable-video-multimodal-diffusion
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2511.21129/gradient.png
  alt: 260413-ctrl-vdiff-controllable-video-multimodal-diffusion
date: '2026-04-13'
---


# CtrlVDiff: Controllable Video Generation via Unified Multimodal Video Diffusion

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-ctrl-vdiff-controllable-video-multimodal-diffusion/fig-1.png)
*Source: [arXiv 2511.21129 (Fig. 1)](https://arxiv.org/abs/2511.21129)*

**발표**: arXiv:2511.21129 (2025-11)

## 핵심 요약

Geometry-only 제어 신호(depth, edge)는 레이아웃만 지정하고 외형/재질/조명을 under-constrain한다. CtrlVDiff는 **Hybrid Modality Control Strategy(HMCS)**로 depth, normal, segmentation, edge + graphics-based intrinsic(albedo, roughness, metallic)을 라우팅/퓨전하여 비디오 이해와 제어 가능한 생성을 통합. 일부 모달리티 누락에도 robust하게 동작.

## 방법론

1. **HMCS**: 다중 모달리티(depth, normal, seg, edge, intrinsic)를 유연하게 라우팅/퓨전
2. **MMVideo 데이터셋**: Real+synthetic 하이브리드, 모달리티+캡션 정렬
3. **Layer-wise editing**: Relighting, material 조정, object insertion을 레이어별로
4. **Missing modality robustness**: 일부 입력 누락 시에도 안정적 생성
5. **Temporal coherence**: 강한 시간적 일관성

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 데이터셋 | MMVideo (real+synthetic hybrid) |

## PathFinder R&D 적용 가능성

- **통합 제어**: PathFinder의 VFX 파이프라인에서 다양한 G-buffer 채널을 **선택적으로** 조합하여 비디오를 생성/편집하는 아키텍처 참조. Missing modality 처리는 실무에서 불완전 G-buffer 상황에 유용.
- **Layer-wise editing**: Object insertion + relighting을 레이어별로 분리하는 편집은 PathFinder의 comp 워크플로와 호환.

## 한계점

1. **코드/모델 미공개**: 재현 불가
2. **데이터셋 의존**: MMVideo 비공개 시 학습 재현 어려움

## 관련 노트

- 260413_X2Video_Multimodal_Controllable_Video_Rendering_X2VD — Intrinsic-guided 비디오 렌더링
- 260412_V-RGBX_Intrinsic_Aware_Video_Editing_Keyframe_VRBX — Intrinsic 편집
- PathFinder_Master

## 상세 배경 (보강)

CtrlVDiff가 문제 삼는 출발점은 "geometry-only 제어 신호의 한계"다. Depth·edge 같은 구조적 큐는 레이아웃을 잘 지정하지만 외형·재질·조명은 **under-constrain** 상태로 남긴다. 결과적으로 relighting이나 material swap 같은 **물리적으로 의미 있는 편집**이 어려워지고, 시간 축에서 외형 드리프트가 자주 발생한다. 저자들은 graphics 기반 intrinsic(albedo, roughness, metallic)과 semantic 채널을 추가 모달리티로 편성하여 이 언더-제약 문제를 **직교적으로 보완**한다.

아키텍처적으로는 "임의 모달리티 부분집합 입력 + 누락 robust + temporal consistency 유지"라는 **세 가지 까다로운 요구사항**을 동시에 만족해야 한다. CtrlVDiff는 이를 **Hybrid Modality Control Strategy(HMCS)**로 해결한다. HMCS는 각 채널의 feature를 라우팅하고 융합하여 어떤 subset이 들어와도 안정적으로 비디오를 재렌더링한다. 데이터 측면에서는 real + synthetic 하이브리드인 **MMVideo**를 구축하여 per-pixel multimodal annotation과 caption을 동시 정렬했다.

## 시사점 (보강)

- **Layer-wise editing의 실용성**: Object insertion, material 조정, relighting을 **개별 레이어로 분리**하여 수정하는 방식은 VFX 컴포지팅 워크플로우와 구조적으로 정합된다. 전통적 compositor 파이프라인에서는 이미 분리된 레이어 개념을 쓰지만, 생성 모델이 이를 받아들이기는 최초에 가깝다.
- **Missing modality robustness의 의미**: 현실 파이프라인에서는 intrinsic map이 전부 갖춰진 경우가 드물다. 일부만 제공해도 안정적으로 동작한다는 특성은 "완전 G-buffer가 확보된 offline renderer" 가정에서 벗어나 **현장 촬영 소스 기반 생성**이라는 맥락을 열어준다.
- **State-of-the-art vs. reproducibility**: 벤치마크상 SOTA를 상회하지만 **코드·모델 미공개**라 재현성은 제한적이다. 후속 연구나 산업 적용 시 MMVideo 공개 여부가 결정적 변수가 될 것이다.
