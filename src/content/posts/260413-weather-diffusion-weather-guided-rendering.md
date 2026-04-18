---
tags:
- AI_R&D_Paper
- domain/rendering
- domain/autonomous-driving
- tech/inverse-rendering
- tech/weather-synthesis
- tech/diffusion
source_url: https://arxiv.org/abs/2508.06982
code_available: false
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 자율주행 씬에서 다양한 기상/조명 조건의 forward/inverse rendering 프레임워크. Inverse renderer로
  material/geometry/lighting을 intrinsic map으로 분해, forward renderer로 기상 조건 텍스트 프롬프트
  기반 합성. CLIP-space 보간으로 세밀한 기상 제어. 38K 합성 + 18K 실세계 데이터셋 포함.
slug: 260413-weather-diffusion-weather-guided-rendering
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2508.06982/gradient.png
  alt: 260413-weather-diffusion-weather-guided-rendering
date: '2026-04-13'
---


# WeatherDiffusion: Weather-Guided Diffusion Model for Forward and Inverse Rendering

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-weather-diffusion-weather-guided-rendering/fig-1.png)
*Source: [arXiv 2508.06982 (Fig. 1)](https://arxiv.org/abs/2508.06982)*

**발표**: arXiv:2508.06982 (후속 제목: IntrinsicWeather: Controllable Weather Editing in Intrinsic Space)

## 핵심 요약

자율주행 씬에서 기상/조명 조건에 따른 외형 변화를 제어하기 위해, **(1) inverse renderer**가 다양한 기상 하에서 material, geometry, lighting을 intrinsic map으로 분해하고, **(2) forward renderer**가 intrinsic map + 기상 텍스트 프롬프트로 이미지를 합성. **Intrinsic Map-Aware Attention(MAA)**으로 고품질 역렌더링, **CLIP-space weather prompt interpolation**으로 세밀한 기상 제어.

## 방법론

1. **Inverse renderer**: 기상/조명 불변 intrinsic map 추출 (MAA 메커니즘)
2. **Forward renderer**: Intrinsic map + weather text prompt → 기상 조건 적용 이미지 합성
3. **CLIP-space interpolation**: 기상 프롬프트 간 연속 보간으로 세밀한 기상 강도 제어
4. **데이터셋**: 합성 38K + 실세계 18K, intrinsic map annotation 포함

## 정량 결과

- Object detection/segmentation 강건성 향상 (기상 증강 데이터)
- 구체적 수치는 논문 본문 참조 (자율주행 하류 태스크 메트릭)

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 데이터셋 | 38K synthetic + 18K real-world |

## PathFinder R&D 적용 가능성

- **간접 참조**: PathFinder의 VFX 중심과는 직접 관련 낮지만, intrinsic map 기반 forward/inverse rendering의 도메인 적용 사례로 참조.
- **MAA 메커니즘**: Intrinsic Map-Aware Attention은 DiffusionRenderer의 채널별 attention 설계에 참고 가능.
- **Weather control**: VFX에서 기상 변환(맑음→비, 낮→밤)은 실무 수요가 높으며, PathFinder 확장 기능 후보.

## 한계점

1. **자율주행 특화**: VFX 범용성 제한
2. **코드 미공개**

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — 범용 forward/inverse rendering
- PathFinder_Master

## 상세 배경 (보강)

IntrinsicWeather의 설계 철학은 **"픽셀 공간 대신 intrinsic 공간에서 편집한다"**는 단순한 통찰이다. 기존 weather editing은 RGB 픽셀을 직접 조작해 외형을 바꾸거나, weather restoration 파이프라인을 역으로 활용하는 식이었다. 두 접근 모두 재질·조명·기하 정보를 잃어버린 상태에서 편집을 시도하기 때문에 spatial correspondence 유지가 어렵고 대규모 outdoor 장면에서 분해 품질이 빠르게 떨어진다.

저자들은 이를 **inverse renderer + forward renderer** 구조로 재편했다. Inverse renderer가 입력 이미지에서 material, geometry, lighting을 intrinsic map으로 추출하고, forward renderer가 이를 텍스트 프롬프트와 결합하여 원하는 날씨 조건의 이미지를 생성한다. 핵심은 **intrinsic map-aware attention** — intrinsic 채널을 attention에 피드백하여 대형 outdoor 장면의 분해 품질을 끌어올린다. 또한 **CLIP-space weather prompt interpolation**을 도입해 "흐림 10%"처럼 fine-grained 제어가 가능하게 했다. 38k synthetic + 18k real 이미지의 intrinsic annotation 데이터셋이 학습 토대다.

## 시사점 (보강)

- **Autonomous driving downstream**: 다양한 날씨 조건의 annotated 데이터 부족이 자율주행 detection/segmentation 모델의 구조적 robustness 한계 원인이다. Controllable weather editing은 **low-cost 데이터 증강**으로 직결된다 — 동일 씬의 맑음/비/눈/안개 버전을 합성하여 학습에 투입 가능.
- **VFX·CG 파이프라인 적용**: 기존 날씨 합성은 particle FX + 후보정이 주류였다. Intrinsic-aware 접근은 **기하·재질을 보존하면서 기후 요소만 추가**하므로 shot-to-shot consistency가 담보된다. 특히 plate 기반 실사 합성에서 가치가 크다.
- **Inverse+forward 이중 구조의 일반화**: 이 설계는 날씨에 국한될 필요가 없다. 시간대(day/night), 재질 변환(wet/dry), 광원 위치 조정 등 **"intrinsic 기반 제어가 필요한 모든 편집"**으로 확장 가능한 프레임워크다.
