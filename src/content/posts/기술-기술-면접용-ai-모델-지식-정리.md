---
author: MinHanr
categories:
  - Writing
cover:
  alt: person writing on white paper
  caption: Photo by [UX Indonesia](https://unsplash.com/photos/person-writing-on-white-paper-qC2n6RQU4Vw)
    on [Unsplash](https://unsplash.com)
  image: https://images.unsplash.com/photo-1587440871875-191322ee64b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDgzMTR8MHwxfHNlYXJjaHwzfHxSZXNlYXJjaHxlbnwwfDB8fHwxNzc0NjgyNDE1fDA&ixlib=rb-4.1.0&q=80&w=1080
date: '2025-12-15'
summary: "AI 기술 면접 대비를 위한 핵심 모델 지식 정리. Transformer의 Self-Attention 메커니즘부터 VAE의 잠재공간 학습, 손실 함수 설계까지 주요 AI 아키텍처의 구조와 원리를 체계적으로 설명한다."
draft: false
slug: 기술-기술-면접용-ai-모델-지식-정리
tags:
- Research
title: 1. Transformer 설명
---

## 1. Transformer 설명

```
【Transformer 핵심 개념】

■ 등장 배경
- 2017년 Google "Attention is All You Need" 논문에서 제안
- 기존 RNN/LSTM의 순차처리 한계를 극복하기 위해 설계
- 병렬처리가 가능하여 학습 속도가 획기적으로 향상

■ 핵심 구조
1. Self-Attention Mechanism (자기주의 메커니즘)
   - 입력 시퀀스의 모든 위치 간 관계를 동시에 계산
   - Query, Key, Value 세 벡터로 변환하여 유사도 계산
   - 각 단어가 문장 내 다른 모든 단어와의 연관성을 파악

2. Multi-Head Attention
   - 여러 개의 Attention을 병렬로 수행
   - 다양한 관점에서 문맥 정보를 포착
   - 일반적으로 8개 또는 12개의 Head 사용

3. Positional Encoding
   - 순차처리를 하지 않기 때문에 위치정보를 별도로 주입
   - Sin/Cos 함수를 사용한 고정 패턴 또는 학습 가능한 임베딩

4. Encoder-Decoder 구조
   - Encoder: 입력을 고차원 표현으로 변환 (6층 스택)
   - Decoder: 인코딩된 정보를 바탕으로 출력 생성
   - 각 층은 Self-Attention + Feed Forward로 구성

■ 주요 특징 및 장점
- 장거리 의존성(Long-range dependency) 문제 해결
- 병렬처리로 학습 시간 단축
- 문맥을 전역적으로 이해 가능
- Gradient Vanishing 문제 완화 (Residual Connection 사용)

■ 응용 분야
- NLP: BERT, GPT, T5 등의 기반 모델
- Vision: Vision Transformer (ViT)
- Multi-modal: CLIP, DALL-E
- 번역, 요약, 질의응답 등 다양한 태스크
```

---

## 2. VAE (Variational AutoEncoder) 설명

```
【VAE 핵심 개념】

■ 기본 개념
- AutoEncoder의 확률론적 변형 모델
- 데이터를 잠재공간(Latent Space)으로 압축하고 복원하는 생성모델
- 입력 데이터의 확률분포를 학습하여 새로운 샘플 생성 가능

■ 구조
1. Encoder (Recognition Model)
   - 입력 데이터 x를 잠재변수 z의 분포 파라미터로 변환
   - 평균(μ)과 분산(σ²)을 출력
   - q(z|x)를 근사 (사후확률 근사)

2. Latent Space (잠재공간)
   - 일반적으로 정규분포 N(μ, σ²)를 따르도록 제약
   - Reparameterization Trick 사용: z = μ + σ * ε (ε~N(0,1))
   - 이를 통해 역전파 가능

3. Decoder (Generative Model)
   - 잠재변수 z로부터 원본 데이터 x를 복원
   - p(x|z)를 모델링

■ 손실 함수
1. Reconstruction Loss
   - 입력과 복원된 출력 간의 차이
   - MSE 또는 Binary Cross-Entropy 사용

2. KL Divergence
   - 학습된 분포 q(z|x)와 사전분포 p(z) 간의 차이
   - 잠재공간이 정규분포를 따르도록 정규화
   - 과적합 방지 및 연속적인 잠재공간 형성

Total Loss = Reconstruction Loss + β * KL Divergence

■ 특징 및 장점
- 일반 AutoEncoder와 달리 확률적 샘플링으로 새로운 데이터 생성 가능
- 잠재공간이 연속적이고 의미있게 구조화됨
- Interpolation이 가능 (두 데이터 사이의 중간값 생성)
- 이론적으로 견고한 확률론적 프레임워크

■ 단점 및 한계
- 생성 품질이 GAN보다 다소 떨어질 수 있음 (흐릿한 이미지)
- KL Divergence와 Reconstruction 간의 균형 조절 필요
- Posterior Collapse 문제 발생 가능

■ 응용 분야
- 이미지 생성 및 변환
- 이상탐지 (Anomaly Detection)
- 데이터 압축 및 차원축소
- 약물 설계, 분자구조 생성
```

---

## 3. Diffusion Model 설명

```
【Diffusion Model 핵심 개념】

■ 기본 원리
- 열역학의 확산(Diffusion) 과정에서 영감을 받은 생성모델
- 데이터에 점진적으로 노이즈를 추가하는 Forward Process
- 노이즈에서 원본을 복원하는 Reverse Process를 학습

■ Forward Diffusion Process (순방향 과정)
- 원본 이미지 x₀에서 시작
- T 스텝에 걸쳐 점진적으로 가우시안 노이즈 추가
- 각 스텝마다 q(xₜ|xₜ₋₁) = N(√(1-βₜ)·xₜ₋₁, βₜI)
- 최종적으로 xₜ는 순수한 가우시안 노이즈가 됨
- Markov Chain 구조로 각 스텝은 이전 스텝에만 의존

■ Reverse Diffusion Process (역방향 과정)
- 노이즈 xₜ에서 시작하여 원본 x₀로 복원
- 신경망이 p(xₜ₋₁|xₜ)를 학습
- 실제로는 각 스텝의 노이즈를 예측하도록 학습
- U-Net 기반 아키텍처가 주로 사용됨

■ 학습 방식
- 목표: 추가된 노이즈를 예측하는 Denoising Network 학습
- 랜덤한 타임스텝 t를 선택하고 노이즈 추가
- 네트워크가 추가된 노이즈 ε를 예측
- 실제 노이즈와 예측 노이즈 간의 MSE Loss 최소화

Loss = E[||ε - ε_θ(xₜ, t)||²]

■ 주요 특징
- 고품질 이미지 생성 (GAN보다 안정적)
- 학습이 안정적이고 Mode Collapse 문제 없음
- 다양성(Diversity)이 높은 샘플 생성
- 점진적 생성 과정으로 중간 단계 제어 가능

■ 발전 및 변형
1. DDPM (Denoising Diffusion Probabilistic Models)
   - 기본 Diffusion 모델

2. DDIM (Denoising Diffusion Implicit Models)
   - 샘플링 속도 개선 (스텝 수 감소)
   - Deterministic 샘플링 가능

3. Latent Diffusion Models (LDM)
   - Stable Diffusion의 기반
   - VAE로 압축된 잠재공간에서 Diffusion 수행
   - 계산 비용 대폭 감소

4. Conditional Diffusion
   - Text-to-Image (텍스트 조건)
   - Classifier-Free Guidance로 제어 강화

■ 단점
- 생성 속도가 느림 (수십~수백 스텝 필요)
- 학습에 많은 계산자원 필요
- 샘플링 시간이 GAN보다 길음

■ 응용 분야
- Text-to-Image: Stable Diffusion, DALL-E 2, Imagen
- Image Editing, Inpainting
- Super Resolution
- Video Generation
- Audio Generation
```

---

## 4. RoLA (Rank-One Low-rank Adaptation) 설명

```
【RoLA 핵심 개념】

■ 배경 및 등장
- LoRA의 변형 기법
- 더욱 파라미터 효율적인 Fine-tuning을 위해 제안
- Rank-1 제약을 통해 LoRA보다 메모리 사용량 감소

※ 먼저 LoRA 이해 필요:
  LoRA (Low-Rank Adaptation)
  - 대규모 언어모델의 효율적 Fine-tuning 기법
  - 원본 가중치 W를 고정하고 저랭크 분해 행렬 추가
  - W + ΔW, 여기서 ΔW = BA (B: m×r, A: r×n, r<<min(m,n))
  - 학습 파라미터 수를 크게 줄임

■ RoLA의 핵심 아이디어
- LoRA의 랭크 r을 1로 제한 (Rank-One)
- ΔW = b·aᵀ (b: m×1, a: n×1)
- 두 개의 벡터만으로 가중치 업데이트 표현
- 극도로 압축된 형태의 적응

■ 구조적 특징
1. 파라미터 효율성
   - LoRA (rank r): 학습 파라미터 = (m+n)×r
   - RoLA (rank 1): 학습 파라미터 = m+n
   - 훨씬 적은 메모리 사용

2. 업데이트 방식
   - 각 레이어마다 두 개의 벡터 (b, a)만 학습
   - Outer product로 가중치 업데이트 행렬 생성
   - W_new = W_frozen + α·(b·aᵀ)

3. 스케일링 팩터
   - α는 업데이트 강도를 조절하는 하이퍼파라미터
   - 일반적으로 학습률과 독립적으로 설정

■ 장점
- 극도로 낮은 메모리 사용량
- 빠른 학습 속도
- 모델 병합(Merge)이 용이
- 여러 태스크를 동시에 학습 가능 (Multi-task)
- 원본 모델 구조 변경 없음

■ 단점 및 한계
- 표현력이 LoRA보다 제한적일 수 있음
- 복잡한 태스크에서는 성능 저하 가능
- Rank-1 제약으로 인한 학습 용량 감소

■ 적용 대상
- Transformer의 Attention 가중치 (Q, K, V, O)
- Feed-Forward 레이어
- 대규모 언어모델 (LLM) Fine-tuning
- Stable Diffusion 등 Vision 모델

■ LoRA 변형 기법 비교
1. LoRA: 가장 기본, rank r 사용
2. RoLA: Rank-1로 극한 압축
3. AdaLoRA: 동적으로 rank 조절
4. QLoRA: Quantization과 결합

■ 실무 활용 팁
- 간단한 도메인 적응에는 RoLA가 효과적
- 복잡한 태스크는 LoRA (rank 4~8) 권장
- 메모리가 극도로 제한된 환경에서 유용
- A100 1장으로도 대규모 모델 Fine-tuning 가능
```

---

## 면접 팁

```
【효과적인 답변 구성】

1. 정의 및 등장 배경 (Why)
   - 왜 이 기술이 등장했는지
   - 기존 방법의 한계점

2. 핵심 구조 및 원리 (What & How)
   - 주요 구성요소
   - 동작 메커니즘

3. 특징 및 장단점
   - 기술적 강점
   - 한계점 및 트레이드오프

4. 응용 및 실무 활용
   - 실제 적용 사례
   - 관련 프로젝트 경험 연결

【추가로 준비하면 좋은 포인트】

- Transformer: Attention Score 계산 수식, GPT vs BERT 차이
- VAE: β-VAE, Disentanglement 개념
- Diffusion: DDPM vs DDIM 차이, Classifier-Free Guidance
- RoLA: LoRA와의 정량적 비교, 실제 메모리 절감 효과
```

---

이 자료를 기반으로 각 개념을 **2-3분 내**로 설명할 수 있도록 연습하시면 좋습니다. 핵심은 **“왜 → 무엇을 → 어떻게 → 어디에”** 순서로 논리적으로 전개하는 것입니다.

추가로 궁금한 부분이나 더 깊이 있는 설명이 필요한 개념이 있으면 말씀해주세요!
---
## Related Notes
- our rendering research project
- TaylorDub
- our video generation project