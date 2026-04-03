---
title: "3DAgent — AI 에이전트 기반 3D 생성의 현재와 미래"
slug: 3dagent-agentic-3d-synthesis
date: 2026-04-01
description: "OIKBAS TrinityX 파이프라인이 수집·수렴한 기술 동향 종합 리포트"
tags: [AI_R&D_Synthesis, domain/agents, domain/3d, 3DAgent]
status: mature
created: 2026-04-01
relevance: 5
related: [3DAgent]
source_type: synthesis
---

# 3DAgent 에이전틱 3D 생성 기술 종합 (2026-04 Synthesis)

> 2026년 3월 수집된 77개 growing notes에서 도출한 에이전틱 3D 생성 기술 랜드스케이프. 3DAgent 프로젝트의 Houdini 통합 전략과 LLM 백엔드 선택을 제시한다.

## 1. 에이전틱 3D 생성의 3대 패러다임

2026년 3월 기준, LLM 기반 3D 생성은 세 가지 패러다임으로 분화되고 있다:

### 패러다임 A: 코드 생성 (LL3M 방식)

[[260327_LL3M_Large_Language_3D_Modelers_Blender|LL3M]]은 3D 생성을 **코드 작성 태스크**로 재정의한 핵심 논문이다. Planner → Retriever(BlenderRAG) → Writer → Debugger → Refiner의 5단 멀티에이전트 체인으로 Blender Python 코드를 생성하여, 3D 데이터 학습 없이 편집 가능한 .blend 에셋을 출력한다. 3DAgent의 **아키텍처 레퍼런스 1순위**이며, Blender를 Houdini로 교체하여 HoudiniRAG + VEX/Python 코드 생성 파이프라인을 구축하는 로드맵이 명확하다.

### 패러다임 B: 에이전틱 씬 생성 (SAGE 방식)

[[260327_SAGE_NVIDIA_Scalable_Agentic_3D_Scene_Generation|NVIDIA SAGE]]는 **Generator-Critic 반복 정제** 아키텍처로, 텍스트에서 시뮬레이션 환경을 자동 생성한다. 50개 룸 타입, 565K 고유 3D 오브젝트, 물리 안정성 **99.9%**, 충돌률 **1.9%**를 달성했다. SAGE-10k 데이터셋(10,000 씬)이 HuggingFace에 공개되어 있어 3DAgent의 학습/평가 데이터로 즉시 활용 가능하다. Generator-Critic 패턴에서 3개 전문 Critic(semantic plausibility, visual realism, physical stability)이 품질을 자동 검증하는 구조는, Houdini 자동화에서 물리 시뮬레이션 검증 자동화에 직접 차용할 수 있다.

### 패러다임 C: 프로시저럴 그래프 생성 (Proc3D 방식)

[[260329_Proc3D_Procedural_3D_Generation_LLM_PCG|Proc3D]]는 **Procedural Compact Graph (PCG)**라는 엔진 독립적 그래프 표현을 제안한다. LLM이 DAG 기반 프로시저럴 그래프를 직접 생성하고, 이를 Blender/Unity3D로 컴파일하는 방식이다. 편집 속도 **400x 향상**, 업데이트 지연 **<10ms**, 표현 압축률 **4-10x**. PCG 개념은 Houdini의 프로시저럴 노드 그래프와 자연스럽게 매핑되며, MCP 서버(런타임 연결)와 PCG(생성 표현 포맷)를 결합하면 3DAgent의 Houdini 통합 아키텍처가 완성된다. 다만 코드/모델은 미공개이다.

## 2. 멀티에이전트 프레임워크 레퍼런스

[[260327_World_Craft_Agentic_3D_World_Creation|World Craft]]는 **World Scaffold**(구조화된 출력 표준) + **World Guild**(멀티에이전트 의도 분석) 이원 구조로, AI Town 환경을 텍스트에서 생성한다. Cursor, Antigravity 등 상용 코드 에이전트 대비 유의미한 성능 우위를 보고했다. "구조화된 출력 포맷 정의"와 "멀티에이전트 의도 분석"을 분리하는 설계 원칙은 3DAgent에서 Houdini 노드 그래프 스키마(Scaffold)와 사용자 의도 해석(Guild)을 독립적으로 개선하는 아키텍처로 적용할 수 있다.

[[260330_naturallanguage_agent_harnesse|Agent Harnesses]]는 LLM과 도구 사이의 **자연어 중계 계층(Middleware)**으로, 도구 오사용률을 **40% 이상 감소**시키면서 작업 성공률을 **15% 향상**시켰다. 비개발자가 자연어로 에이전트 권한을 설정할 수 있는 Guideline Enforcement Mechanism은 3DAgent의 Houdini API 호출 안전성을 보장하는 거버넌스 레이어로 참고할 수 있다.

## 3. 3D 에이전트 메모리: GSMem

[[260329_GSMem_3DGS_Persistent_Spatial_Memory_Embodied_Agent_GSMM|GSMem]]은 3D Gaussian Splatting을 **에이전트의 지속적 공간 메모리**로 활용하는 zero-shot 프레임워크다. 기존 scene graph나 keyframe 기반 메모리의 한계(post-hoc re-observability 부재)를 극복하며, GS의 연속적 3D 표현을 통해 이전에 방문하지 않은 최적 시점에서 사진같은 뷰를 렌더링하여 VLM 추론에 활용한다. Hybrid Exploration Strategy(VLM semantic scoring + 3DGS coverage objective)는 Houdini 프로시저럴 생성에서의 장면 탐색 자동화에 응용 가능하다.

