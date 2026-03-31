---
title: "LLM이 Blender 코드를 쓴다 — LL3M: 멀티에이전트 3D 모델링의 패러다임 전환"
date: 2026-03-28
draft: false
author: MinHanr
tags: ["3d-generation", "llm", "multi-agent", "blender", "paper-review"]
categories: ["Research"]
summary: "3D 데이터 학습 없이 LLM 에이전트 팀이 Blender Python 코드를 작성하여 3D 에셋을 생성하는 LL3M. 코드 기반 3D 생성이라는 새로운 패러다임을 분석합니다."
description: "LL3M은 Plan-Retrieve-Write-Debug-Refine 멀티에이전트 파이프라인으로 텍스트에서 편집 가능한 3D 에셋을 생성합니다. BlenderRAG, 비주얼 자기비평, Co-Creative Loop 등 핵심 기술을 분석합니다."
keywords: ["LL3M", "3D generation", "LLM", "Blender", "multi-agent", "code generation", "BlenderRAG", "procedural modeling"]
---

3D 에셋 생성의 기존 접근은 모두 **3D 데이터에서 학습**합니다. DreamFusion은 2D 이미지에서 Score Distillation으로, Point-E는 포인트 클라우드 데이터셋에서, 3DGS는 멀티뷰 이미지에서. 그런데 만약 3D 데이터가 전혀 필요 없다면?

**LL3M(Large Language 3D Modelers)**은 3D 생성을 **코드 작성 태스크**로 재정의합니다. LLM 에이전트 팀이 Blender Python 코드를 작성하면, 그 코드가 곧 3D 에셋입니다.

## 왜 코드 기반 3D 생성인가

기존 방식의 한계:

| 문제 | 설명 |
|------|------|
| **데이터 부족** | 고품질 3D 데이터 수집은 비싸고 양이 부족 |
| **편집 불가** | NeRF, 3DGS 등 암묵적 표현은 아티스트가 직접 편집 어려움 |
| **워크플로우 단절** | 생성된 결과물이 기존 DCC 도구(Blender, Maya, Houdini)와 호환 안 됨 |

LL3M의 접근: LLM은 이미 코드를 잘 쓴다. Blender는 Python API가 완비되어 있다. **LLM이 Blender 코드를 쓰면 3D 에셋이 나온다.**

결과물의 특성:
- **사람이 읽을 수 있는** Python 코드
- **편집 가능**: 파라미터를 바꾸면 형상이 변경
- **모듈화**: 오브젝트별 독립 코드 블록
- **Blender 네이티브**: 아티스트가 바로 사용 가능

## 멀티에이전트 아키텍처

LL3M의 핵심은 5단계 에이전트 체인입니다:

**1. Planner** — 전체 구조를 계획합니다. "중세 성" 요청이 들어오면 "탑, 성벽, 문, 해자"로 분해.

**2. Retriever** — BlenderRAG에서 필요한 API 함수와 예제를 검색합니다. "B-mesh로 원기둥 생성하는 방법"을 찾아 Writer에 전달.

**3. Writer** — 실제 Blender Python 코드를 작성합니다. B-meshes, Geometry Modifiers, Shader Nodes 등 고급 Blender 기능을 활용.

**4. Debugger** — 코드를 실행하고 에러가 나면 수정합니다. 문법 에러, 런타임 에러, API 호환성 문제를 자동 해결.

**5. Refiner** — 렌더링 결과를 비주얼 자기비평(visual self-critique)으로 평가하고 품질을 개선합니다.

### BlenderRAG: 핵심 지식 베이스

Blender API 문서 전체를 RAG(Retrieval-Augmented Generation)로 구축:
- 함수 시그니처 + 타입 정보
- 실제 사용 예제 코드
- 에이전트가 **정확한 Blender 함수를 호출**할 수 있도록 지원

이것이 없으면 LLM은 존재하지 않는 API를 환각(hallucinate)합니다. BlenderRAG가 코드 정확성의 핵심.

### Co-Creative Loop

시스템이 자동 생성한 후, 사용자가 추가 편집 지시:
```
사용자: "의자를 만들어줘"
LL3M: [의자 생성]
사용자: "다리를 더 가늘게"
LL3M: [코드에서 다리 반지름 파라미터 수정 → 재생성]
사용자: "스팀펑크 스타일로"
LL3M: [셰이더 노드 교체 → 금속 텍스처 적용]
```

## 기존 3D 생성 방법과의 비교

| 방법 | 입력 | 출력 | 편집성 | 3D 데이터 필요 |
|------|------|------|--------|--------------|
| DreamFusion | 텍스트 | NeRF | 어려움 | 간접 (2D) |
| Point-E / Shap-E | 텍스트 | 메시 | 제한적 | 필요 |
| 3DGS | 이미지 | Gaussian | 어려움 | 이미지 |
| **LL3M** | **텍스트** | **Blender 코드** | **완전** | **불필요** |

## DCC 도구 확장 가능성

LL3M이 증명한 것은 "LLM + RAG + 멀티에이전트 → DCC 도구 자동화"라는 패턴의 유효성입니다. 이 패턴은 Blender에 한정되지 않습니다:

- **Blender** (LL3M) → Python API + BlenderRAG
- **Houdini** → VEX/Python API + HoudiniRAG
- **Maya** → MEL/Python API + MayaRAG
- **Unreal Engine** → Blueprint/C++ + UnrealRAG

대상 DCC 도구의 API 문서로 RAG를 구축하면, 동일한 멀티에이전트 아키텍처를 재사용할 수 있습니다.

## 한계점

- **속도**: 멀티에이전트 체인 순차 실행으로 생성에 수분 소요
- **유기체 한계**: 코드 기반이라 인체, 동물 같은 복잡한 유기적 형상 표현에 한계
- **벤치마크**: 정량적 비교 메트릭이 논문에 없음 (정성적 비교만)
- **DCC 종속**: Blender 전용 — 다른 도구는 별도 RAG 필요

## 시사점

LL3M은 "AI가 3D를 생성한다"에서 "AI가 3D **코드를** 생성한다"로의 패러다임 전환입니다. 이 전환이 중요한 이유는, 코드는 사람이 이해하고, 수정하고, 재사용할 수 있기 때문입니다. AI와 아티스트의 협업이 암묵적 표현이 아닌 **코드**라는 공통 언어 위에서 이루어지는 미래를 보여줍니다.

---

*이 글은 personal knowledge system 볼트의 연구 노트를 기반으로 작성되었습니다.*

Sources:
- [arXiv: 2508.08228](https://arxiv.org/abs/2508.08228)
- [Project Page](https://threedle.github.io/ll3m)
- [GitHub](https://github.com/threedle/ll3m)
