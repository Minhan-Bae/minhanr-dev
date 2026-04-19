---
title: "Agent Protocol Ecosystem: MCP → A2A → AAIF 수렴 분석"
tags: [Weekly, Insight, Agent, MCP, A2A, TrinityX, Protocol]
source_type: synthesis
status: mature
created: 2026-04-02
period: "2026-W13~W14"
related:
  - "[[260402_AAIF_A2A_v1_에이전트_프로토콜_생태계_통합]]"
  - "[[260401_MCP_Dev_Summit_2026_Protocol_Evolution]]"
  - "[[260401_AI_Agent_Ecosystem_Social_Trend_Synthesis]]"
  - "[[260328_Agent_Protocol_Stack_A2A_MCP_AGUI_에이전트_프로토콜_스택]]"
  - "[[260328_MCP_프로덕션_디자인패턴_CABP_ATBA_SERF]]"
summary: "Agent Protocol Ecosystem: 수렴 분석 52건 growing 노트 클러스터 통합. TrinityX 아키텍처 + OIKBAS 에이전틱 시스템 직결. 핵심 테제 2026 Q1, 에이전트 프로토콜 생태계가 프래그먼테이션 → 수렴 단계에 진입했다. AAIF(146개 기업,…"
categories:
  - Systems
---


# Agent Protocol Ecosystem: 수렴 분석

> 52건 growing 노트 클러스터 통합. TrinityX 아키텍처 + OIKBAS 에이전틱 시스템 직결.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260402_AgentProtocol_Ecosystem_Convergence/fig-1.png)
*Source: [Hugging Face · papers/2603.13417](https://huggingface.co/papers/2603.13417)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260402_AgentProtocol_Ecosystem_Convergence/fig-2.png)
*Source: [arXiv 2602.12430 (Fig. 1)](https://arxiv.org/abs/2602.12430)*

## 핵심 테제

2026 Q1, 에이전트 프로토콜 생태계가 **프래그먼테이션 → 수렴** 단계에 진입했다. AAIF(146개 기업, Linux Foundation), A2A v1.0 stable, MCP v2.0 SDK 로드맵이 동시에 발표되며, 합의된 3계층 스택(**WebMCP / MCP / A2A**)이 확립되었다. IBM의 ACP도 A2A에 병합. 이는 "AI의 TCP/IP 모먼트"로 평가된다.

## 프로토콜 스택

```
┌─────────────────────────────┐
│  AG-UI / A2UI               │  Agent → User (스트리밍 UI)
├─────────────────────────────┤
│  A2A v1.0 (gRPC)            │  Agent → Agent (에이전트 간 조율)
│  signed Agent Cards         │  능력 선언 + 동적 라우팅
├─────────────────────────────┤
│  MCP v2.0 (Tool Protocol)   │  Agent → Tool (도구 연결)
│  OAuth 2.1 + SDK V2         │  인증 + 성능 개선
├─────────────────────────────┤
│  WebMCP                     │  브라우저 기반 MCP 접근
└─────────────────────────────┘
```

## 주요 발견

### 1. AAIF + A2A v1.0 (2026-04-02)
- A2A v1.0: gRPC 기반, signed Agent Cards로 멀티테넌시 지원
- AAIF: 146개 회원사, Linux Foundation 산하 거버넌스
- ACP(IBM) → A2A 합류로 프로토콜 통합 완료

### 2. MCP Dev Summit (2026-04-01)
- 첫 MCP Dev Summit (NYC, 95+ 세션)
- **MCP Apps**: 에이전트 렌더링 UI — Obsidian 내 에이전트 UI 가능성
- **SDK V2**: 성능 개선, OAuth 2.1 인증 표준화
- OpenAI + Anthropic 교차 MCP Resources: 멀티 LLM 에이전트 운용 가능

### 3. 프로덕션 디자인 패턴 (CABP/ATBA/SERF)
| 패턴 | 문제 | 해법 |
|------|------|------|
| CABP | 툴 체인 간 권한 전파 | 아이덴티티 전파 프로토콜 |
| ATBA | 순차 툴 호출 비용/타임아웃 | 적응형 예산 배분 |
| SERF | 비결정론적 에러 해석 | 구조화된 에러 택소노미 |

### 4. Harness Engineering 패러다임
- 2025 "Context Engineering" → 2026 "Harness Engineering"
- 에이전트를 제약, 피드백 루프, 복구 메커니즘으로 설계
- **OIKBAS는 이미 Harness Engineering 구현체**: CLAUDE.md + rules + commands + skills + vault_index.json

## 소스

- A2A v1.0 spec | AAIF founding (Linux Foundation)
- MCP Dev Summit: NYC 2026-03-31 | arXiv:2603.13417 (CABP/ATBA/SERF)
- arXiv:2602.12430 (Agent Skills) | arXiv:2603.02766 (EvoSkill)
