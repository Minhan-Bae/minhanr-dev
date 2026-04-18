---
title: 'MI9 — 에이전틱 AI를 위한 통합 런타임 거버넌스 프레임워크: 6대 컴포넌트 실시간 개입'
status: published
tags:
- AI_R&D_Paper
- domain/agents
- tech/agent
- agent-governance
- runtime-governance
- FSM
- drift-detection
- containment
created: 2026-04-12
updated: 2026-04-12
source_url: https://arxiv.org/abs/2508.03858
arxiv_id: '2508.03858'
authors:
- Charles L. Wang
- Trisha Singhal
- Ameya Kelkar
- Jason Tuo
published: 2025-08
related_projects:
- TrinityX
slug: 260412-mi9-runtime-governance-framework-agentic-ai
summary: '> Wang, Singhal, Kelkar, Tuo (2025-08) · arXiv 2508.03858'
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2508.03858/gradient.png
  alt: 'MI9 — 에이전틱 AI를 위한 통합 런타임 거버넌스 프레임워크: 6대 컴포넌트 실시간 개입'
date: '2026-04-12'
---


# MI9: Agent Intelligence Protocol — Runtime Governance for Agentic AI Systems

> Wang, Singhal, Kelkar, Tuo (2025-08) · arXiv 2508.03858

## 핵심 요약

에이전틱 AI 시스템은 추론·계획·실행 능력을 갖추면서 기존 AI 모델과 근본적으로 다른 거버넌스 과제를 제기한다. **런타임에 발현하는 예상치 못한 창발적 행동**(emergent behavior)은 사전 배포 거버넌스만으로 대응할 수 없다. MI9는 이를 위해 설계된 **최초의 완전 통합 런타임 거버넌스 프레임워크**로, 6개 핵심 컴포넌트를 통해 이질적 에이전트 아키텍처에 투명하게 작동하며 **99.81% 탐지율**을 달성한다.

## 6대 핵심 컴포넌트

### 1. Agency-Risk Index (ARI)
에이전트의 현재 자율성 수준과 이에 수반되는 위험을 실시간 정량화하는 지표. 에이전트의 행동 범위, 의사결정 복잡도, 외부 시스템 접근 수준을 종합적으로 평가하여 단일 스칼라 값으로 표현.

### 2. Agent-Semantic Telemetry Capture (ASTC)
에이전트 행동의 의미적 맥락을 포함한 텔레메트리 수집 시스템. 단순 로그가 아닌, 에이전트의 의도·계획·추론 과정을 의미론적으로 구조화하여 캡처 → 후속 분석과 거버넌스 판단의 기반.

### 3. Continuous Authorization Monitoring (CAM)
에이전트의 권한과 인가 상태를 지속적으로 모니터링. 초기 인가 후에도 컨텍스트 변화, 위험 수준 변동, 정책 업데이트에 따라 **동적으로 권한을 조정/철회**하는 연속 인가 모델.

### 4. FSM-Based Conformance Engines (FCE)
**유한 상태 기계(FSM)** 기반의 적합성 검증 엔진. 에이전트의 행동 시퀀스가 사전 정의된 허용 상태 전이 경로를 따르는지 결정론적으로 검증. 비허용 상태 전이 탐지 시 즉시 개입.

### 5. Goal-Conditioned Drift Detection (GCDD)
에이전트가 원래 목표에서 얼마나 이탈(drift)했는지를 실시간 감지. 목표 조건(goal condition)을 기준으로 현재 행동 궤적의 편차를 측정하여, 의도하지 않은 목표 표류를 조기 경보.

### 6. Graduated Containment Strategies (GCS)
위험 수준에 따른 **단계적 격리 전략**:
- Level 1: 경고 + 로깅 강화
- Level 2: 행동 범위 제한 (도구 접근 축소)
- Level 3: 실행 속도 제한 (쓰로틀링)
- Level 4: 완전 격리 + 인간 에스컬레이션

