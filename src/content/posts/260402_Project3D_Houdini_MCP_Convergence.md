---
title: "Project-3D: Houdini MCP + Agentic 3D 수렴 분석"
tags: [Weekly, Insight, Project-3D, Houdini, MCP, 3DGS, Agentic]
source_type: synthesis
status: mature
created: 2026-04-02
period: "2026-W13~W14"
related:
  - "[[260401_3DAgent_Weekly_Synthesis]]"
  - "[[260401_PathFinder_Weekly_Synthesis]]"
  - "[[260401_3Dify_Procedural_3DCG_LLM_MCP_RAG]]"
  - "[[260331_houdini_mcp_llm_procedural]]"
  - "[[260327_SAGE_NVIDIA_Scalable_Agentic_3D_Scene_Generation]]"
  - "[[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation]]"
  - "[[260401_EvoGS_4D_GS_Dynamical_System]]"
---

# Project-3D: Houdini MCP + Agentic 3D 수렴 분석

> 81건 growing 노트 클러스터 통합. SBA 과제 Houdini MCP 프로토타입 직결.

## 핵심 테제

**LLM + MCP + Visual Feedback Loop**이 에이전틱 3D 생성의 지배적 아키텍처 패턴으로 수렴하고 있다. 3개의 독립적 구현(3Dify, capoom/houdini-mcp, SAGE)이 동일한 설계 원칙에 도달했으며, 이를 Project-3D Houdini MCP 프로토타입에 즉시 적용 가능하다.

## 주요 발견

### 1. MCP 인프라 — 즉시 사용 가능

- **capoom/houdini-mcp** (MIT, 177★): TCP localhost:9876으로 Houdini 직접 제어. 노드 CRUD, 지오메트리 조작, 시뮬레이션, 렌더링 + `execute_houdini_code`로 임의 Python 실행. Claude Code 1줄 통합 가능.
- **3Dify** (Dify 기반): MCP로 Houdini/Blender 제어, CUA(GUI 자동화) 폴백, RAG로 DCC 매뉴얼 참조. 3단계 파이프라인: NL 입력 → 프리비즈 피드백 → DCC 자동실행.
- **차이점**: capoom은 low-level API 래퍼, 3Dify는 high-level 오케스트레이터. 둘 다 채택 가능.

### 2. Agentic 3D 설계 패턴

| 패턴 | 출처 | 핵심 |
|------|------|------|
| Generator-Critic 루프 | SAGE (NVIDIA) | 3개 전문 비평가(시맨틱/비주얼/물리), 99.9% 물리적 안정성 |
| VLM Visual Feedback | SceneAssistant | 13개 원자적 조작, 피드백 없으면 선호도 65%→27% 하락 |
| PCG Graph Serialization | Proc3D | LLM이 PCG 그래프 직접 생성, Houdini 노드 그래프와 동형 |
| Director-Generator-Verifier | WorldAgents | Foundation Image Model → 3D 변환 파이프라인 |

### 3. 3DGS의 에이전틱 인프라화

- **XGS**: 실시간 SLAM + LLM 인터페이스를 3DGS 위에 통합
- **PromptVFX**: LLM 생성 파라메트릭 함수로 Gaussian 직접 조작, 디퓨전 대비 30x 속도
- **Lyra** (NVIDIA, ICLR 2026): 비디오 디퓨전 → 3DGS 자기증류, 멀티뷰 학습 데이터 불필요. 32.75M 파라미터 디코더, 4D 동적 장면 지원, Apache-2.0
- **EvoGS**: 4D GS를 연속시간 ODE로 재구성, 1/3 프레임만 학습해도 시간 외삽 가능

## Project-3D 액션 아이템

1. **Houdini MCP 레이어 선택**: capoom/houdini-mcp를 기본으로 채택, 3Dify의 프리비즈 피드백 루프 + CUA 폴백 패턴을 추가 구현. SceneAssistant의 13개 원자적 조작을 Houdini API에 매핑.
2. **품질 보증 루프**: SAGE의 Generator-Critic 패턴을 Houdini 워크플로에 적용. SERF 에러 택소노미([[260328_MCP_프로덕션_디자인패턴_CABP_ATBA_SERF]])로 결정론적 에러 복구 구현.
3. **3DGS → Houdini 파이프라인**: Lyra .ply 출력 → Houdini 프로시저럴 후처리 → PromptVFX 스타일 LLM-to-code 체인 검증. PCG JSON 포맷 프로토타이핑.

## 소스 논문

- SAGE: arXiv 2602.10116 | Lyra: nv-tlabs/lyra | 3Dify: github.com/3dify-project
- EvoGS, XGS, PromptVFX, Proc3D: 260401 Weekly Synthesis 참조
