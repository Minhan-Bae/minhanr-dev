---
author: MinHanr
categories:
  - Visual
date: '2026-03-28'
draft: false
slug: 260328-shotstream-streaming-multi-shot-video-generation-for-interac
summary: Causal multi-shot 스트리밍 아키텍처가 our video generation project ReactFlow 노드 기반 인터랙티브 영상 편집에 직접 참조.
  next-shot generation 패러다임이 멀티 클립 시퀀싱의 핵심 레퍼런스.
tags:
- AI_R&D_Paper
title: 'ShotStream: Streaming Multi-Shot Video Generation for Interactive Storytelling'
---

# ShotStream: Streaming Multi-Shot Video Generation for Interactive Storytelling

> **arXiv**: 2603.25746v1 | **Published**: 2026-03-26
> **Authors**: Yawen Luo, Xiaoyu Shi, Junhao Zhuang, Yutian Chen, Quande Liu, Xintao Wang, Pengfei Wan, Tianfan Xue

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260328-shotstream-streaming-multi-shot-video-generation-for-interac/fig-1.png)
*Source: [arXiv 2603.25746 (Fig. 1)](https://arxiv.org/abs/2603.25746)*

## 한줄 요약

양방향(bidirectional) 멀티샷 비디오 생성의 고지연·비인터랙티브 한계를 돌파하는 인과적(causal) 스트리밍 아키텍처. Distribution Matching Distillation과 듀얼 캐시 메모리를 결합하여 단일 GPU에서 16 FPS, sub-second latency로 일관된 멀티샷 비디오를 생성한다.

## 핵심 내용

### 문제 정의

장편 내러티브 스토리텔링을 위한 멀티샷 비디오 생성은 핵심 과제이다. 그러나 기존 최신 방법들은 **양방향(bidirectional) 아키텍처**에 기반하여 두 가지 근본적 한계를 가진다:
- **제한된 인터랙티비티**: 전체 시퀀스를 한 번에 생성해야 하므로, 생성 도중 사용자가 내러티브 방향을 변경할 수 없다.
- **높은 지연 시간**: 양방향 어텐션으로 인해 시퀀스 길이에 따라 연산량이 급증하여, 실시간 인터랙션이 사실상 불가능하다.

이는 ShotAdapter, MultiShotMaster 등 기존 멀티샷 방법들의 공통적 한계로, 사용자가 스토리를 "지시"하면서 동시에 영상이 "흘러나오는" 인터랙티브 스토리텔링 경험을 구현할 수 없다.

### 아키텍처 상세

ShotStream은 태스크를 **next-shot generation**으로 재정의한다. 이전 샷의 히스토리 컨텍스트를 조건으로 다음 샷을 인과적으로 생성하며, 사용자는 스트리밍 프롬프트를 통해 진행 중인 내러티브를 동적으로 지시할 수 있다.

#### 1단계: 양방향 → 인과적 증류

먼저 text-to-video 모델을 **양방향 next-shot generator**로 파인튜닝한다. 이를 teacher로 사용하여 **Distribution Matching Distillation (DMD)**을 통해 인과적(causal) student 모델로 증류한다. 이 과정에서 양방향 모델의 품질을 유지하면서 인과적 생성의 효율성을 확보한다.

#### 2단계: 듀얼 캐시 메모리 메커니즘

시각적 일관성을 유지하기 위한 이중 캐시 구조:
- **Global Context Cache**: 조건 프레임(이전 샷의 핵심 프레임)을 저장하여 **샷 간(inter-shot) 일관성** 보장. 캐릭터 외형, 배경 톤, 조명 조건 등 전역 문맥을 유지.
- **Local Context Cache**: 현재 생성 중인 콘텐츠를 저장하여 **샷 내(intra-shot) 일관성** 보장. 프레임 간 시각적 연속성과 동작 흐름의 자연스러움을 유지.

#### 3단계: 2단계 자기강화 증류 (Two-Stage Self-Forcing)

오류 누적(error accumulation)을 완화하기 위한 점진적 증류 전략:
1. **Intra-shot self-forcing**: ground-truth 히스토리 샷을 조건으로 샷 내부의 자기 생성 프레임에 대해 학습
2. **Inter-shot self-forcing**: 자기 생성된 히스토리를 사용하여 샷 간 연결까지 학습. 이를 통해 장기 시퀀스에서의 오류 전파를 억제.

### 정량 결과

| 지표 | ShotStream | 양방향 Teacher |
|------|-----------|--------------|
| 생성 속도 | **16 FPS** (단일 GPU) | 수 FPS 이하 |
| 지연 시간 | **sub-second** | 수 초~수십 초 |
| 시각 품질 | 동등 또는 우위 | baseline |
| 샷 간 일관성 | 듀얼 캐시로 보장 | 양방향 어텐션 |
| 인터랙티비티 | **실시간 프롬프트** | 불가 |

- **16 FPS on single GPU**: 단일 GPU에서 실시간급 생성 달성
- **Sub-second latency**: 사용자 입력에서 프레임 출력까지 1초 미만
- 양방향 모델과 **동등하거나 우수한 시각 품질**을 유지하면서 지연을 수십 배 감소
- 멀티샷 일관성(캐릭터, 배경, 스타일)이 듀얼 캐시 메커니즘으로 보장

## 출처

| 플랫폼 | 링크 |
|--------|------|
| arXiv | [2603.25746v1](https://arxiv.org/abs/2603.25746v1) |
| PDF | [다운로드](https://arxiv.org/pdf/2603.25746v1) |

---
## Related Notes
- our video generation project_Master