## 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│              Agentic AI System                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Agent │  │Agent │  │Agent │  │Agent │  ...   │
│  │  A   │  │  B   │  │  C   │  │  D   │       │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘       │
└─────┼─────────┼─────────┼─────────┼────────────┘
      └─────────┴─────────┴─────────┘
                    │
      ┌─────────────▼──────────────────┐
      │         MI9 Runtime Layer      │
      │  ┌─────┐ ┌─────┐ ┌─────────┐  │
      │  │ ARI │ │ASTC │ │   CAM   │  │
      │  └──┬──┘ └──┬──┘ └────┬────┘  │
      │     └────────┼─────────┘       │
      │              ▼                 │
      │  ┌─────────────────────────┐   │
      │  │    FCE (FSM Engine)     │   │
      │  └────────────┬────────────┘   │
      │               ▼               │
      │  ┌─────────────────────────┐   │
      │  │   GCDD (Drift Detect)   │   │
      │  └────────────┬────────────┘   │
      │               ▼               │
      │  ┌─────────────────────────┐   │
      │  │  GCS (Containment)      │   │
      │  │  L1→L2→L3→L4           │   │
      │  └─────────────────────────┘   │
      └────────────────────────────────┘
```

## 평가 결과

| 지표 | 값 |
|------|-----|
| 탐지율 | 99.81% |
| 평가 방식 | 합성 에이전트 시나리오 |
| 출력 형식 | evaluation.json + evaluation_summary.json |
| 코드 | MI9-Eval (GitHub 공개) |

## R&D 시사점 — TrinityX Audit Plane 적용

### 직접 적용 가능성 ★★★★★

MI9의 6대 컴포넌트는 TrinityX RT 슬롯 거버넌스에 **1:1 매핑** 가능:

1. **ARI → RT Slot Risk Score**: 각 RT 슬롯의 자율성 수준과 위험을 정량화. 현재 heartbeat.jsonl의 collected 카운트를 넘어, 에이전트 행동 범위·외부 접근 수준까지 포함하는 위험 지표로 확장.
2. **ASTC → heartbeat.jsonl 확장 스키마**: 단순 타임스탬프+카운트를 넘어 에이전트의 의도·추론·판단을 의미론적으로 캡처. Faramesh AAB 아이디어 스케치의 `action_hash / permit_decision / provenance_chain` 3필드와 직접 연결.
3. **CAM → 연속 인가**: RT 슬롯 실행 중에도 feedback_signals.json의 domain_suppressions / project_weights 변경을 실시간 반영하여 동적 권한 조정.
4. **FCE → RT 슬롯 FSM**: 수집→정제→저장→커밋의 상태 전이를 FSM으로 정의, 비정상 전이(예: 정제 없이 저장) 탐지.
5. **GCDD → 수집 품질 드리프트**: 수집 노트의 relevance_score 추이를 모니터링, 목표(min_relevance_threshold)로부터의 이탈 감지.
6. **GCS → 단계적 개입**: L1(경고 로깅) → L2(max_items_per_run 축소) → L3(특정 도메인 수집 일시정지) → L4(RT 슬롯 완전 정지 + Telegram 알림).

### 기존 볼트 노트 연결

- ACP: MI9의 CAM 컴포넌트와 ACP의 temporal admission control이 상호 보완
- AEGIS: AEGIS의 실행 전 방화벽이 MI9 파이프라인의 첫 관문 역할
- PROV-AGENT: MI9의 ASTC 텔레메트리가 PROV-AGENT 프로비넌스 그래프의 입력
- Trace Assurance: MI9의 FCE가 생성하는 상태 전이 로그가 Trace Assurance 계약 검증의 대상

## 한계점 및 제약

- **평가 기준 편향**: 벤치마크가 특정 도메인/태스크에 편향되어 일반화 어려움
- **적대적 평가 부재**: 의도적 공격 시나리오에 대한 체계적 평가가 대부분 미포함
- **실세계 갭**: 제어된 환경의 벤치마크 결과가 프로덕션 환경과 괴리될 수 있음
- **비용-안전 트레이드오프**: 안전성 강화가 성능/레이턴시 저하로 이어지는 경우의 정량적 분석 부족

## 실용성 체크

| 항목 | 평가 | 비고 |
|------|------|------|
| 즉시 적용 가능성 | 중 | 거버넌스 프레임워크로 부분 채택 가능 |
| TrinityX 연관성 | 높음 | RT 슬롯 안전성 검증에 직접 활용 |
| 학습 곡선 | 중 | 보안/형식검증 배경 지식 필요 |
| 유지보수 부담 | 중 | 평가 기준 업데이트 주기 관리 |
