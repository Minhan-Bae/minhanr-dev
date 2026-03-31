---
title: "2026년 AI 모델 면접 완전정복 — Transformer부터 RAG까지 7대 핵심 개념"
date: 2026-03-28
draft: false
author: MinHanr
tags: ["ai-interview", "transformer", "diffusion", "MoE", "LoRA", "RLHF", "DPO", "RAG"]
categories: ["Tutorial"]
summary: "AI/ML 면접에서 반드시 나오는 7가지 핵심 개념을 '왜 → 무엇을 → 어떻게 → 어디에' 구조로 정리합니다. 2026년 3월 기준 최신 발전 사항을 반영했습니다."
description: "Transformer, VAE, Diffusion Model, LoRA/RoLA, MoE, RLHF/DPO, RAG — AI 면접 필수 7대 개념을 2026년 최신 기준으로 정리한 종합 가이드입니다. Flash Attention 3, Flow Matching, Agentic RAG 등 최신 트렌드를 포함합니다."
keywords: ["AI 면접", "Transformer", "Diffusion Model", "LoRA", "MoE", "RLHF", "DPO", "RAG", "2026", "면접 준비"]
---

AI/ML 분야 면접에서 반복적으로 등장하는 핵심 개념 7가지를 정리합니다. 각 개념을 **2~3분 내**로 설명할 수 있도록 **"왜 → 무엇을 → 어떻게 → 어디에"** 순서로 구성했으며, 2026년 3월 기준 최신 발전 사항을 반영했습니다.

---

## 1. Transformer

### 등장 배경

2017년 Google의 "Attention is All You Need"에서 제안되었습니다. 기존 RNN/LSTM의 순차처리 한계를 극복하기 위해 설계되었으며, 병렬처리가 가능하여 학습 속도가 획기적으로 향상되었습니다.

### 핵심 구조

**Self-Attention Mechanism**: 입력 시퀀스의 모든 위치 간 관계를 동시에 계산합니다.

$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) \cdot V$$

- **Multi-Head Attention**: 여러 Attention을 병렬 수행하여 다양한 관점의 문맥 포착 (8~12개 Head)
- **Positional Encoding**: 순차처리를 하지 않으므로 위치정보를 별도 주입. 최신: RoPE (Rotary Position Embedding)
- **Encoder-Decoder**: 6층 스택, 각 층은 Self-Attention + Feed Forward

### 2026년 최신 발전

| 기술 | 핵심 | 효과 |
|------|------|------|
| **Flash Attention 3** | H100 최적화, warp specialization | 원본 대비 2~4x 속도 향상 |
| **GQA** (Grouped-Query Attention) | 쿼리 헤드를 그룹으로 나눠 KV 공유 | MHA 품질 + MQA 효율의 균형 |
| **라우터 기반 동적 어텐션** | 토큰별 MHA/GQA/MQA 분기를 동적 선택 | 품질-효율 최적 균형을 학습으로 탐색 |

### 응용

NLP(BERT, GPT, Llama, Qwen), Vision(ViT, DiT), Multi-modal(CLIP, DALL-E, GPT-4V, Gemini)

---

## 2. VAE (Variational AutoEncoder)

### 기본 개념

AutoEncoder의 확률론적 변형입니다. 데이터를 잠재공간(Latent Space)으로 압축하고 복원하는 생성모델로, 입력 데이터의 확률분포를 학습하여 새로운 샘플을 생성합니다.

### 구조

1. **Encoder**: 입력 x → 평균(μ)과 분산(σ²) 출력. q(z|x)를 근사
2. **Latent Space**: Reparameterization Trick — z = μ + σ × ε (ε~N(0,1))로 역전파 가능하게
3. **Decoder**: 잠재변수 z → 원본 데이터 x 복원. p(x|z)를 모델링

### 손실 함수

$$\text{Total Loss} = \text{Reconstruction Loss} + \beta \cdot \text{KL Divergence}$$

