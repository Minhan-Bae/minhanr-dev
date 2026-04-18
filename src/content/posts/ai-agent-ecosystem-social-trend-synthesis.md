---
title: "AI 에이전트 생태계 — MCP, A2A, 그리고 소셜 트렌드"
slug: ai-agent-ecosystem-social-trend-synthesis
date: 2026-04-01
description: "OIKBAS TrinityX 파이프라인이 수집·수렴한 기술 동향 종합 리포트"
tags: [AI_Daily_Trend, domain/agent, tech/MCP, tech/LLM, tech/knowledge-management, social-trend]
source_type: trend-analysis
source_url: https://x.com/search?q=AI+agent+agentic+workflow
status: mature
created: 2026-04-01
relevance: 5
related: [OIKBAS, TrinityX, TimeBrick]
collection_method: Claude_in_Chrome + WebSearch
platforms: [X, Threads, Web, StockTitan]
summary: "AI 에이전트 생태계 소셜 트렌드 종합 — 2026-04-01 메타 트렌드: 엔지니어링 패러다임의 세 번째 전환 2026년 4월 현재, AI 에이전트 분야의 가장 큰 구조적 변화는 엔지니어링 패러다임의 전환이다: | 시기 | 패러다임 | 핵심 질문 | |---|---|---| |…"
categories:
  - Systems
---

