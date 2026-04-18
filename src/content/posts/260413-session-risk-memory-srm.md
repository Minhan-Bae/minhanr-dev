---
title: Session Risk Memory (SRM) — Trajectory-Level Authorization for Deterministic
  Pre-Execution Safety Gates
status: published
tags:
- AI_R&D_Paper
- domain/agents
- agent
- governance
- runtime-enforcement
- pre-action-authorization
source_url: FETCH_FAILED
arxiv_id: '2603.22350'
created: 2026-04-13
updated: 2026-04-13
related_projects:
- TrinityX
- Project-V
slug: 260413-session-risk-memory-srm
summary: '> Chitan (2026-03) — 정적 per-action 게이트를 session-level 궤적 감시로 확장하는 경량 모듈'
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-session-risk-memory-srm&category=Research
  alt: Session Risk Memory (SRM) — Trajectory-Level Authorization for Deterministic
    Pre
date: '2026-04-13'
---


# Session Risk Memory (SRM) — Trajectory-Level Authorization

> Chitan (2026-03) — 정적 per-action 게이트를 session-level 궤적 감시로 확장하는 경량 모듈

## 핵심 요약

기존의 deterministic pre-execution safety gate는 개별 에이전트 액션이 할당된 역할에 부합하는지를 평가하지만, 여러 개의 "개별적으로는 적법한" 단계로 분산된 공격(slow-burn exfiltration, gradual privilege escalation, compliance drift)에 구조적으로 취약하다. SRM은 stateless execution gate 위에 trajectory-level authorization 계층을 추가하는 경량 deterministic 모듈이다.

## 주요 기여

1. **Semantic Centroid 유지**: 세션 내 에이전트 행동의 evolving behavioral profile을 compact semantic centroid로 실시간 추적.
2. **Exponential Moving Average 리스크 축적**: baseline-subtracted gate 출력에 EMA를 적용해 risk signal을 누적. 추가 모델·학습·확률 추론 없이 기존 gate의 semantic vector 표현을 그대로 사용.
3. **Spatial vs Temporal Authorization 구분**: per-action authorization(spatial consistency)과 trajectory-level authorization(temporal consistency)을 개념적으로 분리 — session-level 안전성의 원칙적 기반 제공.
4. **성능**: 80개 다중 턴 세션 벤치마크에서 ILION+SRM F1=1.0000, FPR 0% 달성 (stateless ILION F1=0.9756, FPR 5% 대비). Detection rate 100% 유지, per-turn overhead < 250μs.

## 방법론

- 기존 stateless deterministic gate (예: ILION) 위에 SRM 레이어를 plug-in 방식으로 부착
- 각 턴마다 gate 출력의 semantic vector를 centroid에 EMA 업데이트
- 누적 risk signal이 threshold 초과 시 세션 차단/알림
- slow-burn exfiltration, gradual privilege escalation, compliance drift 3가지 공격 시나리오 평가

## R&D 시사점

### TrinityX Audit Plane 직접 적용

- **heartbeat.jsonl 궤적 감시 확장**: 현재 RT heartbeat는 per-slot 단위(spatial). SRM의 trajectory-level 접근을 이식하면, 여러 사이클에 걸친 drift (예: 수집 도메인 서서히 이탈, suppression 우회)를 자동 탐지 가능.
- **Faramesh AAB + SRM 2층 구조**: Faramesh가 per-action authorization boundary를 제공하고, SRM이 session-level trajectory 감시를 담당하는 2층 거버넌스 아키텍처. TrinityX의 "관찰만 있고 강제가 없는" 거버넌스 공백을 메운다.
- **EMA 기반 경량 리스크 축적**: 추가 모델 없이 기존 heartbeat 데이터의 semantic vector만으로 drift 탐지 — RT 인프라에 부담 최소.
- **per-turn overhead < 250μs**: 실시간 RT 사이클(4시간 간격)에서 무시 가능한 오버헤드.

### 관련 참조

- Faramesh AAB (2601.17744): per-action deterministic authorization
- Trace-Based Assurance Framework (2603.18096): MAT 기반 trace 계약 + 거버넌스 mediator
- TrinityX Audit Plane 아이디어 스케치: `040_Resources/043_Ideas/260411_Auto_Sketch_1.md`

## 출처

| 플랫폼 | 링크 |
|--------|------|
| arXiv | 2603.22350 |
| HuggingFace | [논문](https://hf.co/papers/2603.22350) |

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
