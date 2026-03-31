---
title: "Diffusion을 넘어서: Flow Matching이 바꾸는 비디오 생성의 미래"
date: 2026-03-28
draft: false
author: MinHanr
tags: ["diffusion", "flow-matching", "video-generation", "paper-review", "OmniV2V"]
categories: ["Research"]
summary: "고비용 ODE 시뮬레이션 없이 직선 궤적으로 고품질 생성을 달성하는 Flow Matching, 그리고 이를 비디오 편집에 통합한 OmniV2V. 이론에서 응용까지의 연결을 분석합니다."
description: "Flow Matching의 수학적 혁신과 OmniV2V의 비디오 생성/편집 통합 프레임워크를 분석합니다. Continuous Normalizing Flows, Optimal Transport, MM-DiT 기반 비디오 편집의 최전선을 다룹니다."
keywords: ["Flow Matching", "OmniV2V", "Diffusion", "video generation", "CNF", "Optimal Transport", "비디오 편집", "생성 모델"]
---

Diffusion 모델이 이미지 생성의 표준이 된 지금, 그 다음 패러다임은 이미 등장했습니다. **Flow Matching**(2023)은 기존 Diffusion의 복잡한 확률 과정을 직선 궤적으로 단순화하여 훈련 효율과 샘플링 속도를 동시에 개선했습니다. 그리고 **OmniV2V**(2025)는 이 기술을 비디오 도메인으로 확장하여, 생성과 편집을 하나의 프레임워크로 통합했습니다.

이 글에서는 이론(Flow Matching)에서 응용(OmniV2V)으로 이어지는 기술적 연결을 분석합니다.

## Flow Matching: 시뮬레이션 프리 생성 모델의 등장

Flow Matching(FM)은 Continuous Normalizing Flows(CNFs)의 훈련 방식을 근본적으로 재설계한 방법론입니다.

### 핵심 혁신: ODE 시뮬레이션 제거

기존 CNF는 훈련 과정에서 고비용의 ODE 시뮬레이션이 필요했습니다. FM은 이를 **벡터 필드 직접 회귀(Vector Field Regression)**로 대체합니다.

**손실 함수:**

$$L_{FM}(\theta) = E_{t, p_t(x)} \|v_t(x) - u_t(x)\|^2$$

여기서 $v_t(x)$는 학습 네트워크, $u_t(x)$는 타겟 벡터 필드입니다.

### 조건부 유동 매칭(CFM)과 Optimal Transport

FM의 실용적 핵심은 **Conditional Flow Matching**입니다. 주변 확률 경로 대신 조건부 벡터 필드를 학습하여 최적해를 도출합니다. 여기에 **Optimal Transport(OT) 경로** — 즉 직선 형태의 궤적 — 를 적용하면 샘플링 속도와 품질이 동시에 개선됩니다.

| 구분 | 훈련 방식 | 궤적 형태 | 샘플링 효율 |
|------|----------|----------|------------|
| **기존 CNF** | ODE 시뮬레이션 필요 | 임의의 곡선 | 낮음 |
| **Diffusion** | SDE 기반 | 곡선 위주 | 중간 |
| **Flow Matching** | 시뮬레이션 프리 | 직선 (OT) | **높음** |

### 실험 결과

ImageNet 64x64 기준, FM-OT 모델이 **FID 14.45**를 기록하여 DDPM(17.36) 및 Score Matching(19.74)을 상회합니다. 직선 궤적 덕분에 Diffusion 대비 약 **60% 수준의 NFE(Number of Function Evaluations)**만으로 동등한 품질을 달성합니다.

## OmniV2V: Flow Matching 기반 비디오 생성/편집 통합

OmniV2V는 Flow Matching이 적용된 **HunyuanVideo(MM-DiT)**를 백본으로 삼아, 비디오 생성과 편집을 단일 프레임워크로 통합한 모델입니다.

### 아키텍처: Latent-Fusion Video Tokenizer

3D-VAE 기반의 Latent-Fusion Video Tokenizer로 마스크된 비디오와 소스 비디오를 결합합니다. Visual-Text Instruction Module(LLaVA 활용)이 지시어, 텍스트 프롬프트, 참조 이미지를 토큰화합니다.

특히 참조 이미지를 비디오의 **-1번째 프레임**으로 간주하여 배치하는 방식이 인상적입니다. 이를 통해 별도의 ControlNet 없이도 자연스러운 조건 주입이 가능해집니다.

### 성능: 기존 모델 상회

| 메트릭 | OmniV2V | VACE 1.3B | Kling 1.6 |
|--------|---------|-----------|-----------|
| **FVD** (낮을수록 좋음) | **900.35** | 942.87 | 1012.54 |
| **Temporal Consistency** | **0.967** | 0.961 | 0.955 |
| **Face-sim** | **0.614** | 0.583 | 0.592 |

### 통합의 가치

이전에는 객체 교체, Inpainting, Pose-guided 생성 등이 각각 별도의 모델이 필요했습니다. OmniV2V는 이를 하나의 모델로 통합하여 파이프라인 복잡도를 크게 줄였습니다.

## 이론에서 응용으로: 왜 이 연결이 중요한가

Flow Matching이 제공한 **수학적 효율성**(훈련 시간 단축 + 직선 궤적 샘플링)은 OmniV2V 같은 대규모 비디오 모델이 실용적인 편집 도구로 기능할 수 있게 하는 핵심 엔진입니다.

**기술적 시사점:**

1. **모델 구조의 단순화**: 복잡한 확률 과정을 직선 경로로 단순화하는 것이 대규모 모델 훈련의 핵심입니다. Flow Matching → OmniV2V의 사례가 이를 증명합니다.

2. **멀티모달 제어**: OmniV2V의 시각-텍스트 정렬 방식은 비디오 업스케일링, 실시간 비디오 합성, VFX 포스트 프로덕션 등으로 확장될 수 있습니다.

3. **경량화된 조건 주입**: 복잡한 ControlNet 대신 FC 레이어 + Token Fusion 방식은 프로덕션 환경에서의 추론 속도를 크게 개선합니다.

## VFX 파이프라인에서의 활용 전망

콘텐츠 제작 현장에서 Flow Matching 기반 비디오 모델의 등장은 직접적인 영향을 미칩니다:

- **포스트 프로덕션 자동화**: 객체 교체, 배경 편집, 스타일 전환을 단일 모델로 처리하여 렌더 팜 의존도를 줄일 수 있습니다.
- **실시간 프리비즈**: OT 경로의 빠른 샘플링을 활용하면, 촬영 현장에서의 실시간 비주얼 프리비주얼라이제이션이 가능해집니다.
- **에디터 네이티브 AI**: NLE(비선형 편집기)에 직접 통합되는 AI 편집 기능의 기반 기술로 자리잡을 수 있습니다.

## 남은 과제

- Flow Matching의 조건부 유동이 OT를 따르더라도, 전체 분포 관점의 Marginal Vector Field가 글로벌 OT 해라는 보장은 없습니다.
- OmniV2V는 작은 객체 식별이나 복잡한 손동작 생성에서 여전히 한계를 보입니다.
- 비등방성 Gaussian 경로 설계 및 Super-resolution으로의 확장이 차기 연구 과제입니다.

2026년, Diffusion의 다음 단계는 이미 시작되었습니다. Flow Matching이 제공하는 수학적 우아함이 비디오 생성의 실용화를 가속하고 있습니다.

---

*이 글은 personal knowledge system 볼트의 연구 노트를 기반으로 작성되었습니다.*