- Reconstruction Loss: 입력과 복원 출력의 차이 (MSE 또는 BCE)
- KL Divergence: 학습 분포와 사전분포 간 차이 → 잠재공간의 정규성 보장

### 2026년 현재 위상

Stable Diffusion의 핵심 구성요소로, 이미지를 Latent Space로 압축하는 역할을 담당합니다. VQ-VAE 계열이 이산 표현 학습에 활발히 사용되고 있습니다.

---

## 3. Diffusion Model

### 기본 원리

열역학의 확산 과정에서 영감을 받은 생성모델입니다. 데이터에 점진적으로 노이즈를 추가(Forward)하고, 노이즈에서 원본을 복원(Reverse)하는 과정을 학습합니다.

$$L = E\left[\|\epsilon - \epsilon_\theta(x_t, t)\|^2\right]$$

### 주요 발전 계보

| 세대 | 모델 | 핵심 |
|------|------|------|
| 1세대 | DDPM | 기본 Diffusion |
| 2세대 | DDIM | 스텝 수 감소, Deterministic |
| 3세대 | **Latent Diffusion (LDM)** | VAE 잠재공간에서 수행 → Stable Diffusion |
| 4세대 | **DiT** | U-Net → Transformer 백본 |
| 5세대 | **Flow Matching** | ODE 직선 경로, 이론적 효율 극대화 |
| 최신 | **Consistency Models** | 1~2스텝 생성, 속도 근본 해결 |

### 면접 핵심 포인트

- DiT vs U-Net 차이점
- Flow Matching이 왜 DDPM보다 효율적인지 (직선 궤적 → NFE 60% 감소)
- Classifier-Free Guidance 원리

---

## 4. LoRA / RoLA (Low-Rank Adaptation)

### 핵심 아이디어

대규모 모델의 Full Fine-tuning 비용을 0.1~1% 수준으로 절감합니다. 원본 가중치 W를 고정하고 저랭크 분해 행렬만 학습합니다.

$$W_{\text{new}} = W_{\text{frozen}} + \alpha \cdot (B \cdot A)$$

B: m×r, A: r×n, r ≪ min(m,n)

### 2026년 변형 기법 비교

| 기법 | 핵심 | 적합한 상황 |
|------|------|-----------|
| **LoRA** | 기본, rank r | 범용 |
| **RoLA** | Rank-1 극한 압축 | 메모리 극한 |
| **AdaLoRA** | 동적 rank 조절 | 레이어별 중요도 다를 때 |
| **QLoRA** | 4-bit 양자화 결합 | 단일 GPU로 70B 학습 |
| **DoRA** | 방향/크기 분리 학습 | Full FT 근접 성능 필요 시 |

### 실무 활용 팁

- 간단한 도메인 적응: rank 4~8
- 복잡한 태스크: rank 16~64, DoRA 고려
- 다중 사용자 서빙: LoRA 어댑터 핫스왑으로 하나의 기본 모델로 다수 서빙

---

## 5. MoE (Mixture of Experts)

### 기본 원리

하나의 모델 안에 여러 "전문가(Expert)" 서브네트워크를 두고, 입력마다 라우터가 가장 적합한 전문가만 활성화합니다. 전체 파라미터는 크지만 추론 시에는 일부만 사용하여 효율적으로 스케일링합니다.

$$\text{Output} = \sum_{i \in \text{Top-k}} G(x)_i \cdot \text{Expert}_i(x)$$

### 주요 모델 사례

| 모델 | 전문가 | 총 파라미터 | 활성 파라미터 |
|------|--------|-----------|------------|
| Mixtral 8x7B | 8개, Top-2 | 56B | ~13B |
| DeepSeek-V3 | 256개 | 671B | - |
| Grok-1 | 8개 | 314B | - |

### 면접 필수 비교: Dense vs MoE

- Dense 7B ≈ MoE 8x7B(Top-2) 추론 비용
- 그러나 MoE의 실효 용량은 훨씬 큼
- 트레이드오프: **메모리**(MoE가 큼) vs **연산**(동일) vs **품질**(MoE 우세)

