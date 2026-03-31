---
author: MinHanr
categories:
- Trends
date: '2026-03-28'
draft: false
slug: 260328-llm-houdini-agentic-procedural-3d
summary: Houdini-MCP 통합과 SAGE/SceneAssistant의 에이전틱 3D 생성 패러다임은 our 3D automation project의 LLM→Houdini
  코드 생성 파이프라인 설계에 직접적 아키텍처 참조. EPC 2026의 ML-in-Houdini 마스터클래스가 ONNX 기반 프로덕션 배포 경로를
  제시.
tags:
- AI_Trend
title: LLM 기반 Houdini 에이전틱 프로시저럴 3D 생성 — MCP 통합과 에이전트 아키텍처의 수렴
---

# LLM 기반 Houdini 에이전틱 프로시저럴 3D 생성 — MCP 통합과 에이전트 아키텍처의 수렴

> 2026년 3월 기준, LLM과 Houdini의 통합이 MCP(Model Context Protocol) 기반 양방향 통신, 에이전틱 자기정제 루프, ONNX 모델 추론의 세 축으로 빠르게 수렴하고 있다. NVIDIA SAGE, SceneAssistant, Houdini-MCP 서버의 동시 발전이 3D 프로시저럴 생성의 자동화 패러다임을 재정의한다.

## 개요

SideFX Houdini는 절차적(procedural) 3D 콘텐츠 생성의 산업 표준이지만, 그 복잡한 노드 기반 워크플로는 높은 학습 곡선으로 악명이 높다. 2026년에 들어 LLM(대규모 언어 모델)과 VLM(비전-언어 모델)이 이 복잡성을 자연어 인터페이스로 추상화하는 여러 경로가 동시에 등장하고 있다.

특히 주목할 것은 세 가지 독립적 흐름의 수렴이다: (1) Houdini-MCP 서버를 통한 LLM의 직접적 씬 조작, (2) NVIDIA SAGE와 SceneAssistant 같은 에이전틱 3D 씬 생성 프레임워크, (3) EPC 2026에서 발표된 ONNX 기반 ML 모델의 Houdini 프로덕션 통합. 이 세 흐름이 합쳐지면, 자연어로 3D 씬을 기술하면 에이전트가 자율적으로 Houdini 노드 네트워크를 구축하고, VLM이 결과를 검증하며, ML 모델이 세부 디테일을 보강하는 완전 자동화 파이프라인이 가능해진다.

## 핵심 내용

### 1. Houdini-MCP 서버 — LLM의 직접적 씬 조작

Capoom의 Houdini-MCP 서버는 Model Context Protocol(MCP, "AI의 USB-C"로 불림)을 통해 Claude, GPT 등 LLM 클라이언트가 Houdini의 절차적 노드 네트워크를 직접 조작할 수 있게 한다.

**3계층 아키텍처:**
```
LLM Client (Claude/GPT) ←→ MCP Server ←→ Houdini Python API
```

**MCP 서버가 노출하는 도구 카테고리:**
- **씬 관리**: 씬 상태 쿼리, 노드 생성/수정, 노드 출력-입력 연결
- **콘텐츠 생성**: 프로시저럴 지오메트리 생성(구, 박스, 튜브, 그리드), 파라미터 제어, 재질 할당, 카메라 생성
- **다이나믹스 & 렌더링**: 물리 시뮬레이션 설정, 프레임 범위 시뮬레이션 실행, 씬 렌더링
- **고급 작업**: FBX 익스포트, Python 코드 실행

핵심적으로, LLM은 Houdini 코드를 직접 생성하는 대신 **파라미터 값을 통해 노드 네트워크를 조작**한다. "Create a box with size (2, 2, 2)"와 같은 자연어 프롬프트가 구조화된 도구 호출로 변환되어, 코드 생성 대비 안정성이 높다.

### 2. Houdini AI Assistant — 멀티 프로바이더 LLM 통합

