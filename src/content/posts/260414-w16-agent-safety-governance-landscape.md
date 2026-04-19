---
title: W16 Agent Safety & Governance Landscape — Pre-Execution Gates · Continuous
  Delegation · Provenance Stack
status: published
slug: 260414-w16-agent-safety-governance-landscape
created: 2026-04-14
tags:
- Synthesis
- Weekly_Digest
- AI_R&D_Paper
- domain/agents
- AgentGovernance
- tech/agent-safety
- tech/runtime-governance
- TrinityX
summary: 2026-W15~W16의 에이전트 거버넌스 17건을 4개 축(Pre-Execution Gate · Continuous Delegation
  · Provenance/Audit · Standards & Toolkits)으로 합본. TrinityX/AIDC PathFinder 구축 시 참고할
  layered guardrail 레퍼런스.
date: '2026-04-14'
author: MinHanr
---


# W16 Agent Safety & Governance Landscape

> 2026-W15~W16에 정제된 에이전트 거버넌스 17건. 단일 턴 LLM 가드레일이 아니라 **execution-time enforcement**가 공통 주제. ISO/IEC 42001·NIST AI RMF·OWASP Agentic Top 10이 표준 앵커로 자리 잡음.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-agent-safety-governance-landscape/fig-1.png)
*Source: [arXiv 2603.12621 (Fig. 1)](https://arxiv.org/abs/2603.12621)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-agent-safety-governance-landscape/fig-2.png)
*Source: [Hugging Face · papers/2603.13247](https://huggingface.co/papers/2603.13247)*

## 한 줄 정리

| 축 | 정의 | 대표 작업 |
|---|---|---|
| **A. Pre-Execution Gate** | 도구 호출 직전 정책 평가·차단 | AEGIS · ILION · AgentGuardian · ClawKeeper · Lean-Agent |
| **B. Continuous Delegation** | 세션 단위 권한 위임·revocation | AITH · HDP · Keycard×Smallstep |
| **C. Provenance & Audit** | 변조 불가 행동 기록·재현성 | Right to History (PunkGo) · LAWP · AI Trust OS |
| **D. Standards & Toolkits** | 표준 매핑 + 오픈소스 런타임 | GNEC (ISO 42001) · Microsoft AGT (OWASP 10) · Bloom (Anthropic) · CSA Governance Gap · IaC Drift Healing |

## A. Pre-Execution Gate (5건)

**핵심 패턴**: 에이전트의 의도(LLM 출력)와 액션(tool call)을 분리하고, 액션 직전에 결정론적 검증 레이어를 끼워 넣는다.

| 작업 | 메커니즘 | 차별점 |
|---|---|---|
| **AEGIS** (arXiv 2603.12621) | deep-scan + 정책 검증 + 변조 불가 audit | tool-execution path 인라인 firewall |
| **ILION** (arXiv 2603.13247) | 결정론적 safety rule + non-bypassable | LLM 비결정성 ↔ 결정론 룰 분리 |
| **AgentGuardian** (arXiv 2601.10440) | 스테이징 trace 학습 → adaptive 정책 | 입력·속성·워크플로우·CFG 다축 결합 |
| **ClawKeeper** (HF 2603.24414) | Skills(주입)·Plugins(내부)·Watchers(외부) 3계층 | Watcher = agent-internal 결합 없는 미들웨어 |
| **Lean-Agent** (HF 2604.01483) | Lean 4 정리 증명으로 액션 허가 | 마이크로초 지연·SEC/FINRA 검증 |


## B. Continuous Delegation (3건)

**핵심 패턴**: "이 인간이 이 권한을 이 경로로 위임했다"를 암호학적으로 증명하고, 세션 경계에서 sub-μs로 검증한다.

- **AITH** — ML-DSA-87(FIPS 204 NIST L5)로 4.7M ops/sec, 6-check Boundary Engine, 1초 내 push revocation. **Post-quantum 안전성** 확보.
- **HDP** — Ed25519 append-only chain. 발급자 공개키 + 세션 ID만으로 **오프라인 검증** 가능. IETF 드래프트 + TS SDK + CrewAI/AutoGen 어댑터 공개.
- **Keycard × Smallstep** (산업계) — 에이전트 identity + infrastructure attestation 결합. 검증된 인프라 위에서만 액션 실행 강제.


## C. Provenance & Audit (3건)

- **Right to History (PunkGo)** — Floridi 정보권 → 에이전트 행동권 확장. Rust sovereignty kernel + 5개 system invariants. 개인 하드웨어 기반 tamper-evident 로그 권리.
- **LAWP** (SC '25 Workshops) — HPC 워크플로우 프로비넌스 자동 추적 레퍼런스 아키텍처. 재현성 + 감사 양립.
- **AI Trust OS** (arXiv 2604.04749) — periodic audit → always-on telemetry 운영 계층 전환. 자기증명 한계 대체.

**연결**: Right to History의 invariants를 LAWP가 HPC 워크플로우에서 인스턴스화하고, AI Trust OS가 이를 telemetry layer로 노출하는 3단 스택으로 읽으면 깔끔.

## D. Standards & Toolkits (6건)

| 자료 | 표준/가치 |
|---|---|
| **GNEC** (arXiv 2604.05229) | ISO 42001/23894/42005 + NIST AI RMF → 4계층 runtime guardrail 매핑 |
| **Microsoft AGT** (MIT, 2026-04-02) | OWASP Agentic Top 10 전 항목 커버 첫 오픈소스 툴킷, action governance |
| **Bloom** (Anthropic, MIT) | 자연어 지정 → 자동 평가 suite 생성 4단계. 1.3k stars |
| **CSA Governance Gap** (2026-04-03) | "모니터링은 되지만 차단은 안 되는" 공백 진단. Privileged Access = Agentic Control Plane |
| **IaC Drift Healing** (2026-04-02) | GenAI 생성 IaC 71% 증가 → 멘탈모델 붕괴. agentic drift healing 필요 |
| **OrgForge → governance corpora** | physics-cognition + causal consistency로 거버넌스 시뮬 데이터셋 합성 |

## 합성 인사이트

1. **Pre-execution gate는 이미 표준화 직전**. AEGIS/ILION/AgentGuardian/ClawKeeper/Lean-Agent 5건이 동일한 추상(intent ↔ action 분리)을 다른 검증 메커니즘으로 구현. 다음 6개월 내 OWASP Agentic Top 10 패턴화 예상.
2. **Continuous delegation = identity infra의 차세대**. AITH의 post-quantum 선제 채택이 Keycard×Smallstep의 산업 채택과 만나면 enterprise SaaS는 Ed25519 → ML-DSA로 마이그레이션 압박.
3. **Provenance는 권리 담론으로 격상**. Right to History가 Floridi 윤리 → Rust 커널까지 일관되게 내려가는 첫 사례. EU AI Act regulation과 정합.
4. **Bloom + AGT의 오픈소스 임계점 통과**. Anthropic·Microsoft가 양쪽에서 MIT로 푸시. 6개월 내 PR/감사 공급망에 디폴트 진입 가능성.

