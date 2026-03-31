---
author: MinHanr
categories:
- Research
date: '2026-04-01'
summary: "Stanford + Zillow 공동 연구. 3DGS 렌더링의 floater·flickering·blur를 geometry-informed V2V 모델로 제거하여 NVS SOTA 달성. 실시간 변형 15 FPS. CVPR 2026 메인."
draft: false
slug: 260401-gaussfusion-geometry-informed-3dgs-refinement
tags:
- gaussian-splatting
- 3d-reconstruction
- video-generation
- CVPR2026
title: "GaussFusion: Geometry 기반 Video Generator로 Wild 3DGS 복원 품질을 SOTA로 끌어올리다"
---

## 한줄 요약

Stanford와 Zillow 공동 연구팀이 3D Gaussian Splatting(3DGS) 복원의 고질적 아티팩트(floater, flickering, blur)를 **geometry 기반 video-to-video 생성 모델**로 제거하는 GaussFusion을 발표했다. DL3DV와 RE10K 벤치마크에서 NVS SOTA를 달성하며, few-step distillation 변형은 **15 FPS 실시간** 인터랙티브 렌더링을 지원한다. CVPR 2026 메인 논문으로 채택.

## 연구 배경 및 동기

3D Gaussian Splatting은 NeRF 이후 실시간 3D 렌더링의 새로운 표준으로 부상했다. 그러나 현실 세계(in-the-wild) 환경에서의 3DGS 복원은 여전히 심각한 품질 문제를 안고 있다.

핵심 원인은 세 가지다:

1. **카메라 포즈 오류** — COLMAP 등 SfM 파이프라인의 부정확한 포즈 추정이 Gaussian primitive 위치를 왜곡
2. **불완전한 장면 커버리지** — 촬영 각도가 제한된 영역에서 hallucination 발생
3. **노이즈 초기화** — 포인트 클라우드의 outlier가 floater(부유 아티팩트)로 렌더링

기존 후처리 방식은 RGB 기반으로 특정 파이프라인에 종속되어 범용성이 떨어졌다. 예를 들어 3DGS optimization 기반 모델에 최적화된 후처리기는 feed-forward 모델에 그대로 적용할 수 없었다.

GaussFusion의 핵심 통찰은 **RGB가 아닌 geometry 정보를 조건으로 사용**하면 파이프라인에 구애받지 않는(pipeline-agnostic) 범용 후처리가 가능하다는 것이다.

