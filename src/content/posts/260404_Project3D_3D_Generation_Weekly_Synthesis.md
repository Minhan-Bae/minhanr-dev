---
tags:
  - Weekly
  - Insight
  - Project-3D
  - 3D
source_type: synthesis
status: mature
created: 2026-04-04
period: 2026-W14
relevance: 5
related:
  - "260403_Code2Worlds_4D_World_Generation_Coding_LLM_C2W"
  - "260403_ShapeCraft_LLM_Agents_Structured_3D_Modeling_SHPC"
  - "260404_RI3D_FewShot_GS_Repair_Inpainting_Diffusion_RI3D"
  - "260401_3DAgent_Agentic_3D_Synthesis"
  - "260402_Project3D_Houdini_MCP_Convergence"
---

# 260404 Project-3D 3D Generation Weekly Synthesis

> W14(2026-04-03~04) 신규 논문 3건 통합. 에이전틱 3D 생성의 아키텍처 분화와 3DGS 복원 기법의 교차점을 분석한다.

## 이번 주 핵심 발견

이번 주 수집된 3건의 논문은 에이전틱 3D 생성이 **두 개의 독립적 축**으로 동시에 진화하고 있음을 보여준다.

1. **코딩 LLM의 4D 확장**: [[260403_Code2Worlds_4D_World_Generation_Coding_LLM_C2W|Code2Worlds]]가 정적 3D를 넘어 물리 시뮬레이션 포함 4D 생성으로 진입. 듀얼 스트림 + VLM 자기반성이 핵심.
2. **멀티에이전트 구조화 모델링의 성숙**: [[260403_ShapeCraft_LLM_Agents_Structured_3D_Modeling_SHPC|ShapeCraft]]가 Parser-Coder-Evaluator 3에이전트 + GPS(Graph-based Procedural Shape) 표현으로 편집 가능한 3D 생성을 NeurIPS 2025에서 입증.
3. **Few-shot 3DGS의 디퓨전 이원화**: [[260404_RI3D_FewShot_GS_Repair_Inpainting_Diffusion_RI3D|RI3D]]가 가시/비가시 영역을 분리하는 Repair+Inpainting 2단계 전략으로 극소수 이미지 복원 품질을 대폭 향상.

지난주 [[260402_Project3D_Houdini_MCP_Convergence|Houdini MCP 수렴 분석]]에서 확인된 "LLM + MCP + Visual Feedback Loop" 패턴이 이번 주 논문들에서도 일관되게 나타나며, 특히 **자기반성/평가 루프의 구체적 구현 방식**이 다양화되고 있다.

## 개별 논문 분석

### 1. Code2Worlds: 코딩 LLM의 4D 세계 생성

[[260403_Code2Worlds_4D_World_Generation_Coding_LLM_C2W|Code2Worlds]]는 텍스트에서 물리 시뮬레이션 포함 4D 씬을 생성하는 프레임워크다. 핵심 기여는 **듀얼 스트림 아키텍처**(Object Stream + Scene Stream)로 멀티스케일 컨텍스트 엉킴 문제를 해소하고, **VLM-Motion Critic**의 자기반성 메커니즘으로 물리적 환각(physical hallucination)을 교정한 것이다. SGS +41%, Richness +49% 향상을 달성했다. Project-3D 관점에서 듀얼 스트림 구조는 Houdini PDG(Object → HDA, Scene → 레이아웃 오케스트레이션)와 구조적으로 동형이며, VLM 기반 시뮬레이션 검증 루프는 SAGE의 3개 Critic 패턴과 결합하여 Houdini 물리 시뮬레이션(FLIP, Vellum, RBD) 자동 검증에 직접 적용 가능하다.

### 2. ShapeCraft: 3에이전트 구조화 3D 모델링

[[260403_ShapeCraft_LLM_Agents_Structured_3D_Modeling_SHPC|ShapeCraft]]는 학습 없이(training-free) Parser-Coder-Evaluator 3에이전트가 협업하여 편집 가능한 3D 모델을 생성한다. GPS(Graph-based Procedural Shape) 표현은 계층적 DAG로 파트를 분해하고, 각 노드에 절차적 코드와 편집 파라미터를 바인딩한다. [[260329_Proc3D_Procedural_3D_Generation_LLM_PCG|Proc3D]]의 PCG와 유사하나, **텍스처 필드 통합**(CASD)과 **멀티패스 코드 생성** 전략이 차별점이다. GPS 표현이 Houdini 노드 그래프와 구조적으로 동형이라는 점에서, [[260401_3Dify_Procedural_3DCG_LLM_MCP_RAG|3Dify]]의 MCP 레이어 위에 ShapeCraft의 에이전트 패턴을 올리는 하이브리드 아키텍처가 유망하다.

### 3. RI3D: Few-shot 3DGS의 Repair+Inpainting 이원화

[[260404_RI3D_FewShot_GS_Repair_Inpainting_Diffusion_RI3D|RI3D]]는 극소수(3~9장) 입력 이미지에서 3DGS 복원을 수행한다. 가시 영역 복원(Repair)과 비가시 영역 생성(Inpainting)을 **각각 전문화된 디퓨전 모델**로 분리하는 2단계 최적화가 핵심이다. 3D-consistent depth와 relative depth를 결합한 초기화 기법도 주목할 만하다. Project-3D 파이프라인에서 [[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation|Lyra]]의 비디오 디퓨전 → 3DGS 경로와 상호보완적이며, 특히 실제 촬영 환경에서 카메라 수가 제한적인 경우의 품질 보강 모듈로 활용 가능하다.

