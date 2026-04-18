---
tags:
- AI_R&D_Paper
- domain/video
- domain/diffusion
- tech/world-model
- tech/foundation-model
source_url: https://arxiv.org/abs/2501.03575
code_available: true
model_available: true
license: NVIDIA Open Model License
status: published
created: 2026-04-13
summary: NVIDIA의 Physical AI를 위한 World Foundation Model 플랫폼. 비디오 큐레이션 파이프라인(20M시간→100M
  클립) + 사전학습 world foundation model(Cosmos Predict/Transfer 7B/14B) + tokenizer. DiffusionRenderer와
  VideoMatGen의 기반 아키텍처.
slug: 260413-cosmos-world-foundation-model-nvidia
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-cosmos-world-foundation-model-nvidia&category=AI_R%26D_Paper
  alt: Cosmos World Foundation Model
date: '2026-04-13'
---

# Cosmos World Foundation Model Platform for Physical AI

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-cosmos-world-foundation-model-nvidia/fig-1.jpg)
*Source: [arXiv 2501.03575 (Fig. 1)](https://arxiv.org/abs/2501.03575)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-cosmos-world-foundation-model-nvidia/fig-2.jpg)
*Source: [nvidia.com](https://www.nvidia.com/en-us/ai/cosmos/)*

**저자**: Yogesh Balaji 외 76인 (NVIDIA)
**발표**: arXiv:2501.03575 (2025-01-07, 업데이트 2025-07-09)
**공식**: [nvidia.com/ai/cosmos](https://www.nvidia.com/en-us/ai/cosmos/)

## 핵심 요약

Cosmos는 Physical AI(로봇, 자율주행)를 위한 **World Foundation Model 플랫폼**. (1) 20M시간 비디오에서 100M 클립을 추출하는 큐레이션 파이프라인, (2) Text2World/Video2World 사전학습 모델(7B/14B), (3) 비디오 토크나이저를 포함. NVIDIA Open Model License로 공개. DiffusionRenderer, VideoMatGen 등 PathFinder 핵심 기술들의 **기반 아키텍처**.

## 방법론

1. **Video curation pipeline**: 20M시간 → 100M 클립 (2-60초), VLM 캡션 (256프레임당)
2. **Cosmos Predict (Text2World)**: 텍스트 → 비디오 세계 생성
3. **Cosmos Transfer**: 조건부 제어 (DiffusionRenderer는 이 위에 구축)
4. **Cosmos Tokenizer**: 효율적 비디오 토큰화
5. **Post-training**: 도메인 특화 파인튜닝 지원

## 정량 결과

- 구체적 벤치마크 수치보다는 **플랫폼 규모와 생태계**가 핵심
- 100M 클립 학습으로 다양한 시나리오 커버
- DiffusionRenderer/VideoMatGen 등 하류 태스크에서 간접 성능 검증

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ NVIDIA Cosmos (공식) |
| 모델 | ✅ Cosmos Predict/Transfer 7B, 14B (HuggingFace) |
| 라이선스 | NVIDIA Open Model License |
| 요구사양 | A100 80GB 이상 (7B 기준) |

## PathFinder R&D 적용 가능성

- **Phase 1 기반 인프라**: DiffusionRenderer의 backbone (Cosmos-Transfer1-DiffusionRenderer). PathFinder의 G-buffer 역렌더링은 이 모델 위에 구축.
- **VideoMatGen 기반**: Cosmos Predict 1-7B 위에 PBR material 생성 파인튜닝.
- **World model**: 물리적으로 일관된 세계 시뮬레이션은 PathFinder의 forward rendering 품질 향상에 기여.
- **NVIDIA 생태계**: 동일 팀의 DiffusionRenderer/VideoMatGen/Generative Detail Enhancement와 통합 가능.

## 한계점

1. **리소스 요구**: 7B 모델 최소 A100 80GB
2. **NVIDIA 종속**: NVIDIA Open Model License 제약
3. **Physical AI 중심**: VFX 특화가 아닌 범용 world model

## 관련 노트

- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN — Cosmos 기반 역/순방향 렌더링
- 260330_VideoMatGen_PBR_Materials_Video_Diffusion_VMTG — Cosmos 기반 PBR 생성
- PathFinder_Master
