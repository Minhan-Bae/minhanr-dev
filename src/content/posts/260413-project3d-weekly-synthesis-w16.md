---
status: published
slug: 260413-project3d-weekly-synthesis-w16
summary: 'W16 Project-3D 클러스터 5건은 두 가지 축으로 수렴한다: (1) LLM이 코드를 통해 3D 세계를 직접 생성·편집하는
  패러다임 확립, (2) 이를 통제할 수 있는 에이전트 거버넌스 인프라. VoxelCodeBench와 Proc3D가 "LLM → 3D 코드 생성"의
  성능 한계와 해법을 정량화하고, OrgAgen…'
created: 2026-04-13
tags:
- AI_R&D_Paper
- domain/3d
- domain/agents
- Synthesis
- Weekly
period: 2026-W16
synthesized_from:
- '[[260412_VoxelCodeBench_3D_World_Modeling_Code_Generation]]'
- '[[260412_Proc3D_Procedural_3D_Generation_Parametric_Editing_LLM]]'
- '[[260413_OrgAgent_CompanyStyle_Hierarchical_MAS_ORGA]]'
- '[[260413_AITrustOS_Continuous_Governance_ZeroTrust_Compliance_ATOS]]'
- '[[260413_Ruflo_v35_Claude_Agent_Orchestration_Governance_ControlPlane_RUFL]]'
date: '2026-04-13'
author: MinHanr
---

# Project-3D 주간 수렴 리포트 — 2026-W16

> LLM 기반 3D 코드 생성 + 에이전트 거버넌스 = 자율 3D 파이프라인 기반 확립

## 주간 핵심 시그널

W16 Project-3D 클러스터 5건은 두 가지 축으로 수렴한다: **(1) LLM이 코드를 통해 3D 세계를 직접 생성·편집하는 패러다임 확립**, **(2) 이를 통제할 수 있는 에이전트 거버넌스 인프라**. VoxelCodeBench와 Proc3D가 "LLM → 3D 코드 생성"의 성능 한계와 해법을 정량화하고, OrgAgent/AITrustOS/Ruflo가 이 파이프라인을 자율 운용할 때 필요한 통제 계층을 제공한다.

## 수렴 분석

### 1. LLM → 3D 코드 생성: 벤치마크와 해법

VoxelCodeBench(Meta, arXiv 2604.02580)는 LLM이 Python 코드로 UE5 복셀 기반 3D 씬을 생성하는 능력을 220개 태스크로 체계 평가한 최초의 벤치마크다. 핵심 발견: "실행 가능한 코드를 만드는 것"과 "공간적으로 정확한 3D를 만드는 것" 사이에 큰 갭이 존재한다. 기하학적 구성(Geometric Construction)과 예술적 구성(Artistic Composition) 카테고리에서 최고 모델도 정확도가 급락한다.

Proc3D(arXiv 2601.12234)는 이 갭에 대한 해법을 제시한다: **Procedural Compact Graph (PCG)**라는 새로운 3D 표현을 도입하여, LLM이 한 번 생성한 3D 모델을 파라미터 슬라이더나 자연어로 즉시 편집할 수 있게 한다. Houdini 노드 그래프, Blender Geometry Nodes와 개념적으로 동형이며 — 이것이 HoudiniMCP 프로젝트와 직접 연결되는 지점이다.

**Project-3D 시사점**: Proc3D의 PCG → HoudiniMCP 파이프라인으로 자연스러운 브릿지가 가능하다. LLM이 PCG를 생성하면, HoudiniMCP가 이를 Houdini 노드 그래프로 변환하여 프로시저럴 편집+렌더링을 수행하는 워크플로우.

### 2. 에이전트 거버넌스 → 3D 파이프라인 통제

3건의 에이전트 거버넌스 논문/프로젝트(OrgAgent, AI Trust OS, Ruflo)가 모두 Project-3D에 태그된 이유: 3D 생성 파이프라인이 자율화될수록, 에이전트가 GPU 리소스를 사용하고 렌더링을 실행하고 파일을 생성하는 행위를 통제할 거버넌스가 필수적이다. 특히:

- **OrgAgent의 계층적 분업**: 3D 씬 생성 태스크를 "모델링→텍스처→라이팅→렌더링" 하위 에이전트로 분업 가능
- **Ruflo의 런타임 거버넌스**: 3D 파이프라인 에이전트가 실행 전 규칙 검증을 통과해야만 GPU 리소스를 사용할 수 있게 하는 "admission control" 패턴

### 3. HoudiniMCP 브릿지 기회

Proc3D의 PCG 표현은 Houdini의 프로시저럴 그래프와 개념적으로 동형이다. VoxelCodeBench의 UE5 렌더링 파이프라인은 HoudiniMCP가 커버하지 않는 게임 엔진 통합 축을 보여준다. 이 두 연구를 종합하면, HoudiniMCP 프로젝트에 두 가지 확장 방향이 명확해진다: **(a) PCG→Houdini 노드 변환기**, **(b) UE5 Voxel Plugin 통합 경로**.

## 이번 주 액션

1. **Proc3D PCG ↔ Houdini 노드 매핑 테이블 작성**: PCG의 그래프 요소(노드 타입, 파라미터 인터페이스)를 Houdini SOP/VOP 노드에 대응시키는 매핑 초안. HoudiniMCP의 `node_create` API와의 호환성 검토.

2. **VoxelCodeBench 실패 모드 분석**: 기하학적 구성 카테고리에서 LLM이 실패하는 패턴(공간 추론 오류, 좌표계 혼동 등) 3가지 분류. Proc3D의 파라미터 편집이 이 실패를 보정할 수 있는지 평가.

3. **3D Agent Governance Spec 초안**: OrgAgent + Ruflo의 거버넌스 패턴을 참조하여, 3D 생성 에이전트의 "admission control" 규칙 5개 정의. GPU 리소스 사용량 제한, 출력 파일 크기 검증, 렌더링 품질 자동 체크 포함.

## 신뢰도

- **confidence: normal** — 클러스터 5건, source 다양성 5종(arxiv 3, GitHub 2). git_signal에 Project-3D 직접 편집 미감지.
- VoxelCodeBench(Meta) + Proc3D 조합이 3D 코드 생성 벤치마크+해법의 양면을 커버 — 높은 보완성.
