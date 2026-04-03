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
---

# Agent Protocol Ecosystem: 수렴 분석

> 52건 growing 노트 클러스터 통합. TrinityX 아키텍처 + OIKBAS 에이전틱 시스템 직결.

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

## TrinityX 아키텍처 매핑

| TrinityX 계층 | 현재 | 프로토콜 업그레이드 |
|---------------|------|---------------------|
| RT-1/2/3 간 조율 | 독립 실행 | A2A Agent Cards로 동적 라우팅 |
| 도구 연결 (HF, Houdini) | MCP v1 | MCP v2 SDK + OAuth 2.1 |
| 사용자 인터페이스 | Telegram bot | AG-UI + MCP Apps |
| 에러 복구 | LLM 기반 | SERF 결정론적 택소노미 |
| 자기 개선 | 없음 | EvoSkill 패턴 + `.learnings/` |

## 액션 아이템

1. **MCP v2 마이그레이션 준비**: SDK V2 릴리즈 시 Houdini MCP + HuggingFace MCP 업그레이드. OAuth 2.1 인증 적용으로 프로덕션 보안 확보.
2. **A2A Agent Cards 설계**: RT-1(수집), RT-2(수렴), RT-3(확산) 각각의 능력을 Agent Card로 선언. 점진적으로 독립 실행 → A2A 기반 동적 조율로 전환.
3. **SERF 에러 택소노미 즉시 적용**: Houdini MCP 에러 복구([[260402_Project3D_Houdini_MCP_Convergence]])와 볼트 자동화 태스크에 SERF 패턴 도입. LLM 기반 에러 해석을 결정론적 복구로 대체.

## 소스

- A2A v1.0 spec | AAIF founding (Linux Foundation)
- MCP Dev Summit: NYC 2026-03-31 | arXiv:2603.13417 (CABP/ATBA/SERF)
- arXiv:2602.12430 (Agent Skills) | arXiv:2603.02766 (EvoSkill)
