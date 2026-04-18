---
title: W15 Research — Agents Weekly Digest (Part 1)
status: published
slug: 260412-w15-research-agents-weekly-digest-part1
summary: '- Agent Q-Mix: 멀티에이전트 LLM 시스템에서 에이전트 간 통신 토폴로지(누가 누구와 대화하는가)는 태스크 성능에 결정적
  영향을 미치지만, 기존 연구는 사전 정의된 고정 토폴로지(체인, 스타, 풀 메쉬 등)에 의존한다. Agent  원문'
created: 2026-04-12
tags:
- 3D
- A2A
- AI
- AI_Daily_Trend
- AI_R&D_Paper
- Agents
- Blender
- Communication
- DCC
- Google
- HPC
- Houdini
- LLM
- MCP
- Microsoft
- Multi_Agent
- OWASP
- Orchestration
- Project-3D
- QMIX
- RAG
- Reinforcement_Learning
- SBA
- Synthesis
- Topology
- TrinityX
- Weekly_Digest
- agentic-web
- benchmark
- block
- budgeting
- claude-code
- code-generation
- codex
- competitive-programming
- container
- desktop-agent
- domain/agents
- domain/video-editing
- dotnet
- enterprise
- evaluation
- gemini-cli
- goose
- governance
- heartbeat
- hierarchy
- hypervisor
- ide-agent
- interoperability
- kubernetes
- long-context
- long-horizon
- mcp
- memory
- microsoft
- multi-agent
- open-source
- opensource
- orchestration
- paper-review
- planning
- production
- protocol
- python
- reinforcement-learning
- roadmap
- runtime-security
- rust
- scientific-computing
- self-refinement
- survey
- tech/llm-orchestration
- tech/long-form-video
- tech/multi-agent
- tech/music-sync
- tool-use
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 15
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Agents Weekly Digest (Part 1)

