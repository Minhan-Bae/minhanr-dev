---
author: MinHanr
categories:
  - Visual
date: '2026-03-28'
draft: false
summary: "CausVid는 Diagonal Forcing 기법으로 bidirectional DiT를 causal autoregressive 모델로 distill하여, 실시간 스트리밍 비디오 생성과 장시간 시퀀스 안정성을 동시에 달성한 ICLR 2026 논문 분석."
slug: 260328-causvid-streaming-ar-video-diagonal-distillation-csvd
tags:
- AI_R&D_Paper
- tech/T2V
- tech/attention
title: 'CausVid: Streaming Autoregressive Video Generation via Diagonal Distillation'
---

# CausVid: Streaming Autoregressive Video Generation via Diagonal Distillation

**저자:** Jinxiu Liu, Xuanming Liu, Kangfu Mei, Yandong Wen, Ming-Hsuan Yang, Weiyang Liu
**소속:** South China Univ. of Technology, Westlake University, Johns Hopkins, UC Merced, CUHK
**발표:** ICLR 2026 / arXiv:2603.09488 (March 10, 2026)
**프로젝트:** https://causvid.github.io/

## 핵심 내용

대형 사전학습 Diffusion 모델의 비디오 생성 품질은 높지만, **실시간 스트리밍 생성**에는 한계가 있다. CausVid는 bidirectional diffusion 모델을 **autoregressive few-step 모델**로 distill하여 실시간 스트리밍 비디오 생성을 달성한다.

### 문제 분석

기존 비디오 DiT는 bidirectional attention으로 모든 프레임을 동시에 denoise한다. 이는:
- 전체 비디오를 한 번에 생성해야 함 → 실시간 불가
- 게임 시뮬레이션, 로봇 학습 등 순차적 프레임 생성이 필요한 응용에 부적합

### Diagonal Forcing (핵심 기법)

기존 temporal training 전략의 한계를 분석하고 새로운 방법 제안:

| 전략 | 장점 | 단점 |
|------|------|------|
| **Teacher Forcing** | 깨끗한 학습 신호 | train-inference 불일치 → error 누적 |
| **Diffusion Forcing** | noisy latent 노출로 robustness ↑ | 학습(noisy) vs 추론(clean) context 불일치 |
| **Diagonal Forcing** (제안) | 깨끗한 과거 + 모델 생성 최근 프레임 혼합 | 두 방법의 장점 결합, 약점 상호 보완 |

### 핵심 결과
- Bidirectional DiT를 **causal (autoregressive) 모델**로 변환
- Chunk-by-chunk 생성으로 **실시간 스트리밍** 가능
- Few-step distillation으로 계산 비용 대폭 감소
- 기존 autoregressive 방식 대비 **motion coherence** 및 **long-sequence stability** 크게 향상

### Causal DiT 아키텍처
```
Previous Chunks (clean) → Current Chunk (noisy) → Diagonal Forcing
→ Causal DiT denoise → Next frame chunk
→ Streaming output (chunk-by-chunk)
```

## Practical Implications

**our video generation project 프로젝트의 실시간 생성 방향에 핵심 참조.**

1. **실시간 비디오 생성의 현실화** — Bidirectional DiT를 causal로 변환하는 distillation은 ComfyUI 실시간 프리뷰나 인터랙티브 생성에 직접 적용 가능. 현재 our video generation project 파이프라인은 전체 클립을 한 번에 생성하는데, chunk-by-chunk 스트리밍이 가능하면 UX가 근본적으로 바뀜
2. **Diagonal Forcing 기법** — Teacher Forcing과 Diffusion Forcing의 한계를 동시에 극복하는 깔끔한 해법. 향후 우리 모델 학습 시 직접 적용 검토
3. **Spectrum과 조합 가능성** — Spectrum(feature forecasting으로 step 수 감소) + CausVid(autoregressive streaming) 조합이 가능하다면, 실시간 interactive T2V에 매우 근접
4. **게임/VR 시뮬레이션 연결** — chunk-by-chunk 생성은 HiggsField의 인터랙티브 캐릭터 시나리오에도 적합