Houdini AI Assistant(v0.1.5)는 네이티브 Houdini 도구로, OpenAI(GPT), Claude, DeepSeek, 그리고 LM Studio/Ollama를 통한 로컬 AI를 지원하는 멀티 프로바이더 아키텍처를 갖추었다. 이 도구는 씬 컨텍스트(노드, 파라미터, 연결)를 직접 읽어 Houdini 특화 답변과 액션을 제공한다.

Scanline VFX의 Logan Schwartz가 개발한 Houdini LLM Agent는 이 개념을 더 발전시켜, 코드 생성뿐 아니라 **검증과 자기 교정(self-correction)**을 Houdini 환경 내에서 수행하는 반복적 워크플로를 구현했다.

### 3. NVIDIA SAGE — 스케일러블 에이전틱 3D 씬 생성

NVIDIA Research의 SAGE(Scalable Agentic 3D Scene Generation)는 에이전트가 MCP를 통해 생성기 도구를 동적으로 호출하여 3D 씬을 구축하는 프레임워크이다.

**핵심 수치:**
- **10,000개** 다양한 씬 (50개 방 유형/스타일)
- **565,000개** 고유 생성 3D 객체
- **99.9%** 물리 안정성
- **Generator-Critic 패턴**: 생성기가 씬을 만들고, 비평기가 품질을 검증하는 자기정제 루프

### 4. SceneAssistant — VLM 기반 시각 피드백 에이전트 (arXiv 2603.12238)

SceneAssistant는 오픈 어휘(open-vocabulary) 3D 씬 생성을 위한 시각 피드백 기반 에이전트이다. 최신 3D 객체 생성 모델과 VLM의 공간 추론/계획 능력을 결합하여:

- 텍스트 설명으로부터 3D 씬을 점진적으로 구축
- VLM이 중간 렌더링 결과를 검토하여 시각적 피드백 제공
- 피드백 기반으로 씬을 반복 개선

SAGE의 Generator-Critic 패턴을 **시각적 모달리티로 확장**한 것으로, 텍스트 기반 평가만으로는 포착할 수 없는 공간적 부정합, 스케일 오류, 시각적 부조화를 검출한다.

### 5. EPC 2026 — ONNX 기반 ML의 Houdini 프로덕션 통합

SideFX의 Everything Procedural Conference(EPC) 2026(4월 9-10일)에서 Josh Karlin(SideFX Technical Artist)이 "Deploying and Scaling Machine Learning in Houdini" 마스터클래스를 진행한다.

**커버 내용:**
- ONNX를 통한 모델 추론으로 커스텀 프로덕션 데이터셋과 ML 도구 생성
- 외부 AI 모델의 프로시저럴 Houdini 워크플로 통합
- AI 학습용 합성 데이터 생성
- 2D/3D 프로덕션 태스크에 ML 적용

또한 Bogdan Lazar(CG Supervisor)의 "Rigging and Animating Gaussian Data" 세션에서 Gaussian Splatting 포인트클라우드를 KineFX/APEX를 통해 애니메이션 가능 에셋으로 변환하는 워크플로가 시연된다.

## 출처

- [Houdini, Claude, and MCP: AI-Powered 3D Creation — Skywork](https://skywork.ai/skypage/en/houdini-claude-ai-3d-creation/1979041820994818048)
- [SAGE: Scalable Agentic 3D Scene Generation — NVIDIA (arXiv 2602.10116)](https://arxiv.org/html/2602.10116)
- [SAGE GitHub — NVlabs](https://github.com/NVlabs/sage)
- [SceneAssistant: Visual Feedback Agent — arXiv 2603.12238](https://arxiv.org/html/2603.12238)
- [LLM Agents in Houdini — Logan Schwartz (Scanline VFX)](https://logan169.github.io/2025/03/04/houdini-large-language-model-agent.html)
- [EPC 2026 — SideFX](https://www.sidefx.com/houdini-hive/epc-2026/)
- [Procedural Meets Generative: Houdini + AI — SideFX Talks](https://www.sidefx.com/learn/talks/procedural-meets-generative-houdini-ai-in-practice/)
- [Houdini AI Assistant — SideFX Forums](https://www.sidefx.com/forum/topic/102263/)