> 2026-04-05 ~ 2026-04-12 수집된 15건 통합.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-agents-weekly-digest-part1/fig-1.png)
*Source: [arXiv 2604.01707 (Fig. 1)](https://arxiv.org/abs/2604.01707)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-agents-weekly-digest-part1/fig-2.png)
*Source: [arXiv 2604.01212 (Fig. 1)](https://arxiv.org/abs/2604.01212)*

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [Agent Q-Mix: RL 기반 멀티에이전트 [[260330_Automated_Generation_of_M](https://arxiv.org/abs/2604.00344) | 04-05 |
| 2 | [CutClaw: Agentic Hours-Long Video Editing via Music Synchron](https://arxiv.org/abs/2603.29664) | 04-06 |
| 3 | [Microsoft Agent Governance Toolkit v3.0 — OWASP Agentic Top ](https://github.com/microsoft/agent-governance-toolkit) | 04-07 |
| 4 | [Google Scion — "에이전트의 하이퍼바이저"를 표방하는 deep-agent 멀티 오케스트레이션 테스](https://github.com/GoogleCloudPlatform/scion) | 04-08 |
| 5 | [Memory in the LLM Era — 모든 에이전트 메모리 방법을 통합 프레임워크로 분해하고, SOTA](https://arxiv.org/abs/2604.01707) | 04-08 |
| 6 | [Block Goose v1.29.1 — 70+ MCP 익스텐션·15+ 프로바이더·39k★, Rust 기반 데](https://github.com/block/goose) | 04-08 |
| 7 | [YC-Bench — 1년 시뮬레이션 스타트업 운영으로 측정하는 LLM 에이전트 장기 계획·일관성 벤치마크](https://arxiv.org/abs/2604.01212) | 04-08 |
| 8 | [FermiLink — 50개 과학 패키지·9개 도메인을 가로지르는 단일 에이전트 프레임워크와 132개 그림 ](https://arxiv.org/abs/2604.03460) | 04-08 |
| 9 | [3Dify — LLM 에이전트 + MCP + RAG로 Blender/Unreal/Unity를 자연어로 조종하](https://arxiv.org/abs/2510.04536) | 04-08 |
| 10 | [Agentization of Digital Assets — A2A 프로토콜로 35개 레포지토리·522개 인스](https://arxiv.org/abs/2604.04226) | 04-08 |
| 11 | [Microsoft Agent Framework 1.0 GA — AutoGen+Semantic Kernel을 ](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/) | 04-08 |
| 12 | [RefineRL — 회의적 에이전트로 4B LLM이 235B 모델을 따라잡은 자기수정 강화학습 프레임워크](https://arxiv.org/abs/2604.00790) | 04-08 |
| 13 | [Cline — 60k★ 오픈소스 IDE 코딩 에이전트, 휴먼 인 더 루프 + MCP 커스텀 툴 (Apache](https://github.com/cline/cline) | 04-08 |
| 14 | [Paperclip — "제로-휴먼 컴퍼니"를 위한 계층형 AI 에이전트 조직 운영 OS (CEO→CTO/CM](https://github.com/paperclipai/paperclip) | 04-08 |
| 15 | [MCP 2026 Roadmap — Streamable HTTP 수평확장, Tasks 수명주기, 거버넌스 사다](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) | 04-08 |

## 요약

### 2026-04-05 (1건)

- **Agent Q-Mix**: 멀티에이전트 LLM 시스템에서 에이전트 간 통신 토폴로지(누가 누구와 대화하는가)는 태스크 성능에 결정적 영향을 미치지만, 기존 연구는 사전 정의된 고정 토폴로지(체인, 스타, 풀 메쉬 등)에 의존한다. Agent  [원문](https://arxiv.org/abs/2604.00344)

### 2026-04-06 (1건)

- **CutClaw**: **저자:** Shifang Zhao, Yihan Hu, Ying Shan, Yunchao Wei, Xiaodong Cun [원문](https://arxiv.org/abs/2603.29664)

### 2026-04-07 (1건)

- **Microsoft Agent Governance Toolkit v3.0**: 마이크로소프트가 2026-04-02에 공개한 **Agent Governance Toolkit**은 자율 AI 에이전트의 _액션_을 결정론적으로 통제하는 런타임 거버넌스 인프라다. 흔히 말하는 "프롬프트 가드레일"이나 [원문](https://github.com/microsoft/agent-governance-toolkit)

### 2026-04-08 (12건)

- **Google Scion**: **저자**: Google Cloud Platform (GoogleCloudPlatform/scion) [원문](https://github.com/GoogleCloudPlatform/scion)
- **Memory in the LLM Era**: **Memory in the LLM Era: Modular Architectures and Strategies in a Unified Framework**(arXiv 2604.01707, 2026-04-02 공개)는 [원문](https://arxiv.org/abs/2604.01707)
- **Block Goose v1.29.1**: **Block Goose v1.29.1**(릴리즈 2026-04-03)은 결제·핀테크 회사 Block(전 Square)이 _native open source AI agent — desktop app, CLI, and [원문](https://github.com/block/goose)
- **YC-Bench**: Collinear AI가 2026-04-02 공개한 **YC-Bench**(arXiv 2604.01212)는 LLM 에이전트의 _장기 일관성_(long-horizon coherence)을 단일 지표로 압축해 측정하는 [원문](https://arxiv.org/abs/2604.01212)
- **FermiLink**: **FermiLink**(arXiv 2604.03460, 2026-04-04 공개)는 _다도메인 자율 과학 시뮬레이션_(multidomain autonomous scientific simulations)을 단일 에이 [원문](https://arxiv.org/abs/2604.03460)
- **3Dify**: **저자**: Shun-ichiro Hayashi, Daichi Mukunoki, Tetsuya Hoshino, Satoshi Ohshima, Takahiro Katagiri (Nagoya University / A [원문](https://arxiv.org/abs/2510.04536)
- **Agentization of Digital Assets**: **Agentization of Digital Assets for the Agentic Web**(arXiv 2604.04226, 2026-04 공개)는 _이미 존재하는 디지털 자산_(GitHub 레포지토리, 데이터 [원문](https://arxiv.org/abs/2604.04226)
- **Microsoft Agent Framework 1.0 GA**: **저자**: Microsoft Agent Framework Team (DevBlogs / Foundry / GitHub microsoft/agent-framework) [원문](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/)
- **RefineRL**: **RefineRL — Advancing Competitive Programming with Self-Refinement Reinforcement Learning**(arXiv 2604.00790, 2026-04-0 [원문](https://arxiv.org/abs/2604.00790)
- **Cline**: Cline은 VS Code 확장으로 동작하는 오픈소스 자율 코딩 에이전트로, 2026년 4월 현재 GitHub star 60,000개 / fork 6,100개 / 5,052 commits를 기록하며 Claude Co [원문](https://github.com/cline/cline)
- **Paperclip**: **저자**: paperclipai (커뮤니티), MIT License [원문](https://github.com/paperclipai/paperclip)
- **MCP 2026 Roadmap**: **발표일**: 2026-03-09 (MCP 공식 블로그) [원문](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)

## 원본 노트

<details><summary>통합된 15건 (아카이브됨)</summary>

- 260405_AgentQMix_RL_MultiAgent_Topology_Selection_QMIX_AQMX
- 260406_CutClaw_Agentic_HoursLong_Video_Editing_Music_CCLW
- 260407_MS_Agent_Governance_Toolkit_OWASP_Agentic_Top10_v3_AGTK
- 260408_Google_Scion_Multi_Agent_Hypervisor_Testbed_GSCN
- 260408_Memory_LLM_Era_Modular_Unified_Framework_MLEM
- 260408_Block_Goose_v1.29.1_MCP_Native_Open_Source_Agent_GOSE
- 260408_YCBench_LongHorizon_Agent_Startup_Simulation_YCBN
- 260408_FermiLink_Multidomain_Scientific_Agent_Framework_FRML
- 260408_3Dify_MCP_RAG_Procedural_3DCG_LLM_Framework_DIFY
- 260408_Agentization_Digital_Assets_Agentic_Web_A2A_Bench_ADAW
- 260408_MS_Agent_Framework_v1_GA_MCP_A2A_Orchestration_MAGF
- 260408_RefineRL_Skeptical_Agent_Competitive_Programming_RFRL
- 260408_Cline_OpenSource_IDE_Agent_60k_MCP_CLIN
- 260408_Paperclip_Hierarchical_Agent_Org_Orchestration_PCLP
- 260408_MCP_2026_Roadmap_Transport_Tasks_Governance_Enterprise_M26R

</details>
