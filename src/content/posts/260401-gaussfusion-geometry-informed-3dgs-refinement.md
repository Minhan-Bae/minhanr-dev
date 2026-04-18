---
tags: [AI_R&D_Paper, domain/rendering, domain/3d, tech/gaussian-splatting, tech/video-editing]
source_type: paper-review
source_url: https://arxiv.org/abs/2603.25053
code_available: false
model_available: false
license: unknown
status: growing
publish: true
slug: 260401-gaussfusion-geometry-informed-3dgs-refinement
created: 2026-03-30
relevance: 5
related: [PathFinder]
summary: "GaussFusion: Geometry-Informed Video Generator로 Wild 3DGS 복원 품질 혁신 Stanford + Zillow 공동 연구."
categories:
  - Research
---

# GaussFusion: Geometry-Informed Video Generator로 Wild 3DGS 복원 품질 혁신

> Stanford + Zillow 공동 연구. 3D Gaussian Splatting 렌더링의 floater, 깜빡임, blur 아티팩트를 geometry-informed video-to-video 생성 모델로 제거하여 NVS 품질을 SOTA로 끌어올림. 실시간 변형은 16 FPS.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260401-gaussfusion-geometry-informed-3dgs-refinement/fig-1.jpg)
*Source: [lidarnews.com](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/)*

## 핵심 내용

### 문제 정의

현실 세계(in-the-wild) 3DGS 복원은 카메라 포즈 오류, 불완전한 커버리지, 노이즈 초기화로 인해 floater(부유 아티팩트), 깜빡임(flickering), blur가 빈번하게 발생한다. 기존 후처리 방식은 RGB 기반으로 단일 파이프라인에 종속되어 범용성이 부족하다.

### 핵심 아이디어

**Gaussian Primitives Video Buffer** — 기존 3DGS 복원에서 depth, normals, opacity, covariance를 인코딩한 기하학적 비디오 버퍼를 렌더링하고, 이를 조건으로 video-to-video diffusion 모델이 temporally coherent한 아티팩트-free 프레임을 생성한다.

기존 접근법과의 결정적 차이:
- RGB 기반이 아닌 **geometry 기반 conditioning** → 파이프라인 불가지론적(pipeline-agnostic)
- optimization 기반(3DGS)과 feed-forward 기반 모두에서 동작
- 단순 이미지 복원이 아닌 **비디오 생성** 접근 → temporal coherence 확보

### 3대 기여

1. **Geometry-Informed V2V 모델**: 3DGS geometric 렌더를 조건으로 하는 video-to-video 생성 모델. 다양한 복원 파이프라인의 아티팩트를 범용적으로 제거.

2. **아티팩트 시뮬레이션 데이터셋**: 75,000+ 비디오를 포함하는 포괄적 아티팩트 시뮬레이션 전략. 실제 복원 열화(degradation)의 넓은 스펙트럼을 합성하여 학습.

3. **Few-step Finetuning Recipe**: 효율적 변형을 위한 few-step distillation. 렌더링 중 on-the-fly refinement 가능. **실시간 16 FPS**로 interactive 3D 응용 지원.

### 성능

- Novel View Synthesis 벤치마크에서 **SOTA 성능** 달성
- 효율적 변형: 유사한 품질 유지하면서 **16 FPS 실시간** 인터랙티브 렌더링
- Optimization-based와 feed-forward 3DGS 모두에서 일관된 개선

### 저자

- Stanford University: Liyuan Zhu, Gordon Wetzstein, Iro Armeni
- Zillow Group: Manjunath Narayana, Michal Stary, Will Hutchcroft

Zillow는 SkyTours에서 3DGS를 최초로 대규모 상용 배포한 부동산 기업. 드론 영상 → SfM → 점군 → 3DGS 파이프라인을 프로덕션에서 운용 중이며, 이 논문은 해당 파이프라인의 품질 개선에 직결된다.

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 미공개 (논문 발표 4일차, 프로젝트 페이지 존재) |
| 모델 | ❌ 미공개 |
| 데이터 | ❌ 미공개 (75K+ 비디오 데이터셋, DL3DV+RE10K 기반 합성 — 공개 계획 미언급) |
| 라이선스 | 미명시 |
| 요구사양 | Video diffusion 모델 기반 → 추정 A100/H100급 (학습), RTX 4090 가능 (추론, 16 FPS) |

## 나에게 주는 시사점

**PathFinder 직접 적용 가능성 — 매우 높음**

GaussFusion의 geometry-informed V2V 접근은 PathFinder의 핵심 과제와 정확히 일치한다:

1. **AOV 분해 파이프라인 확장**: PathFinder가 추구하는 depth/normal/albedo AOV 분해와 GaussFusion의 Gaussian Primitives Buffer(depth, normals, opacity, covariance)가 구조적으로 동일. PathFinder의 AOV 기반 리라이팅 결과를 GaussFusion식 V2V로 temporal refinement하는 하이브리드 파이프라인 설계 가능.

2. **프로덕션 품질 격차 해소**: Wild 3DGS의 최대 약점인 floater/flickering을 후처리로 제거하면, PathFinder의 실시간 렌더링 파이프라인에서 프로덕션 품질에 근접. 기존 GS 표준화(glTF, OpenUSD 26.03) 노트의 "VFX 프로덕션에서의 3DGS 품질은 전통 CG 대비 아직 열위" 한계를 정면으로 해결.

3. **16 FPS 실시간**: Few-step distillation 변형이 16 FPS를 달성하므로, PathFinder의 120fps 실시간 목표와 결합 시 — GaussFusion을 저해상도 프리뷰 품질 보정에 활용하고, 최종 렌더는 full quality로 — 계층적 품질 파이프라인 구성이 현실적.

4. **Pipeline-agnostic 설계**: optimization 기반/feed-forward 모두 지원하므로, PathFinder가 어떤 3DGS 백본을 선택하든 후처리 모듈로 통합 가능.

**주시 사항**: 코드 공개 시점 모니터링 필요. Gordon Wetzstein 랩(Stanford Computational Imaging)은 과거 논문들의 코드를 비교적 빠르게 공개하는 경향.

## 출처

- [arXiv 2603.25053 — GaussFusion](https://arxiv.org/abs/2603.25053)
- [arXiv HTML version](https://arxiv.org/html/2603.25053v1)
- [Zillow SkyTours GS 상용 배포](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/)
