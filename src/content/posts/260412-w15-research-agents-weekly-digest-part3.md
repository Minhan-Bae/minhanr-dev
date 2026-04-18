---
title: W15 Research — Agents Weekly Digest (Part 3)
status: published
slug: 260412-w15-research-agents-weekly-digest-part3
summary: '- Efficient and Interpretable Multi-Agent : MAS 라우팅을 "의미 조건부 경로 선택(semantic-conditioned
  path selection)"으로 재정의하고, 개미 군집 최적화의 pheromone 메커니즘을 LLM 라우터의 메모리·'
created: 2026-04-12
tags:
- AI_R&D_Paper
- Synthesis
- TrinityX
- Weekly_Digest
- benchmark
- code-generation
- domain/agents
- domain/governance
- domain/infrastructure
- domain/llm
- domain/optimization
- domain/security
- tech/A2A
- tech/MCP
- tech/agent
- tech/authorization
- tech/benchmark
- tech/cryptography
- tech/enterprise
- tech/formal-methods
- tech/formal-verification
- tech/governance
- tech/observability
- tech/orchestration
- tech/protocol
- tech/security
- tech/tracing
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 15
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Agents Weekly Digest (Part 3)

> 2026-04-05 ~ 2026-04-12 수집된 15건 통합.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-agents-weekly-digest-part3/fig-1.png)
*Source: [Hugging Face · papers/2603.03194](https://huggingface.co/papers/2603.03194)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-agents-weekly-digest-part3/fig-2.png)
*Source: [arXiv 2603.16938 (Fig. 1)](https://arxiv.org/abs/2603.16938)*

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [Efficient and Interpretable Multi-Agent LLM Routing via Ant ](https://hf.co/papers/2603.12933) | 04-11 |
| 2 | [Faramesh: A Protocol-Agnostic Execution Control Plane for Au](https://hf.co/papers/2601.17744) | 04-11 |
| 3 | [AgencyBench: Benchmarking the Frontiers of Autonomous Agents](https://hf.co/papers/2601.11044) | 04-11 |
| 4 | [Cryptographic Runtime Governance for Autonomous AI Systems: ](https://arxiv.org/abs/2603.16938) | 04-11 |
| 5 | [Before the Tool Call: Deterministic Pre-Action Authorization](https://arxiv.org/abs/2603.20953) | 04-11 |
| 6 | [Self-Healing Router: Graph-Based Self-Healing Tool Routing f](https://hf.co/papers/2603.01548) | 04-11 |
| 7 | [ToolACE-MCP: Generalizing History-Aware Routing from MCP Too](https://hf.co/papers/2601.08276) | 04-11 |
| 8 | [OpenClaw PRISM: A Zero-Fork, Defense-in-Depth Runtime Securi](https://arxiv.org/abs/2603.11853) | 04-11 |
| 9 | [The Orchestration of Multi-Agent Systems: Architectures, Pro](https://arxiv.org/abs/2601.13671) | 04-11 |
| 10 | [LDP: An Identity-Aware Protocol for Multi-Agent LLM Systems](https://arxiv.org/abs/2603.08852) | 04-11 |
| 11 | [Agent Control Protocol ACP v1.22: Admission Control for Agen](https://arxiv.org/abs/2603.18829) | 04-11 |
| 12 | [Bridging Protocol and Production — MCP 프로덕션 배포 3대 누락 프리미티브](FETCH_FAILED) | 04-12 |
| 13 | [BeyondSWE: Can Current Code Agent Survive Beyond Single-Repo](https://arxiv.org/abs/2603.03194) | 04-12 |
| 14 | [AgentTrace — Causal Graph Tracing for Root Cause Analysis in](FETCH_FAILED) | 04-12 |
| 15 | [Towards Verifiably Safe Tool Use for LLM Agents](https://hf.co/papers/2601.08012) | 04-12 |

## 요약

### 2026-04-11 (11건)

- **Efficient and Interpretable Multi-Agent **: **MAS 라우팅을 "의미 조건부 경로 선택(semantic-conditioned path selection)"으로 재정의**하고, 개미 군집 최적화의 pheromone 메커니즘을 LLM 라우터의 메모리·학습 구조로 [원문](https://hf.co/papers/2603.12933)
- **Faramesh**: 2026년 에이전트 스택은 **현실 부작용을 일으키는 행위**를 점점 더 자주 실행한다 — 인프라 배포, DB 수정, 송금, 워크플로우 실행. 그런데 대부분의 스택에는 "조직이 결정론적으로 permit / deny  [원문](https://hf.co/papers/2601.17744)
- **AgencyBench**: 기존 에이전트 벤치마크는 **단일 능력 중심** — 툴 사용, 코딩, 웹 검색 중 하나를 고립적으로 측정. 현실의 에이전트는 1M+ 토큰 장기 컨텍스트에서 수십~수백 개 툴을 연쇄적으로 조합해야 하는데, 이걸 재현하 [원문](https://hf.co/papers/2601.11044)
- **Cryptographic Runtime Governance for Aut**: 기존 LLM 에이전트 거버넌스는 두 가지 한계를 갖는다: [원문](https://arxiv.org/abs/2603.16938)
- **Before the Tool Call**: 2026년 현재 에이전트 스택의 일반적 보안 모델은 **두 축**으로만 구성된다: [원문](https://arxiv.org/abs/2603.20953)
- **Self-Healing Router**: **"대부분의 에이전트 control-flow 결정은 추론(reasoning)이 아니라 라우팅(routing)이다"** — LLM은 그래프가 길을 찾지 못할 때만 호출하고, 나머지는 결정론적 Dijkstra 최단경로 [원문](https://hf.co/papers/2603.01548)
- **ToolACE-MCP**: Model Context Protocol(MCP)과 Agent Web의 부상으로 에이전트 생태계가 수천~수만 개 툴이 노출된 개방형 협업 네트워크로 진화 중이다. 기존 아키텍처는 이 스케일에서 심각한 스케일링·일반화 [원문](https://hf.co/papers/2601.08276)
- **OpenClaw PRISM**: Tool-augmented LLM 에이전트의 공격 표면은 "사용자 입력 필터링" 한 층보다 훨씬 넓다. 저자는 현실적으로 다음 4대 벡터를 나열한다: [원문](https://arxiv.org/abs/2603.11853)
- **The Orchestration of Multi-Agent Systems**: Orchestrated Multi-Agent System(MAS)은 AI 진화의 다음 단계로, 자율 에이전트들이 구조화된 coordination과 communication을 통해 복잡하고 공유된 목표를 달성하는 시스 [원문](https://arxiv.org/abs/2601.13671)
- **LDP**: 멀티에이전트 AI 시스템이 복잡해질수록, 에이전트를 연결하는 프로토콜이 시스템 역량의 상한을 결정한다. 저자는 현행 대표 프로토콜인 **A2A(Agent-to-Agent)**와 **MCP(Model Context P [원문](https://arxiv.org/abs/2603.08852)
- **Agent Control Protocol ACP v1.22**: 에이전트 실행 흐름에서 **stateless policy engine**은 각 요청을 독립적으로 평가한다. 문제는 "개별적으로는 모두 유효한 요청들이 누적되면 해로운 행동 패턴을 형성하는" 위협 클래스 — 예컨대 한 [원문](https://arxiv.org/abs/2603.18829)

### 2026-04-12 (4건)

- **Bridging Protocol and Production**: --- [원문](FETCH_FAILED)
- **BeyondSWE**: **논문**: [arXiv 2603.03194](https://arxiv.org/abs/2603.03194) (2026-03-03) [원문](https://arxiv.org/abs/2603.03194)
- **AgentTrace**: AgentTrace는 배포된 multi-agent AI 시스템에서 실행 로그만으로 causal graph를 자동 재구성하고, 장애의 root cause를 **sub-second 레이턴시**로 진단하는 경량 프레임워크 [원문](FETCH_FAILED)
- **Towards Verifiably Safe Tool Use for LLM**: LLM 에이전트는 데이터 소스·API·검색엔진·코드 샌드박스·다른 에이전트까지 툴로 호출한다. 능력이 커질수록 **의도치 않은 tool interaction**의 위험도 커진다 — 민감 데이터 유출, 중요 레코드 덮 [원문](https://hf.co/papers/2601.08012)

## 원본 노트

<details><summary>통합된 15건 (아카이브됨)</summary>

- 260411_AMROS_AntColony_MultiAgent_LLM_Routing_Pheromone_AMRS
- 260411_Faramesh_Protocol_Agnostic_Agent_Execution_Control_FRMH
- 260411_AgencyBench_1M_Token_Autonomous_Agents_Benchmark_AGBN
- 260411_Aegis_Cryptographic_Runtime_Governance_IEPL_Genesis_Lock_AEGS
- 260411_OpenAgentPassport_Deterministic_PreAction_Auth_OAP
- 260411_SHRouter_GraphBased_SelfHealing_Tool_Routing_LLM_Agents_SHRT
- 260411_ToolACE_MCP_HistoryAware_Routing_Agent_Web_TACE
- 260411_OpenClaw_PRISM_Zero_Fork_Runtime_Security_Tool_Augmented_LLM_Agents_PRSM
- 260411_Orchestration_MultiAgent_Systems_Architectures_Protocols_Enterprise_OMAS
- 260411_LDP_IdentityAware_Protocol_MultiAgent_LLM_Systems_LDPP
- 260411_ACP_Agent_Control_Protocol_Admission_Control_TLA_LedgerQuerier_ACPT
- 260412_BridgingMCP_Production_IdentityPropagation_AdaptiveBudget_ErrorSemantics_BMCP
- 260412_BeyondSWE_CrossRepo_Code_Agent_Benchmark_SearchSWE_BSWE
- 260412_AgentTrace_CausalGraph_MultiAgent_RootCause_AGTC
- 260412_VSTU_Verifiably_Safe_Tool_Use_STPA_MCP_LLM_Agents_VSTU

</details>
## 한계점

- 전시 기간 한정으로 시의성 제한
- 주관적 해석 기반으로 관람자 경험과 상이 가능
- 온라인 정보 기반 요약으로 현장 경험 미반영

## 실용성 체크

| 항목 | 평가 |
|------|------|
| 재현 가능성 | 전시 방문 또는 도록 확인 시 검증 가능 |
| 실무 적용성 | 크리에이티브 영감 및 트렌드 파악용 |
| 후속 액션 | 관심 전시 방문 또는 아카이빙 |