![Figure 1: GaussFusion 전체 파이프라인 — Gaussian Primitives Video Buffer에서 depth, normals, opacity, covariance를 추출하여 V2V generator의 조건으로 활용](https://arxiv.org/html/2603.25053v1/extracted/6310847/figures/teaser.png)

## 핵심 기술: Gaussian Primitives Video Buffer

GaussFusion의 아키텍처는 기존 3DGS 복원 → geometry buffer 렌더링 → V2V 정제의 3단계로 구성된다.

### 1단계: Gaussian Primitives Buffer 렌더링

기존 3DGS 복원 결과에서 RGB 외에 4가지 기하학적 속성을 추가 렌더링한다:

| Buffer Channel | 설명 | 역할 |
|---|---|---|
| **Depth** | 각 픽셀의 깊이값 | 공간적 구조 파악 |
| **Normals** | 표면 법선 벡터 | 표면 방향성 인코딩 |
| **Opacity** | Gaussian의 불투명도 | floater 식별 (낮은 opacity = 의심 영역) |
| **Covariance** | Gaussian 분포의 공분산 | 형상 불확실성 인코딩 |

이 5채널(RGB + 4 geometry) 비디오 버퍼가 핵심이다. RGB만 사용하는 기존 방법 대비, geometry 채널이 아티팩트의 **원인**을 직접 인코딩하므로 더 정확한 정제가 가능하다.

### 2단계: Geometry-Informed Video-to-Video Generator

Gaussian Primitives Buffer를 조건으로 받는 video diffusion 모델이 temporally coherent한 정제 프레임을 생성한다.

핵심 설계 결정:

- **Video-level 생성** (이미지 단위 아님) → 프레임 간 시간적 일관성(temporal coherence) 보장
- **Geometry conditioning** → RGB 조건 대비 파이프라인 독립적
- **75,000+ 비디오 아티팩트 시뮬레이션 데이터셋** → 실제 복원에서 나타나는 다양한 열화 패턴을 합성하여 학습

### 3단계: Few-Step Distillation (실시간 변형)

Full 모델의 품질을 유지하면서 추론 속도를 극적으로 개선하는 distillation 레시피:

- 렌더링 중 **on-the-fly refinement** 가능
- **15 FPS** 실시간 인터랙티브 3D 응용 지원
- 추론 환경: RTX 4090 단일 GPU

## 정량적 성능

### Novel View Synthesis 품질 (Table 1)

| Method | PSNR ↑ | SSIM ↑ | LPIPS ↓ | FID ↓ |
|---|---|---|---|---|
| 3DGS (baseline) | 19.92 | 0.756 | 0.352 | 12.45 |
| **GaussFusion (Full)** | **22.55** | **0.832** | **0.278** | **3.93** |
| GaussFusion (Few-step) | 21.84 | 0.819 | 0.291 | 4.67 |

*DL3DV 벤치마크 기준. GaussFusion은 PSNR +2.63dB, FID 68% 개선*

### RE10K 벤치마크

| Method | PSNR ↑ | SSIM ↑ | LPIPS ↓ |
|---|---|---|---|
| **GaussFusion (Full)** | **28.65** | **0.944** | **0.180** |

### Feed-Forward 모델 호환성 (Table 2)

| Base Model | + GaussFusion | PSNR ↑ |
|---|---|---|
| DepthSplat | ✅ | 22.80 |
| MVSplat | ✅ | 19.76 |

핵심: optimization 기반뿐 아니라 **feed-forward 모델에도 동일하게 적용** 가능하다는 점이 pipeline-agnostic 설계의 실증.

### Ablation: 입력 모달리티별 기여도 (Table 4)

| 입력 구성 | PSNR | FID |
|---|---|---|
| RGB만 | 19.12 | 11.82 |
| + Depth | 19.87 | 8.94 |
| + Normal | 20.21 | 7.65 |
| + Opacity + Covariance | **20.75** | **6.72** |

**모든 geometry 채널이 기여**하며, 특히 opacity와 covariance 추가가 FID를 12% 추가 개선. Floater 제거에 opacity 채널이, blur 제거에 covariance 채널이 핵심 역할.

## 실용성 체크

| 항목 | 상태 |
|---|---|
| 논문 | ✅ [arXiv 2603.25053](https://arxiv.org/abs/2603.25053) |
| 코드 | ❌ 미공개 (프로젝트 페이지 존재) |
| 모델 | ❌ 미공개 |
| 데이터 | ⏳ 75K+ 비디오 데이터셋 공개 미확인 |
| 라이선스 | CC BY-NC-ND 4.0 |
| 요구사양 | A100/H100 (학습), RTX 4090 (추론, 15 FPS) |
| 학회 | **CVPR 2026 Main** |

## VFX 실무 시사점

GaussFusion이 VFX/3D 프로덕션에 미치는 영향은 직접적이다:

**1. 프로덕션 품질 격차 해소**

Wild 3DGS의 최대 약점인 floater/flickering을 후처리로 제거하면, 드론 촬영 → SfM → 3DGS 파이프라인이 전통 CG에 근접하는 품질을 달성할 수 있다. Zillow가 이미 SkyTours에서 대규모 상용 배포 중인 점이 이를 증명한다.

**2. Pipeline-Agnostic 후처리**

특정 3DGS 백본에 종속되지 않으므로, 기존 파이프라인에 **플러그인처럼 추가** 가능. 실제 VFX 스튜디오의 다양한 도구 체인에 통합이 용이하다.

**3. 계층적 품질 파이프라인**

Few-step 변형(15 FPS)을 프리뷰에, Full 모델을 최종 렌더에 사용하는 **2-tier 품질 파이프라인** 설계가 현실적. 실시간 프리뷰 → 고품질 최종 렌더의 전통적 CG 워크플로우와 자연스럽게 매칭된다.

**4. 데이터셋의 가치**

75,000+ 비디오의 아티팩트 시뮬레이션 데이터셋이 공개되면, 3DGS 품질 개선 연구 전체의 벤치마크 표준이 될 가능성이 높다.

## 한계점

- 코드·모델 미공개 상태로 재현 불가 (Gordon Wetzstein 랩은 과거 비교적 빠른 공개 이력)
- CC BY-NC-ND 라이선스로 상업적 활용에 제약
- Few-step 변형도 15 FPS로, 게임 엔진의 60+ FPS 기준에는 미달
- 기하학적 오류가 극심한 경우(완전히 틀린 포즈) 정제 한계 존재

## 출처

- [arXiv 2603.25053 — GaussFusion](https://arxiv.org/abs/2603.25053)
- [arXiv HTML version](https://arxiv.org/html/2603.25053v1)
- [Zillow SkyTours — 3DGS 상용 배포 사례](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/)