---

## 6. RLHF / DPO (Alignment)

### 왜 필요한가

사전학습된 LLM은 "다음 토큰 예측"만 학습합니다. 유용하고, 정직하고, 무해한 응답을 위해 **인간 선호에 맞는 정렬(Alignment)**이 필요합니다.

### RLHF: 3단계 파이프라인

1. **SFT** (Supervised Fine-Tuning): 고품질 데모 데이터로 기본 지시 따르기
2. **Reward Model**: 인간 선호 랭킹(A > B)으로 보상 모델 학습
3. **PPO**: 보상 모델 기반 RL 최적화 + KL 제약

### DPO: 2026년의 주류

별도 보상 모델 없이 선호 데이터에서 직접 정책 최적화합니다. 수학적으로 RLHF와 동치임이 증명되었습니다.

| 항목 | RLHF (PPO) | DPO |
|------|-----------|-----|
| 보상 모델 | 필요 | **불필요** |
| 학습 안정성 | 낮음 | **높음** |
| 구현 복잡도 | 높음 | **낮음** |
| 이론적 등가 | 기준 | RLHF와 동치 |

### 추가 변형 (보너스 포인트)

- **ORPO**: SFT + DPO를 단일 단계로 통합
- **KTO**: 선호 쌍 없이 개별 "좋음/나쁨" 라벨만으로 학습
- **GRPO** (DeepSeek): 그룹 단위 상대 보상으로 PPO 단순화

---

## 7. RAG (Retrieval-Augmented Generation)

### 왜 필요한가

LLM의 지식은 학습 데이터에 고정(cutoff 문제)되고, 환각(Hallucination)이 발생합니다. RAG는 외부 지식을 검색하여 동적으로 주입하는 비용 효율적 해결책입니다.

### 아키텍처: 3단계

1. **Indexing**: 문서 → 청크 분할 → 임베딩 벡터 → 벡터 DB 저장
2. **Retrieval**: 쿼리 벡터화 → 유사도 검색 → Top-k 반환
3. **Generation**: 검색 결과를 컨텍스트로 LLM에 주입 → 응답 생성

### RAG vs Fine-tuning (면접 빈출)

| 항목 | RAG | Fine-tuning |
|------|-----|------------|
| 지식 업데이트 | **즉시** (문서 교체) | 재학습 필요 |
| 비용 | **낮음** | 높음 |
| 환각 감소 | **효과적** | 제한적 |
| 스타일 제어 | 제한적 | **효과적** |

### 2026년: RAG 2.0

| 발전 | 핵심 |
|------|------|
| **하이브리드 검색** | BM25(키워드) + 벡터(의미) 결합 |
| **재귀적 검색** | 검색 → 요약 → 재검색 반복 |
| **멀티모달 RAG** | 이미지, 테이블, 그래프도 검색 대상 |
| **Agentic RAG** | 에이전트가 검색 전략을 자율 결정, 도구 호출과 결합 |

### 실무 최적화 포인트

- 청크 크기: 256~1024 토큰, 태스크별 조정
- 리랭킹(Reranking): Cross-encoder로 검색 결과 재정렬
- 프롬프트: "주어진 컨텍스트에 기반하여 답하세요"

---

## 면접 답변 구성 팁

모든 개념을 이 4단계로 설명하면 논리적이고 완결된 답변이 됩니다:

1. **정의 및 등장 배경 (Why)**: 왜 이 기술이 등장했는지, 기존 한계점
2. **핵심 구조 및 원리 (What & How)**: 주요 구성요소, 동작 메커니즘
3. **특징 및 장단점**: 기술적 강점, 트레이드오프
4. **응용 및 실무 활용**: 실제 적용 사례, 프로젝트 경험 연결

---

*이 글은 personal knowledge system 볼트의 연구 노트를 기반으로 작성되었습니다. 2026년 3월 기준.*
