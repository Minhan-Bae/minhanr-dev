---
author: MinHanr
categories:
  - Visual
date: '2026-03-29'
summary: "단일 스트림 Transformer로 오디오와 비디오를 동시에 생성하는 15B 파라미터 오픈소스 파운데이션 모델 daVinci-MagiHuman을 분석한다. Apache-2.0 라이선스로 6개 언어 음성 생성과 1080p 비디오를 지원하며, 기존 상용 모델 대비 80% 승률을 기록했다."
draft: false
slug: 260329-davinci-magihuman-singlestream-audiovideo-generation-dvmh
tags:
- AI_R&D_Paper
- tech/T2V
- tech/attention
- tech/video-editing
title: 'daVinci-MagiHuman: Single-Stream Audio-Video Generative Foundation Model'
---

# daVinci-MagiHuman: Single-Stream Audio-Video Generative Foundation Model

**저자:** SII-GAIR, Sand.ai (Ethan Chern, Hansi Teng 외 37명)
**발표:** 2026-03-23 (arXiv: 2603.21986)
**코드:** https://github.com/GAIR-NLP/daVinci-MagiHuman
**모델:** https://huggingface.co/GAIR/daVinci-MagiHuman
**데모:** https://huggingface.co/spaces/SII-GAIR/daVinci-MagiHuman

## 핵심 요약

오디오-비디오를 동시에 생성하는 오픈소스 foundation model. **단일 스트림 Transformer**로 텍스트·비디오·오디오를 하나의 토큰 시퀀스에서 self-attention만으로 처리한다. 복잡한 multi-stream이나 cross-attention 없이 표준 학습/추론 인프라로 최적화 가능.

## 아키텍처

- **Single-stream Transformer**: 15B 파라미터, 40 레이어
- 텍스트(T5Gemma), 비디오(Wan2.2 VAE), 오디오(Stable Audio) 토큰을 하나의 시퀀스로 결합
- Self-attention only → cross-attention 제거로 구조 단순화
- **추론 최적화**: model distillation + latent-space super-resolution + Turbo VAE decoder

## 주요 성능

| 메트릭 | 수치 |
|--------|------|
| Human eval vs Ovi 1.1 | **80.0% 승률** (2000 비교) |
| Human eval vs LTX 2.3 | **60.9% 승률** (2000 비교) |
| Word Error Rate (음성 명료도) | **14.60%** (오픈모델 최저) |
| Visual Quality | 오픈모델 중 최고 |
| Text Alignment | 오픈모델 중 최고 |

## 추론 속도

| 해상도 | 길이 | 시간 (H100) |
|--------|------|-------------|
| 256p | 5초 | **2초** |
| 1080p | 5초 | **38초** |

## 다국어 지원

중국어(보통화, 광둥어), 영어, 일본어, 한국어, 독일어, 프랑스어 — 6개 언어 음성 생성.

## 오픈소스 구성

완전 오픈소스 스택: base model, distilled model, super-resolution model, inference codebase 모두 공개.

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ github.com/GAIR-NLP/daVinci-MagiHuman (Apache-2.0) |
| 모델 | ✅ HF에 공개 (GAIR/daVinci-MagiHuman) |
| 데이터 | ❌ 학습 데이터 비공개 |
| 라이선스 | Apache-2.0 (상용 가능) |
| 요구사양 | H100 권장 (1080p). 256p는 가벼운 GPU 가능 |

## Practical Implications

**our video generation project 프로젝트에 직접적 임팩트.** 단일 스트림으로 오디오+비디오 동시 생성이 가능한 오픈소스 모델이 등장했다. 특히 human-centric 시나리오에서 표정 연기, 발화-표정 조화, 신체 모션, 오디오-비디오 싱크를 모두 처리한다는 점이 핵심이다. Apache-2.0이라 상용 파이프라인에 바로 통합 가능하며, Wan2.2 VAE 기반이므로 기존 ComfyUI 워크플로우와의 연동도 기대된다.

**our character replacement project와의 시너지**: human animation + 다국어 음성 생성 기능은 캐릭터 교체 후 리립싱크/더빙에 바로 활용 가능. 기존 ByteDance Seedance2.0이나 Alibaba FunCineForge 대비 완전 오픈소스라는 점이 큰 차별점.

HuggingFace 트렌딩 스코어 222, 115 upvotes — 커뮤니티 관심도 높음.

## Sources

- [arXiv Paper](https://arxiv.org/abs/2603.21986)
- [HuggingFace Model](https://huggingface.co/GAIR/daVinci-MagiHuman)
- [HuggingFace Demo](https://huggingface.co/spaces/SII-GAIR/daVinci-MagiHuman)
- [GitHub](https://github.com/GAIR-NLP/daVinci-MagiHuman)