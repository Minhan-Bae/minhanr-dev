---
title: W16 Agent Orchestration Ecosystem — Capability Trees · Hierarchical MAS · Coding-Agent
  CLIs
status: published
slug: 260414-w16-agent-orchestration-ecosystem
created: 2026-04-14
tags:
- Synthesis
- Weekly_Digest
- AI_R&D_Paper
- AI_Daily_Trend
- domain/agents
- tech/orchestration
- tech/multi-agent
- TrinityX
- PathFinder
summary: 2026-W15~W16 에이전트 오케스트레이션 12건을 4축(Skill/Capability OS · Hierarchical MAS
  · Coding-Agent CLI · Vendor SDK)으로 합본. PathFinder/TrinityX 멀티에이전트 토폴로지 설계 시 직접 참조.
date: '2026-04-14'
author: MinHanr
---

# W16 Agent Orchestration Ecosystem

> Skill/Capability를 일급 객체로 보고, 그 위에 hierarchical MAS와 vendor-neutral CLI를 얹는 흐름이 W15~W16에 동시 다발로 출현. PathFinder의 plan→execute 분리, TrinityX의 RT 슬롯 토폴로지 설계의 직접 레퍼런스.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-agent-orchestration-ecosystem/fig-1.png)
*Source: [arXiv 2603.02176 (Fig. 1)](https://arxiv.org/abs/2603.02176)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-agent-orchestration-ecosystem/fig-2.png)
*Source: [Hugging Face · papers/2604.06392](https://huggingface.co/papers/2604.06392)*

## 4축 매핑

| 축 | 정의 | 대표 |
|---|---|---|
| **A. Skill / Capability OS** | 스킬을 트리·DAG로 조직화 | AgentSkillOS · QualixarOS |
| **B. Hierarchical MAS** | 조직 구조 패턴을 LLM 협업에 이식 | OrgAgent · OrgForge · MAMS |
| **C. Coding-Agent CLI** | 터미널/IDE 네이티브 코딩 에이전트 | OPENDEV · OMX · Ruflo · OpenSWE · OAC |
| **D. Vendor SDK / API Server** | 표준 API 위에 에이전트 빌드 | GitHub Copilot SDK · Llama Stack v0.7.1 |

## A. Skill / Capability OS (2건)

- **AgentSkillOS** (arXiv 2603.02176) — Capability Tree(계층적 노드 재귀) + DAG 파이프라인. 스킬을 **에코시스템 스케일**로 조직·확장·벤치마킹.
- **QualixarOS** (arXiv 2604.06392) — 첫 application-level Agent OS. 10 LLM 프로바이더 × 8 프레임워크 × 7 트랜스포트 통합. 12가지 멀티에이전트 토폴로지 실행 시맨틱 정의 + Forge LLM 팀 컴파일러.

**TrinityX 적용**: 현재 RT-1/2/3 슬롯이 임시 토폴로지로 묶여 있는데, QualixarOS의 12 토폴로지 중 RT 패턴 두세 개를 표준화해 슬롯 매니페스트로 노출하면 추가 슬롯 도입이 단순화됨.

## B. Hierarchical Multi-Agent Systems (3건)

- **OrgAgent** (arXiv 2604.01020) — 기업 거버넌스-실행-준수 3계층을 MAS에 이식. flat collaboration 한계 극복.
- **OrgForge** (arXiv 2603.14997) — physics-cognition boundary + causal consistency로 결정론적 ground-truth 합성. 거버넌스 학습 corpora 생성.
- **MAMS** (arXiv 2604.07681) — planner-executor 계층 + 공통 MCP 서버 + Parsl 워크플로우. 리더십급 HPC에서 고처리량 재료 스크리닝 검증.

**핵심**: 세 작업 모두 "**flat collaboration의 한계 → 계층 + 표준 인터페이스**"라는 공통 진단. MAMS는 MCP를 backbone으로 채택해 OrgAgent 류 패턴이 실제 인프라(HPC)에서 작동함을 입증.

## C. Coding-Agent CLI (5건)

| CLI | 기반 | 차별점 |
|---|---|---|
| **OPENDEV** (Rust, 2603.05344) | OSS · Bui et al. | 이중 에이전트 + 워크로드별 모델 라우팅, 4.3ms 기동 |
| **OMX** (oh-my-codex v0.12.6) | OpenAI Codex CLI | tmux 병렬 팀 + 스킬 + HUD + 네이티브 훅. 22.2k★ |
| **Ruflo v3.5** (구 Claude Flow) | Claude Code | 250k LOC TS+Rust WASM 커널, 31.5k★ MCP 통합 |
| **OpenSWE** | LangGraph + Deep Agents | Slack/CLI/Web, fork 대신 compose 철학 |
| **OAC (OpenAgentsControl)** | OpenCode 기반 | Plan-First Approval, 9개 서브에이전트, 토큰 80% 절감 |

**패턴 합본**: 모두 (1) Plan/Approval 분리, (2) 서브에이전트/스킬 표준 인터페이스, (3) MCP 통합을 채택. Coding-Agent CLI는 사실상 **MCP + tmux/WASM 런타임의 컨피그 차이** 수준으로 수렴 중.

## D. Vendor SDK / API Server (2건)

- **GitHub Copilot SDK** (Public Preview, 2026-04-02) — Copilot 클라우드 에이전트 동일 런타임을 외부 앱에 임베드. DevOps 컨벤션 학습 가능. Copilot API의 사실상 첫 외부 노출.
- **Llama Stack v0.7.1** (Meta, MIT, 8.3k★) — OpenAI API drop-in. 랩톱 → 데이터센터 동일 코드.

**시장 신호**: GitHub의 Copilot SDK 공개로 "에이전트 = 호스팅 SaaS"에서 "에이전트 = 임베드 가능한 라이브러리"로 전환. Llama Stack은 모델·인프라 양쪽 vendor-neutral 옵션. 두 경로 모두 OpenAI Chat Completions가 사실상 표준 wire format으로 굳어짐.

## 합성 인사이트

1. **MCP의 backbone 화**: MAMS·QualixarOS·OMX·Ruflo 모두 MCP 채택. W16 시점에서 멀티에이전트 transport는 사실상 MCP + (선택적) A2A로 단일화.
2. **Plan-First가 governance와 결합**: OAC·OpenSWE의 Plan-First 패턴은 W16 거버넌스(AEGIS/ILION) Pre-Execution Gate와 정확히 같은 위치(intent ↔ action 사이)에서 작동. → **합본 시 Plan = 인간 승인 단계 = pre-execution gate** 동일 추상.
3. **Hierarchical MAS의 검증 사례 등장**: OrgAgent의 이론을 MAMS가 HPC에서 실제 운용. 더 이상 "계층 MAS는 실험"이 아님.
4. **CLI 코딩 에이전트 시장은 컨피그 게임**: 핵심 차별은 (a) 어떤 모델 라우팅, (b) 어떤 거버넌스 레이어, (c) 어떤 워크플로우 UX. 런타임 자체는 MCP + WASM/tmux로 평탄화.

## 후속 액션

- [ ] **TrinityX 슬롯 → QualixarOS 토폴로지 매핑** (RT-1: planner-executor / RT-2: pipeline / RT-3: scheduler)
- [ ] **PathFinder plan 단계에 OAC Approval 패턴 도입** 검토 (사용자 Telegram 1-click 승인 = HDP signed delegation으로 결합)
- [ ] **OMX/OpenSWE 코드 분석**으로 minhanr-dev publisher 워크플로우 단순화 가능성 평가
- [ ] **Llama Stack 어댑터** 추가로 oikbas-worker가 OpenAI/Anthropic 외 fallback 확보
