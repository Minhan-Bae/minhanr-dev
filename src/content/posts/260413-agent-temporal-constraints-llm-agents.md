---
title: Agent-C — Enforcing Temporal Constraints for LLM Agents via SMT-Based Constrained
  Generation
status: published
tags:
- AI_R&D_Paper
- domain/agents
- agent
- governance
- runtime-enforcement
- temporal-safety
- constrained-generation
source_url: FETCH_FAILED
arxiv_id: '2512.23738'
created: 2026-04-13
updated: 2026-04-13
related_projects:
- TrinityX
slug: 260413-agent-temporal-constraints-llm-agents
summary: '> Kamath, Zhang, Xu, Ugare, Singh, Misailovic (2025-12) — 시간적 안전 정책의 런타임
  강제를 위한 SMT 기반 프레임워크'
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-agent-temporal-constraints-llm-agents&category=Research
  alt: Agent-C — Enforcing Temporal Constraints for LLM Agents via SMT-Based Constraine
date: '2026-04-13'
---


# Agent-C — Enforcing Temporal Constraints for LLM Agents

> Kamath, Zhang, Xu, Ugare, Singh, Misailovic (2025-12) — 시간적 안전 정책의 런타임 강제를 위한 SMT 기반 프레임워크

## 핵심 요약

LLM 에이전트가 안전 필수 환경에 배치되지만, 기존 guardrail은 **액션 순서에 관한 시간적 안전 정책**(temporal safety policies)의 위반을 방지하지 못한다. 예: 인증 전 민감 데이터 접근, 비인가 결제 수단으로 환불 처리. Agent-C는 시간적 속성을 DSL로 표현 → 1차 논리로 변환 → SMT 솔버로 토큰 생성 중 비순응 액션을 탐지하고 순응 대안을 constrained generation으로 생성하는 프레임워크이다.

## 주요 기여

1. **Temporal Safety DSL**: "authenticate before accessing data" 같은 시간적 속성을 표현하는 도메인 특화 언어.
2. **SMT-Based Runtime Enforcement**: DSL → 1차 논리 → SMT solving으로 토큰 생성 시점에 실시간 순응 검증.
3. **Constrained Generation**: 비순응 tool call 탐지 시 순응하는 대안 액션을 자동 생성.
4. **Perfect Safety (100% Conformance, 0% Harm)**: 소매 고객 서비스, 항공 티켓 예약 2개 실세계 시나리오에서 검증.
5. **Utility 향상**: Claude Sonnet 4.5 conformance 77.4%→100%, utility 71.8%→75.2%. GPT-5 conformance 83.7%→100%, utility 66.1%→70.6%. 안전과 유용성 모두 개선.

## 방법론

- 시간적 속성을 DSL로 정의 (예: `before(authenticate, access_sensitive_data)`)
- DSL을 1차 논리 제약식으로 변환
- LLM이 tool call 토큰 생성 시 SMT 솔버가 제약 만족 여부 검증
- 비순응 시 constrained decoding으로 순응 대안 생성
- open-source (Qwen) + closed-source (Claude, GPT-5) 모델 모두 평가

## R&D 시사점

### TrinityX RT 시간적 제약 강제

- **RT 슬롯 순서 제약**: 예를 들어 "vault_index.json 읽기 전에 git pull 실행" 같은 RT 작업 순서를 DSL로 명시하면 워크플로우 실행 안전성 보장 가능.
- **Faramesh AAB와 보완**: Faramesh가 per-action PERMIT/DENY를 결정하고, Agent-C가 액션 간 시간적 순서를 강제하는 이중 안전망.
- **100% conformance + utility 개선 동시 달성**: 안전과 성능의 트레이드오프 없이 양립 가능함을 실증 — TrinityX 무인 운용의 safety guarantee 논거.

### SRM과의 연관

- SRM은 trajectory-level risk 축적 (session 전체 drift 탐지), Agent-C는 step-level 시간적 순서 강제. 상호 보완적 2축.
- 3층 구조 가능: Faramesh AAB (per-action) → Agent-C (temporal order) → SRM (trajectory drift)


## 한계점

- 학술 벤치마크와 실제 프로덕션 환경 간 성능 차이 존재 가능
- 공개 코드/가중치 재현성 검증 필요


## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 공개 | X 미확인 |
| 소비자 GPU 실행 | 논문 확인 필요 |
| 프로덕션 적용 | 추가 검증 필요 |

## 출처

| 플랫폼 | 링크 |
|--------|------|
| arXiv | 2512.23738 |
| HuggingFace | [논문](https://hf.co/papers/2512.23738) |

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