## 4. LLM 백엔드 비교 — 3DAgent에 최적의 모델

| 모델 | 코딩 성능 | 컨텍스트 | 에이전틱 특화 | 라이선스 | VRAM |
|------|----------|---------|-------------|---------|------|
| **Nemotron 3 Super** | PinchBench 85.6% | **1M 토큰** | ✅ Latent MoE, MTP | 오픈 웨이트 | 멀티 GPU |
| **GLM-4.7** | LiveCodeBench **84.9%** | 128K | ✅ Preserved Thinking | 오픈소스 | 355B MoE/멀티 GPU |
| **GLM-4.7-Flash** | - | 128K | ✅ | 오픈소스 | **30B/3B, 단일 GPU** |
| **IQuest-Coder 40B** | SWE-Bench **76.2%** | **128K** | Loop 아키텍처 | Apache-2.0 | ~60-65GB |
| **IQuest-Coder 14B** | - | 128K | Instruct/Thinking | Apache-2.0 | **RTX 4090** |

**권장**: 3DAgent 프로토타입 단계에서는 **IQuest-Coder 14B Thinking** (RTX 4090 단일 GPU, Apache-2.0, 128K 컨텍스트)를 1차 후보로 추천한다. SWE-Bench 수준의 코딩 능력으로 HoudiniRAG 기반 VEX/Python 생성이 가능하며, 라이선스 장벽이 없다. 프로덕션 단계에서는 **Nemotron 3 Super** (1M 컨텍스트로 전체 씬 그래프 입력 가능, 에이전틱 추론 특화)를 AIDC GPU 환경에서 호스팅하는 전략이 최적이다.

[[260330_NVIDIA_Nemotron3_Super_Hybrid_MoE|Nemotron 3 Super]]의 Latent MoE(동일 FLOPs로 4x 전문가 활성화)와 Multi-Token Prediction(speculative decoding 내장)은 Houdini 코드 생성의 긴 출력 시퀀스를 효율적으로 처리하는 데 핵심적이다. 1M 네이티브 컨텍스트는 복잡한 씬 그래프 전체를 한 번에 입력할 수 있어, 맥락 손실 없는 코드 생성이 가능하다.

## 5. NVIDIA PivotRL — 에이전트 학습 효율화

[[260325_NVIDIA_PivotRL_에이전틱_RL_프레임워크|PivotRL]]은 장기 수평 에이전틱 태스크에서 E2E RL 대비 **4x 적은 롤아웃**으로 동등한 정확도를 달성하는 프레임워크다. Pivot Filtering(핵심 턴만 학습)과 Functional Rewards(턴별 기능적 보상)를 통해 훈련 효율을 극대화한다. 3DAgent의 에이전트 학습에서 Houdini 작업의 "핵심 결정 포인트"만 학습에 활용하는 전략으로 참고 가능하다.

## 6. Houdini 통합 아키텍처 권장

```
Phase 1: HoudiniRAG + 단일 에이전트 (IQuest-14B)
  ├─ Houdini VEX/Python API 문서 → 벡터 DB 인덱싱
  ├─ 텍스트 → LLM → Houdini Python 코드 → 실행 → 결과
  └─ Agent Harness 레이어로 안전한 도구 실행 보장

Phase 2: 멀티에이전트 (LL3M 패턴 + SAGE Critic)
  ├─ Planner + Retriever + Writer + Debugger + Refiner
  ├─ 3개 Critic (semantic + visual + physical)
  └─ 반복 정제 루프

Phase 3: 프로덕션 (Nemotron 3 Super + PCG)
  ├─ 1M 컨텍스트로 씬 그래프 전체 이해
  ├─ PCG 표현으로 엔진 독립적 출력
  └─ World Craft Scaffold 패턴으로 Houdini 노드 스키마 정의
```

## 이번 달 액션

1. **HoudiniRAG 구축 시작**: Houdini 20.5 VEX 레퍼런스(vex.sidefx.com) + Python API 문서를 크롤링하여 ChromaDB에 인덱싱한다. LL3M의 BlenderRAG 아키텍처(API 시그니처 + 타입 정보 + 사용 예제)를 그대로 따르되, VEX 전용 코드 패턴 200건을 수동 큐레이션하여 품질을 확보한다.

2. **IQuest-Coder 14B Thinking으로 Houdini 코드 생성 PoC**: "간단한 프로시저럴 지형 생성" 태스크를 정의하고, HoudiniRAG에서 검색된 API 문서를 컨텍스트로 제공한 뒤 Houdini Python 코드를 생성/실행하는 end-to-end 프로토타입을 구축한다. 성공률/오류율/수정 반복 횟수를 측정하여 Phase 2 진입 기준을 설정한다.

3. **SAGE-10k 데이터셋 분석 및 도메인 필터링**: HuggingFace에서 SAGE-10k를 다운로드하고, 50개 룸 타입 중 VFX 스튜디오/실내 환경에 해당하는 카테고리를 필터링한다. 565K 3D 오브젝트 라이브러리에서 3DAgent 초기 프로토타입에 활용할 에셋 서브셋을 확보한다.
