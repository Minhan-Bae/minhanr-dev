---
author: MinHanr
categories:
- Trends
date: '2026-03-28'
draft: false
slug: 260328-wan22-moe-videogeneration-opensource
summary: Wan2.2의 MoE 아키텍처 도입과 Apache 2.0 오픈소스 공개는 our video generation project 멀티모델 라우팅의 핵심 오픈소스 백엔드 후보.
  27B 파라미터 중 14B만 활성화하는 효율성은 RTX 4090급 컨슈머 하드웨어에서의 배포를 현실화.
tags:
- AI_Trend
title: Wan2.2 — MoE 기반 오픈소스 비디오 생성 모델의 SOTA 달성
---

# Wan2.2 — MoE 기반 오픈소스 비디오 생성 모델의 SOTA 달성

> Alibaba Tongyi Lab이 공개한 Wan2.2는 Mixture-of-Experts(MoE) 아키텍처를 비디오 디퓨전 모델에 최초 적용하여, VBench 84.7%+ 달성과 함께 2026년 오픈소스 비디오 생성 분야의 새로운 기준을 수립했다.

## 개요

2026년 3월 기준, AI 비디오 생성 분야는 상용 모델(Kling 3.0, Veo 3.1, Seedance 2.0)과 오픈소스 모델 간의 성능 격차가 급속히 좁혀지고 있다. 이 변화의 중심에 Alibaba Tongyi Lab의 Wan2.2가 있다. Wan2.2는 비디오 디퓨전 모델에 Mixture-of-Experts(MoE) 아키텍처를 도입한 최초의 모델로, 15억 개 비디오와 100억 개 이미지로 학습되어 기존 오픈소스 모델을 압도하고 상용 솔루션과 경쟁하는 수준에 도달했다.

특히 Apache 2.0 라이선스로 완전 공개되어, 구독료나 API 제한 없이 상업적 활용이 가능하다는 점이 시장 구도를 근본적으로 변화시키고 있다.

## 핵심 내용

### MoE 아키텍처 — 효율적 파라미터 활용

Wan2.2의 A14B 모델 시리즈는 총 27B(270억) 파라미터를 보유하지만, 단일 생성 시 14B(140억)만 활성화되는 2-전문가(two-expert) 설계를 채택했다. 이 설계의 핵심은 디노이징 프로세스의 단계별 전문화에 있다:

- **High-noise Expert**: 생성 초기 단계에서 활성화. 전체 레이아웃, 구도, 거시적 움직임 패턴을 결정
- **Low-noise Expert**: 생성 후반 단계에서 활성화. 텍스처, 디테일, 미세 움직임을 정제

이 분업 구조 덕분에 총 파라미터의 52%만 사용하면서도 전체 파라미터를 동시 사용하는 dense 모델과 동등한 품질을 달성한다. 실질적 효과로 RTX 4090(24GB VRAM)급 컨슈머 GPU에서 추론이 가능하며, 이는 오픈소스 비디오 생성의 접근성을 획기적으로 높인다.

### 벤치마크 성능

- **VBench 종합 점수**: 84.7%+ (2026년 3월 기준 오픈소스 모델 중 최고)
- **출력 해상도**: 480P ~ 720P (T2V-A14B, I2V-A14B 모두 지원)
- **프레임 레이트**: 24fps
- **복합 역학**: 다중 객체 상호작용, 공간 관계, 복잡한 동적 장면에서 특히 강세

비교 맥락: Kling 3.0(상용)이 네이티브 4K/60fps, Veo 3.1(상용)이 1080p/24fps를 지원하는 반면, Wan2.2는 720p/24fps로 해상도에서는 뒤처지나 복합 장면 생성 품질에서 상용 모델에 근접한다.

### 학습 데이터 규모

- **비디오**: 15억 개 (1.5B)
- **이미지**: 100억 개 (10B)
- 이 규모는 오픈소스 모델로서 전례 없는 수준이며, 다양한 도메인과 스타일에 걸친 일반화 능력의 기반

### 2026년 3월 비디오 생성 시장 컨텍스트

Wan2.2의 등장은 더 넓은 시장 변화와 맞물린다. 2026년 2월 기준 6대 주요 모델(Kling 3.0, Sora 2, Veo 3.1, Seedance 1.5 Pro, Runway Gen-4 Turbo, Wan2.2) 중 4개가 네이티브 오디오 동시 생성을 지원하며, OpenAI Sora의 독립 서비스 종료는 단일 모델 접근의 한계를 확인시켰다.

## 출처

- [Wan2.2 공식 사이트](https://wan22.io/)
- [Wan2.2 Deep Dive](https://wan2.video/wan2.2)
- [The State of AI Video Generation in February 2026 — Cliprise (Medium)](https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c)
- [Best Video Generation AI Models in 2026 — Pinggy](https://pinggy.io/blog/best_video_generation_ai_models/)
- [VBench Leaderboard — Hugging Face](https://huggingface.co/spaces/Vchitect/VBench_Leaderboard)
- [Ultimate Guide: Fastest Open Source Video Generation Models 2026 — SiliconFlow](https://www.siliconflow.com/articles/en/fastest-open-source-video-generation-models)