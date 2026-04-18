---
author: MinHanr
categories:
  - Visual
date: '2026-03-29'
summary: "사전학습된 비디오 디퓨전 모델을 결정론적 깊이 추정기로 변환하는 DVD 프레임워크를 분석한다. 기존 SOTA 대비 163배 적은 데이터로 zero-shot 비디오 깊이 추정 최고 성능을 달성하며, Latent Manifold Rectification으로 기하학적 hallucination 문제를 근본적으로 해결했다."
draft: false
slug: 260329-dvd-deterministic-video-depth-diffusion-priors
tags:
- AI_R&D_Paper
- tech/depth-estimation
- tech/T2V
title: 'DVD: Deterministic Video Depth Estimation with Generative Priors'
---

# DVD: Deterministic Video Depth Estimation with Generative Priors

**저자:** Hongfei Zhang, Harold Haodong Chen, Chenfei Liao, Jing He 외 (EnVision Research)
**발표:** 2026-03-12 (arXiv: 2603.12250)
**프로젝트:** https://dvd-project.github.io/
**코드:** https://github.com/EnVision-Research/DVD

## 문제 정의

비디오 깊이 추정의 근본적 딜레마:
- **Generative 모델**: 확률적 기하학적 hallucination + scale drift
- **Discriminative 모델**: 대규모 레이블 데이터셋 필요

→ DVD는 **사전학습된 video diffusion model을 single-pass depth regressor로 결정론적 변환**하는 최초의 프레임워크.

## 핵심 기술 (3대 설계)

### 1. Diffusion Timestep as Structural Anchor
- Diffusion timestep을 **구조적 앵커로 재활용**
- 글로벌 안정성과 고주파 디테일 간의 균형 달성

### 2. Latent Manifold Rectification (LMR)
- 회귀 유도 over-smoothing을 **미분 제약조건(differential constraints)** 으로 교정
- 선명한 경계(sharp boundaries)와 일관된 모션(coherent motion) 복원

### 3. Global Affine Coherence
- Inter-window divergence를 바운딩하는 **내재적 속성**
- 복잡한 temporal alignment 없이 **장시간 비디오의 seamless 추론** 가능

## 정량적 결과

| 메트릭 | 수치 |
|--------|------|
| 성능 | 벤치마크 전반에서 **SOTA zero-shot** 달성 |
| 데이터 효율 | 367K 프레임으로 학습 — 선두 discriminative 모델(VDA: 60M 프레임) 대비 **163× 적은** 데이터 |
| 기반 모델 | WanV2.1 video diffusion model |

- Video Depth Anything(VDA, CVPR 2025 Highlight) 대비 163배 적은 데이터로 SOTA 달성
- 기존 generative 접근의 stochastic hallucination 문제를 근본적으로 해결

## 오픈소스 현황

**전체 학습 파이프라인 공개** — SOTA 비디오 깊이 추정을 위한 완전한 training suite.

| 항목 | 내용 |
|------|------|
| GitHub | https://github.com/EnVision-Research/DVD |
| Pre-trained weights | HuggingFace에서 다운로드 (ckpt/ 디렉토리) |
| 추론 결과 | inference_results/ — depth map + visualizer video |
| 설정 | train_config/ — YAML 하이퍼파라미터 |
| 핵심 코드 | `diffsynth/pipelines/wan_video_new_determine.py` |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ github.com/EnVision-Research/DVD (Apache-2.0) |
| 모델 | ✅ HuggingFace에 공개 (CC-BY-NC-4.0, 비상용) |
| 데이터 | 367K 프레임 학습 데이터 (공개 여부 확인 필요) |
| 라이선스 | 코드: Apache-2.0 / 모델: CC-BY-NC-4.0 (비상용) |
| 요구사양 | WanV2.1 기반 → A100 80GB 권장 추정 / RTX 4090으로 추론 가능성 |

## Practical Implications

**our depth estimation project 프로젝트에 직결되는 연구:**

1. **Diffusion → Depth의 결정론적 전환**: 기존 depth diffusion 모델들은 확률적 샘플링으로 일관성 문제가 있었는데, DVD는 이를 single-pass regression으로 근본 해결. bit depth expansion에서도 동일 접근이 가능 — diffusion 기반 HDR 복원에서 deterministic output을 보장하는 방법론.

2. **163× 데이터 효율**: video foundation model의 깊은 geometric prior를 활용하면 소량 데이터로도 SOTA 달성. our depth estimation project에서 HDR 학습 데이터 부족 문제를 해결하는 전이학습 전략으로 활용 가능.

3. **LMR(Latent Manifold Rectification)**: over-smoothing 방지 기법이 bit depth expansion의 false contour 제거에 직접 적용 가능. 미분 제약조건으로 gradient edge를 보존하면서 양자화 노이즈를 제거.

4. **Global Affine Coherence**: 장시간 비디오의 temporal consistency를 복잡한 정렬 없이 달성 → 영상 전체에 걸친 일관된 depth/HDR 추정에 필수적.

5. **our rendering research project에도 관련**: depth estimation은 Gaussian Splatting 재구성의 초기화에 핵심. DVD의 zero-shot 고품질 depth는 sparse-view 3DGS reconstruction의 기하학적 prior로 활용 가능.

6. **코드+모델 완전 공개** (코드 Apache-2.0) → 즉시 실험 가능. 모델은 CC-BY-NC이므로 연구용 활용에 제한 없음.