## 크로스 분석: 트렌드와 패턴

### 트렌드 1: "분리하고 전문화하라" 패턴의 확산

세 논문 모두 **단일 모놀리식 모델 대신 역할 분리 + 전문화** 전략을 취한다:
- Code2Worlds: Object Stream / Scene Stream 분리
- ShapeCraft: Parser / Coder / Evaluator 분리
- RI3D: Repair Model / Inpainting Model 분리

이는 [[260401_3DAgent_Agentic_3D_Synthesis|3DAgent 종합]]에서 정리한 3대 패러다임(코드 생성, 에이전틱 씬, 프로시저럴 그래프)이 내부적으로도 모듈 분해를 심화하고 있음을 의미한다. Houdini MCP 프로토타입 설계 시 **단일 에이전트 → 멀티에이전트 전환**의 시점을 앞당겨야 할 수 있다.

### 트렌드 2: 자기반성 루프의 구현 다양화

피드백 루프가 각 시스템마다 다른 방식으로 구현되고 있다:

| 시스템 | 피드백 소스 | 판단 기준 | 루프 대상 |
|--------|------------|----------|----------|
| Code2Worlds | VLM-Motion Critic | 물리적 충실도 | 시뮬레이션 코드 |
| ShapeCraft | Evaluator Agent | 기하학적 정확성 + 의도 부합 | 절차적 모델링 코드 |
| SAGE (기존) | 3개 Critic | 시맨틱/비주얼/물리 | 씬 레이아웃 |

Project-3D에서는 Houdini 렌더 결과를 VLM으로 평가하는 **Visual Critic**과, 시뮬레이션 물리량을 수치적으로 검증하는 **Physical Critic**을 분리 구현하는 것이 합리적이다.

### 트렌드 3: DAG 기반 프로시저럴 표현의 수렴

Proc3D의 PCG, ShapeCraft의 GPS, Code2Worlds의 듀얼 스트림 모두 **DAG(방향성 비순환 그래프)** 기반 표현을 핵심 자료구조로 채택한다. 이는 Houdini의 네이티브 노드 그래프와 직접적으로 대응하며, Project-3D가 Houdini를 백엔드 DCC로 선택한 전략적 판단을 강하게 뒷받침한다.

## 이번 주 액션

1. **ShapeCraft GPS → Houdini 노드 매핑 프로토타입**: GPS의 DAG 표현을 Houdini Subnet/HDA 구조로 변환하는 JSON 스키마를 정의한다. [[260402_Project3D_Houdini_MCP_Convergence|Houdini MCP 수렴 분석]]에서 선정한 capoom/houdini-mcp의 노드 CRUD API를 활용하여, GPS 그래프 → Houdini 노드 자동 생성 PoC를 구축한다.

2. **Code2Worlds VLM-Motion Critic의 Houdini 적용 검증**: Houdini에서 간단한 RBD 시뮬레이션을 실행하고, 렌더 결과를 VLM(GPT-4V 또는 Claude Vision)에 전달하여 물리적 타당성을 평가하는 최소 파이프라인을 테스트한다. SAGE의 물리 Critic과 비교하여 어느 접근이 Houdini 워크플로에 더 적합한지 판단한다.

3. **RI3D 코드 공개 모니터링 및 Lyra 파이프라인 통합 설계**: RI3D GitHub 리포를 Watch하고, 코드 공개 시 Lyra .ply → RI3D few-shot 보강 → Houdini 후처리 파이프라인의 실현 가능성을 즉시 검증한다. 특히 depth 초기화 전략이 Houdini의 depth pass와 어떻게 연동될 수 있는지 사전 조사한다.

## 다음 주 관찰 포인트

- **Code2Worlds의 Blender 외 DCC 지원 확장 여부**: 현재 Blender 전용 구현이나, 듀얼 스트림 아키텍처 자체는 DCC 독립적. Houdini Python 포팅 가능성 모니터링.
- **ShapeCraft CASD 텍스처링의 PBR 호환성**: Component-Aware Score Distillation이 생성하는 텍스처가 PBR 워크플로(Roughness, Metallic, Normal 맵 분리)와 호환되는지 후속 연구 추적.
- **Few-shot 3DGS 분야의 Repair/Inpainting 분리 전략 후속 연구**: RI3D 패턴이 다른 연구에서도 채택되는지 확인. 특히 [[260402_GaussVideoDreamer_VideoD_InconsistencyAware_3DGS_GVDR|GaussVideoDreamer]]와의 결합 가능성.
- **Houdini MCP 커뮤니티 동향**: capoom/houdini-mcp의 Star 수 증가 추이와 신규 기능 PR. 특히 시뮬레이션 제어 API 확장 여부가 Code2Worlds 스타일 4D 생성 적용의 전제조건.
- **NeurIPS 2025 ShapeCraft 발표 후 후속 연구**: GPS 표현의 USD/glTF 직접 export 가능성, 멀티에이전트 수 확장(3 → N) 실험 결과 추적.