# AI 에이전트 생태계 소셜 트렌드 종합 — 2026-04-01

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/ai-agent-ecosystem-social-trend-synthesis/fig-1.png)
*Source: [arXiv 2602.12430 (Fig. 1)](https://arxiv.org/abs/2602.12430)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/ai-agent-ecosystem-social-trend-synthesis/fig-2.png)
*Source: [arXiv 2603.02766 (Fig. 1)](https://arxiv.org/abs/2603.02766)*

## 메타 트렌드: 엔지니어링 패러다임의 세 번째 전환

2026년 4월 현재, AI 에이전트 분야의 가장 큰 구조적 변화는 **엔지니어링 패러다임의 전환**이다:

| 시기 | 패러다임 | 핵심 질문 |
|---|---|---|
| 2023-2024 | Prompt Engineering | AI와 어떻게 소통하는가? |
| 2025 | Context Engineering | AI에 어떤 정보를 제공하는가? |
| **2026** | **Harness Engineering** | **AI가 안정적으로 작동하는 환경을 어떻게 구축하는가?** |

> 출처: Shin0221(@0xShin0221, Mar 30, X, 803 views), OpenAI 공식 블로그, Martin Fowler, Philipp Schmid

**핵심 인사이트**: Harness Engineering은 에이전트 주변의 제약(constraints), 피드백 루프(feedback loops), 검증 시스템(verification), 복구 메커니즘(recovery)을 설계하는 분야다. LangChain은 harness만 변경해서 Terminal Bench 2.0에서 Top 30 → Top 5를 달성했다(41K views, 419 likes).

---

## 트렌드 1: Agent Harness = CLAUDE.md + Skills + Rules + Commands

### 수집 데이터

- **LangChain(@LangChain, Feb 22, X)**: Trace Analyzer Skill — FETCH→ANALYZE(병렬 서브에이전트)→REVIEW(Human-in-the-Loop) 구조. 코드 변경 없이 harness만 바꿔서 벤치마크 급상승. 41K views.
- **OpenAI 공식 블로그**: Codex 팀이 100만 줄 이상의 프로덕션 코드를 인간이 한 줄도 안 쓰고 완성. 엔지니어의 역할은 "코드 작성"이 아니라 "harness 설계".
- **Know It First(@knowitfirst_ai, 18h, X)**: 파운더를 위한 Context Engineering = "One document → Business DNA → Load once → Every agent knows your business" → 이것을 "Soul"이라 명명.

### OIKBAS 매핑

```
OIKBAS의 기존 구조가 이미 Harness Engineering 구현체:

CLAUDE.md          → Agent의 "Soul" (볼트 전체 컨텍스트)
.claude/rules/     → 제약 조건 (경로별 프론트매터 규칙)
.claude/commands/  → 워크플로우 정의 (digest, dispatch, vault-health...)
.claude/skills/    → 재사용 가능한 능력 (vault-analyzer, tech-blog...)
vault_index.json   → 토큰 효율적 컨텍스트 제공
```

→ **OIKBAS는 이미 Harness Engineering을 실천하고 있으나, 이 용어와 프레임워크로 체계화하면 외부 커뮤니케이션에서 강력한 포지셔닝이 가능.**

---

## 트렌드 2: Self-Improving Skills — 에이전트의 자가 진화

### 수집 데이터

- **dev_roach_log(Threads, 6일 전)**: AI Agent가 SKILL/CLAUDE.md를 스스로 개선하는 논문. LLM은 학습 후 새 정보 주입이 어려우므로 외부 저장소(SKILL.md)를 활용하되, 이를 Agent가 자동으로 업데이트.
- **Claude Skills 2.0(Web)**: Skills 1.0 = 템플릿, Skills 2.0 = 피드백 루프. Agent가 변형 생성 → 사용자가 최적 선택 → good_examples.md에 저장 → 규칙 자동 업데이트.
- **Self-Improving Agent(mcpmarket.com)**: `.learnings/` 디렉토리에 실패, 교정, 미지 능력을 실시간 기록. 세션이 쌓일수록 정밀도 향상.
- **Hermes Agent(Nous Research, 2026.2, GitHub ★8.7K)**: ReAct 루프 기반 자율 에이전트. **핵심 아키텍처**: MEMORY.md(환경 사실/교훈) + USER.md(사용자 선호) → 세션 시작 시 시스템 프롬프트에 주입. SQLite 기반 전체 세션 FTS(Full-Text Search). 경험에서 절차적 스킬 자동 생성 → agentskills.io 오픈 표준 포맷으로 저장 → 사용 중 개선 → 세션 간 재사용. Telegram/Discord/Slack/WhatsApp/Signal/Email 멀티채널 게이트웨이. 142 contributors, 2,293 commits.
- **anthropics/skills(GitHub)**: Anthropic 공식 스킬 레포. 2025.12 Agent Skills 스펙을 오픈 표준으로 공개, OpenAI도 동일 포맷 채택.

### 핵심 논문 (딥다이브)

1. **[arXiv:2602.12430] Agent Skills for LLMs: Architecture, Acquisition, Security, and the Path Forward (2026.2.17)**
   - SKILL.md 스펙의 공식 정의: 명령어, 워크플로우 가이드, 실행 스크립트, 참조 문서, 메타데이터의 번들
   - "Progressive Disclosure" 패러다임: 필요할 때만 스킬을 로드하여 컨텍스트 효율화
   - **Skills ≠ MCP**: 직교 레이어. Skill = 절차적 지능, MCP = 연결성. Skill이 MCP 서버 사용을 지시하고 실패 시 폴백 전략까지 정의
   - → **OIKBAS의 `.claude/skills/`와 MCP 커넥터 조합이 정확히 이 아키텍처를 구현 중**

2. **[arXiv:2603.02766] EvoSkill: Automated Skill Discovery for Multi-Agent Systems (2026.3.3)**
   - 실패 분석(failure-driven feedback)에서 자동으로 스킬 발견/개선
   - 파레토 프론티어로 에이전트 프로그램 유지 → 매 반복마다 실패 분석 → 새 스킬 제안 or 기존 스킬 수정
   - 구조화된 스킬 폴더(명령어 + 트리거 메타데이터 + 헬퍼 스크립트)로 구체화
   - **결과**: Claude Code + Opus 4.5에서 OfficeQA +7.3%, SealQA +12.1%. 한 벤치마크에서 발견된 스킬이 다른 벤치마크에 제로샷 전이(+5.3%)
   - → **OIKBAS에 직접 적용 가능**: `.claude/skills/`의 실패 로그에서 자동 스킬 생성 파이프라인

3. **[arXiv:2512.17102] SAGE: Reinforcement Learning for Self-Improving Agent with Skill Library (2025.12)**
   - RL 기반 스킬 라이브러리 자동 확장 프레임워크
   - 에이전트가 환경에서 지속적으로 적응하며 스킬을 축적

### OIKBAS 적용 제안

1. **`.claude/skills/`에 피드백 루프 추가**: 스킬 실행 결과를 `good_examples.md`와 `corrections.md`에 자동 기록
2. **`.learnings/` 디렉토리 도입**: 에이전트가 만나는 예외 케이스와 교정 사항을 누적
3. **vault_index.json을 FTS5 수준으로 확장**: 현재 프론트매터 캐시 → 본문 키워드 인덱스까지 확대 검토

---

## 트렌드 3: MCP 생태계 폭발 — 9,700만 설치, 5,800+ 서버

### 수집 데이터

- **GPTDAOCN(X, Mar 31)**: MCP 설치량 9,700만 돌파(16개월). Claude, GPT-5.4, Gemini 모두 지원. AI Agent의 "USB 포트"로 업계 공통 인식.
- **Cred Protocol(@cred_protocol, X, 16h)**: 21개 MCP 도구 출시 — 신원 확인, Sybil 탐지, Agent-to-Agent 신뢰 스코어링, 금융 프로파일링. Claude Code/Cursor에서 2분 내 연결.
- **Pyth Network(@PythNetwork, X, 18h)**: Pyth Pro for AI Agents — 3,000+ 기관급 가격 피드(암호화폐, 주식, 환율, 금속, 원자재). 400ms 갱신. MCP 프로토콜 기반.
- **Financial MCP 서버(Web)**: Top 5 — Pyth Network, Financial Modeling Prep, EODHD, Alpha Vantage, Financial Datasets. 모두 Claude/Cursor 네이티브 지원.

### Trinity-X Financial 적용 제안

1. **Pyth MCP 서버 즉시 도입 검토**: get_latest_price, get_historical_price, get_candlestick_data, TWAP 계산 — Trinity-X의 실시간 시세 조회에 직접 활용
2. **Cred Protocol MCP**: 온체인 평판/신뢰 검증이 필요하다면 Agent-to-Agent 신뢰 시스템 참고
3. **StockTitan 모니터링**: AI 관련 기업 PR/뉴스 자동 수집 파이프라인 구축 가능

---

## 트렌드 4: Multi-Agent Orchestration — Claude Code Agent Teams

### 수집 데이터

- **Claude Code Agent Teams(v2.1.32, 2026.2)**: 실험적 기능. 리드 세션이 작업 배분/조율, 팀원은 독립 컨텍스트 + Git Worktree에서 병렬 작업. 서브에이전트와 달리 팀원 간 직접 통신 가능.
- **Ruflo(GitHub)**: Claude Code 위의 멀티에이전트 오케스트레이션 프레임워크. 무제한 에이전트, 분산 스웜, RAG 통합.
- **Claude Code Agentrooms**: @mention으로 특화 에이전트에 라우팅, 협업 개발.
- **frndOS(X, latest)**: 10개 에이전트, 8개 스킬, 11단계 워크플로우 상태 머신. PRD→와이어프레임→구현→PR 제출까지 구조화된 개발 파이프라인.
- **meng shao(X, 8h)**: Claude Code + Codex 모두 오픈소스 — 아키텍처 비교하여 최강 Coding Agent 조합 가능성 논의.
- **Addy Osmani**: "The Code Agent Orchestra" — 멀티에이전트 코딩이 실제로 작동하는 조건 분석.

### OIKBAS 적용 제안

1. **Agent Teams 실험 활성화**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 설정. 볼트의 수집/수렴/확산을 병렬 에이전트로 분담
2. **TrinityX의 5계층(Omega→RT→Gamma→Beta→Alpha) 에이전트 구조와 Agent Teams 매핑**: 이미 설계된 계층 구조를 Claude Code Agent Teams로 구현 가능한지 PoC

---

## 트렌드 5: Obsidian + AI = Knowledge OS로 진화

### 수집 데이터

- **Obsidian 1.5M+ 유저(Web, 2026.2)**: 22% YoY 성장. 2,700+ 플러그인.
- **minimal-second-brain(GitHub, gokhanarkan)**: AI-네이티브 Obsidian 볼트 템플릿. 3폴더(Inbox/Projects/Knowledge) + MANIFEST.md + CLAUDE.md + AGENTS.md + GitHub Actions 자동 유지보수. vault-cleaner.py로 헬스체크.
- **claudesidian(GitHub)**: Claude Code를 Obsidian 내부에서 직접 실행하는 플러그인.
- **Obsidian + Gemini CLI(Japanese blog)**: Obsidian과 Gemini CLI를 결합한 지식관리 자동화.
- **How to Build AI Second Brain(다수 블로그)**: Capture→Process→Integrate→Synthesize 4단계 패턴이 표준화되는 추세.

### OIKBAS 벤치마킹

| 항목 | minimal-second-brain | OIKBAS |
|---|---|---|
| 폴더 구조 | 3폴더 (미니멀) | PARA 7폴더 (풀스택) |
| AI 인덱스 | MANIFEST.md (폴더별) | vault_index.json (전체 프론트매터 캐시) |
| 자동화 | GitHub Actions + vault-cleaner.py | GitHub Actions 7개 + Claude Code commands 11개 |
| 스킬 | 기본 2개 (archive, summarize) | 3개 + 확장 가능 (vault-analyzer, tech-blog, normalizer) |
| 헬스체크 | vault-cleaner.py (이슈 생성) | vault-health command + 주간 리포트 |

→ **OIKBAS가 구조적으로 우위이나, minimal-second-brain의 MANIFEST.md 접근(폴더별 AI 디스커버리)은 참고할 가치 있음.**

---

## 트렌드 6: n8n과 Agentic AI — 비즈니스 자동화의 메인스트림화

### 수집 데이터

- **시장 규모**: Agentic AI 시장 $1.5B(2025) → $41.8B(2030). 2026년까지 비즈니스 워크플로우의 40%가 자율 에이전트 관리.
- **n8n의 역할**: LLM = 지능, n8n = 운영 백본. 모든 n8n 워크플로우를 AI 에이전트의 callable tool로 노출 가능. Human-in-the-Loop 내장.
- **ROI**: 에이전틱 시스템 도입 기업 평균 171% ROI. n8n 기반 자동화 기업은 태스크 처리 시간 60% 감소.

### 적용 시사점

- TimeBrick의 AI 추천 엔진에 n8n 기반 워크플로우 파이프라인 검토 가능
- OIKBAS의 GitHub Actions를 n8n으로 대체/보완하면 더 유연한 워크플로우 구성 가능

---

## 트렌드 7: 금융 AI — 에이전틱 플랫폼과 기업 AI 투자 가속화

### 수집 데이터 (StockTitan Live Feed, 2026-03-30~04-01)

**핵심 패턴**: 금융 AI가 "분석 보조"에서 "자율 에이전틱 플랫폼"으로 전환 중. 50개 이상의 뉴스 헤드라인에서 반복적으로 나타나는 키워드: Agentic AI, AI-native platform, autonomous agent, AI-driven fraud prevention.

**주목할 기업/이벤트:**

1. **Aether Holdings × OORT — Financial AI JV (Mar 31)**: 분산 AI 기술과 금융 결합. AI 에이전트 기반 자산 관리 합작법인. Trinity-X와 직접 경쟁/참고 대상.
2. **FactSet × Finster AI — AI-native Banking Platform (Mar 31)**: 기존 금융 데이터 거인이 AI-네이티브 플랫폼 파트너십. 은행/자산운용사 대상 에이전틱 분석.
3. **CXApp — Agentic AI Platform (Mar 31)**: 기업용 에이전틱 AI 플랫폼 출시. 워크플레이스 자동화 + 인텔리전스.
4. **Marqeta — AI-Driven Fraud Prevention (Mar 31)**: 실시간 AI 사기 탐지. 금융 거래의 자율 모니터링.
5. **NVIDIA NVLink Fusion (Mar 31)**: AI 인프라 확장 — 더 큰 모델, 더 빠른 추론. 금융 AI 고성능 추론의 하드웨어 기반.
6. **JFrog × Cursor — AI Coding Agent (Apr 1)**: 개발 도구 생태계에서도 에이전틱 통합 가속.
7. **Avalon Quantum — Autonomous Agentic AI Video Platform (Mar 30)**: 에이전틱 AI가 금융 너머 미디어까지 확장.

**시장 신호 종합:**
- AI 기업 간 JV/파트너십 급증 → 단독 개발보다 생태계 연합이 대세
- "AI-native"가 "AI-assisted" 대비 프리미엄 포지셔닝 키워드로 부상
- 금융 분야에서 MCP 기반 데이터 접근 + 에이전틱 의사결정 조합이 표준 아키텍처로 수렴 중

### 소셜 심리 데이터 (StockTwits, 2026년 3월 말 기준)

| 종목 | 심리 | 핵심 드라이버 |
|---|---|---|
| **NVDA** (NVIDIA) | 강세(Bullish) | Blackwell 출하 데이터, $180.76(+3.17%). 소셜 미디어 언급량 1위 유지. NVLink Fusion 발표로 AI 인프라 확장 |
| **PLTR** (Palantir) | 중립→약세 전환 | Q4 매출 $1.41B 예상 상회, EPS $0.25. Dan Ives "2~3년 내 $1T 밸류에이션 가능". 그러나 단기 심리 하락 |
| **SOUN** (SoundHound AI) | 강세(Moderate Buy) | AI 인프라 피벗. 4 Buy / 2 Hold 컨센서스. 평균 목표가 $17.60(현재 대비 +60%) |
| **HUBS** (HubSpot) | 극강세(Extremely Bullish) | AI 성장 전망 발표 후 중립→극강세 전환. 메시지 볼륨 극대 |

**시장 전반 심리**: Dan Ives "2026년 AI 증명의 해(Prove It Year), 테크 주식 최대 25% 상승 가능". 전반적으로 AI 주식에 대한 리테일 심리는 강세 우위이나, Palantir처럼 밸류에이션 부담으로 차익 실현 움직임도 존재.

### Trinity-X Financial 적용 제안

1. **Aether Holdings × OORT JV 모니터링**: 분산 AI + 금융의 합작 모델이 Trinity-X와 구조적으로 유사. 아키텍처 및 시장 접근 전략 벤치마킹 대상.
2. **FactSet/Finster 모델 참고**: 기존 데이터 파이프라인(Pyth MCP) 위에 AI-네이티브 분석 레이어를 올리는 구조가 Trinity-X에 직접 적용 가능.
3. **사기 탐지 패턴 참고**: Marqeta의 실시간 AI 기반 이상 거래 탐지 패턴은 Trinity-X의 리스크 관리 모듈에 반영 가능.
4. **StockTitan + StockTwits 정기 수집 소스 추가**: AI 관련 기업 뉴스(StockTitan) + 리테일 심리(StockTwits) 이원 수집 파이프라인. StockTwits의 FinBERT 기반 심리 분석 논문(PMC10280432) 참고하여 자동 심리 점수화 가능.
5. **심리-가격 괴리 시그널**: PLTR처럼 펀더멘털 강세인데 심리가 약세 전환되는 구간이 Alpha 기회 → Trinity-X 시그널 엔진에 반영.

---

## 트렌드 8: 한국 시장 — "에이전틱 AI 원년"의 실무 적용

### 수집 데이터 (한국어 웹 검색, 2026-04-01)

**핵심 프레임**: 글로벌 리더(OpenAI, Anthropic, Google)는 "더 똑똑한 AI"를 만들고, 한국 기업은 "그 AI를 어디에 쓸 것인가"에 집중. 이 차이가 OIKBAS/Trinity-X/Time-brick의 포지셔닝 기회.

**시장 수치:**
- 기업용 AI 에이전트 SW 시장: $1.5B(2025) → $41.8B(2030), CAGR 175% (Omdia)
- AI 활용 기업 임원 52%가 이미 에이전트 운영 중 (고객서비스 49%, 마케팅/보안 46%)
- 소셜 마케팅 89.7%가 AI 일상 활용

**한국 기업 동향:**
- SK텔레콤: 2026년 전 사업 영역 AI 적용 선언. AI 인프라 확장
- SK하이닉스: AI Co. 별도 설립
- 현대차: 자율주행 양산화 전략
- 한컴: AI를 "도구"에서 "업무 주체"로 전환하는 에이전틱 AI 적용

**소셜 수집 채널 확장 (Instagram 탐색 결과):**
Instagram은 AI 기술 토론보다 AI 생성 콘텐츠/가상 인플루언서 중심. 기술 심층 토론은 X > Threads > Instagram 순. 다만 Claude Code 기반 인스타그램 자동화(Stormy AI의 Social Media Orchestrator) 같은 실무 적용 사례는 주목할 만함.

### 프로젝트 시사점

- **OIKBAS**: 한국어 에이전틱 AI 콘텐츠 생산이 블루오션. "Harness Engineering" 관점의 한국어 기술 블로그는 아직 거의 없음 → 선점 기회
- **Trinity-X**: 한국 기업의 AI 적용 전략이 "어디에 쓸 것인가" 중심이므로, 금융 도메인 특화 에이전트의 수요가 명확
- **Time-brick**: 소셜 마케팅 89.7% AI 활용 → Time-brick의 AI 추천이 소셜 콘텐츠 일정까지 커버하면 차별화

---

## [Mature] 즉시 실행 가능한 액션 플랜

### OIKBAS — 이번 주 내

| 우선순위 | 액션 | 근거 | 논문/출처 |
|---|---|---|---|
| **P0** | Harness Engineering 프레임워크로 볼트 구조 재문서화 + 한국어 블로그 포스트 | 이미 구현체이나 체계화 필요. 한국어 콘텐츠 블루오션 | Harness Eng. 3대 출처 |
| **P0** | `.learnings/` 디렉토리 + EvoSkill 패턴 도입 | 실패 분석→스킬 자동 생성 파이프라인. Claude Code+Opus에서 +7.3% 입증 | arXiv:2603.02766 |
| **P0** | 기존 3개 스킬을 SKILL.md 스펙으로 리팩토링 | Skills = 절차적 지능, MCP = 연결성의 직교 레이어 구조 채택 | arXiv:2602.12430 |
| **P1** | Hermes Agent 아키텍처 벤치마킹: MEMORY.md + USER.md + SQLite FTS | vault_index.json → 본문 FTS 확장 방향 결정. ★8.7K, 142 contributors | Hermes Agent GitHub |
| **P1** | Claude Code 2.1.89 업데이트 후 스케줄 태스크 안정성 테스트 | 자동화 세션 일시정지/재개 기능 검증 | - |
| **P2** | Agent Teams 실험 활성화 PoC | 수집/수렴/확산 병렬화 가능성 확인 | Claude Code v2.1.32 |

### Trinity-X Financial — 이번 주 내

| 우선순위 | 액션 | 근거 |
|---|---|---|
| **P0** | Pyth MCP 서버 연동 PoC | 3,000+ 가격 피드 즉시 사용 가능, MCP 네이티브 |
| **P0** | Aether×OORT, FactSet×Finster JV 아키텍처 분석 | 직접적인 경쟁/참고 모델. 분산AI+금융 구조 벤치마킹 |
| **P1** | StockTitan 뉴스 피드 자동 수집 파이프라인 | AI 기업 뉴스/PR 자동 모니터링. 이미 50건 수집 완료 |
| **P1** | AI-native 분석 레이어 설계 | FactSet/Finster 모델 참고. Pyth MCP 위에 에이전틱 의사결정 레이어 |
| **P2** | Cred Protocol Agent-to-Agent 신뢰 시스템 조사 | 온체인 평판 데이터 활용 가능성 |
| **P2** | 실시간 이상 거래 탐지 모듈 설계 참고 (Marqeta) | 리스크 관리 모듈용 |

### Time-brick — 다음 스프린트

| 우선순위 | 액션 | 근거 |
|---|---|---|
| **P1** | n8n 기반 추천 엔진 워크플로우 파이프라인 설계 | Human-in-the-Loop + callable tool 패턴 |
| **P1** | AI 추천이 소셜 콘텐츠 일정까지 커버하는 기능 설계 | 소셜 마케터 89.7% AI 일상 활용. 시간 관리 + 콘텐츠 일정 통합 차별화 |
| **P2** | AI Research Agent(browser-ai-research-agent.vercel.app) 참고 | 동일 스택(Next.js + Vercel AI SDK) |
| **P2** | Stormy AI의 Social Media Orchestrator 패턴 참고 | Claude Code 기반 자동 콘텐츠 파이프라인 → Time-brick 내 추천 엔진 설계에 활용 |

---

## 주목할 리소스 (딥다이브 대상)

### 논문/문서
- Harness Engineering — OpenAI 공식 블로그: https://openai.com/index/harness-engineering/
- Harness Engineering — Martin Fowler: https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- Agent Harness 2026 — Philipp Schmid: https://www.philschmid.de/agent-harness-2026
- **[핵심] Agent Skills for LLMs (arXiv:2602.12430)**: https://arxiv.org/abs/2602.12430 — SKILL.md 스펙 공식 정의, Skills ≠ MCP 직교 레이어
- **[핵심] EvoSkill: Automated Skill Discovery (arXiv:2603.02766)**: https://arxiv.org/abs/2603.02766 — 실패 분석 기반 자동 스킬 발견. GitHub: https://github.com/sentient-agi/EvoSkill
- SAGE: RL for Self-Improving Agent (arXiv:2512.17102): https://arxiv.org/abs/2512.17102
- Hyperagents (arXiv:2603.19461): https://arxiv.org/abs/2603.19461
- SoK: Agentic Skills — Beyond Tool Use (arXiv:2602.20867): https://arxiv.org/html/2602.20867v1
- SkillsBench: Benchmarking Agent Skills (arXiv:2602.12670): https://arxiv.org/abs/2602.12670
- Agentic AI MOOC — UC Berkeley CS294-196: https://youtube.com/watch?v=r1qZpYAmqmg

### 레포지토리
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- anthropics/skills (공식): https://github.com/anthropics/skills
- minimal-second-brain: https://github.com/gokhanarkan/minimal-second-brain
- Ruflo (멀티에이전트): https://github.com/ruvnet/ruflo
- Self-Improving Agent: https://mcpmarket.com/tools/skills/self-improving-agent
- Claude Code Agent Teams: https://code.claude.com/docs/en/agent-teams

### 금융 MCP
- Pyth Pro for AI Agents: https://mcp-hub-website.vercel.app/
- Financial Datasets MCP: https://github.com/financial-datasets/mcp-server
- Alpha Vantage MCP: https://mcp.alphavantage.co/

### 소셜 팔로우 추천
- **X**: @LangChain, @jerryjliu, @0xShin0221, @EMPIRE_ENGINE, @PythNetwork, @cred_protocol, @GitHub_Daily
- **Threads**: unclejobs.ai, dev_roach_log, ict_whitepeach, ahrom.insights

---

> 수집 규모: X 4개 검색어 × 스크롤 5회 + Threads 2개 검색어 + 웹 검색 20건+ + StockTitan 50건 + StockTwits 심리 데이터 + 한국어 검색 8건
> 분석 시간: ~50분 (2 세션)
> 수집 도구: Claude in Chrome + WebSearch (Cowork)
> 트렌드 수: 8개 메가 트렌드 + 논문 6편 + 레포 6개 + 금융 뉴스 50건 + 소셜 심리 4종목
> 상태: **mature** — 논문/아키텍처 검증 완료, 액션 플랜 구체화 완료
