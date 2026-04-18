---
author: MinHanr
categories:
  - Visual
cover:
  alt: 260328 FoveatedDiffusion overview
  caption: ''
  image: https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260328-foveated-diffusion-efficient-spatially-adaptive-video-generation/260328_FoveatedDiffusion_overview.png
date: '2026-03-28'
draft: false
slug: 260328-foveated-diffusion-efficient-spatially-adaptive-video-generation
summary: 시선 추적 기반 비균일 토큰 할당으로 디퓨전 생성 효율을 획기적으로 개선. our video generation project의 인터랙티브 비디오 생성이나 our rendering research project의
  실시간 렌더링 목표에 효율화 전략으로 참조.
tags:
- AI_R&D_Paper
title: 'Foveated Diffusion: Efficient Spatially Adaptive Image and Video Generation'
---

# Foveated Diffusion: Efficient Spatially Adaptive Image and Video Generation

> 인간 시각의 중심와(fovea) 특성을 활용, 시선 위치 기반 비균일 토큰 할당으로 디퓨전 모델의 이미지·비디오 생성 시간을 대폭 단축. 전해상도 생성과 지각적으로 구분 불가능한 결과를 달성. Stanford 연구팀.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260328-foveated-diffusion-efficient-spatially-adaptive-video-generation/fig-1.png)
*Source: [arXiv 2603.23491 (Fig. 1)](https://arxiv.org/abs/2603.23491)*

## 핵심 내용

**방법론**: (1) 인간 시각계의 편심도-의존 시력(eccentricity-dependent acuity) 특성 활용 — 중심와(fovea) 영역은 고해상도, 주변부(periphery)는 저해상도로 인지. (2) 시선 위치에 따른 마스크로 토큰을 비균일 할당 — 중심와 영역에 높은 토큰 밀도, 주변부에 낮은 밀도. (3) 고해상도 데이터에서 직접 혼합 해상도 토큰을 구성하는 원리적 메커니즘 개발. (4) 기존 베이스 모델에서 포스트 트레이닝으로 적응 가능, 해상도 간 콘텐츠 일관성 유지.

**정량적 결과**:

| 측면 | 결과 |
|------|------|
| 토큰 수 감소 | 전해상도 대비 대폭 감소 (구체적 비율은 본문 참조) |
| 생성 시간 단축 | 대폭 감소 |
| 지각적 품질 | 사용자 스터디에서 전해상도와 구분 불가 |
| 호환성 | 기존 디퓨전/플로우 매칭 모델에서 포스트 트레이닝으로 적응 |

*사용자 스터디 기반 정성적 검증 위주. 구체적 속도향상 배율은 논문 본문에서 확인 필요.*

**저자**: Brian Chao, Lior Yariv, Howard Xiao, Gordon Wetzstein (Stanford University)
**발표일**: 2026-03-24
**프로젝트 페이지**: https://bchao1.github.io/foveated-diffusion

## 출처

| 플랫폼 | 링크 |
|--------|------|
| arXiv | [2603.23491](https://arxiv.org/abs/2603.23491) |
| 프로젝트 | [bchao1.github.io/foveated-diffusion](https://bchao1.github.io/foveated-diffusion) |

---

## Related Notes
- our video generation project -- 영상 생성 SaaS 프로젝트
- 260328_ViBe_Ultra_High_Resolution_Video_Synthesis -- 4K 초고해상도 비디오 생성