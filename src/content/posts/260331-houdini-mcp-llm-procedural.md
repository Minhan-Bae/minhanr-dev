---
tags:
- AI_Daily_Trend
- domain/tools
- tech/MCP
- tech/procedural
- tech/automation
- tech/agent
source_url: https://github.com/capoomgit/houdini-mcp
code_url: https://github.com/capoomgit/houdini-mcp
code_available: true
model_available: false
license: MIT
status: published
created: 2026-03-31
slug: 260331-houdini-mcp-llm-procedural
summary: HoudiniMCP는 Capoom이 개발한 오픈소스 MCP(Model Context Protocol) 서버로, Claude 등 LLM
  에이전트가 SideFX Houdini를 자연어로 직접 제어할 수 있게 한다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260331-houdini-mcp-llm-procedural/cover.jpg
  alt: 260331 houdini mcp llm procedural
date: '2026-03-31'
categories:
  - VFX
---

# HoudiniMCP: LLM이 Houdini를 직접 제어하는 MCP 서버

## 개요

HoudiniMCP는 Capoom이 개발한 오픈소스 MCP(Model Context Protocol) 서버로, Claude 등 LLM 에이전트가 SideFX Houdini를 자연어로 직접 제어할 수 있게 한다. 2026년 3월 기준 GitHub Stars 177개, MIT 라이선스, Python 100% 구현. 같은 아키텍처 패턴의 선행작인 blender-mcp를 Houdini에 적용한 형태다.

Capoom은 3D 합성 데이터(synthetic data) 및 절차적 모델링(procedural modeling) 전문 회사로, Houdini를 AI 자동화 대상으로 선택한 배경이 명확하다. Houdini는 노드 기반 절차적 워크플로우 덕분에 AI가 조작하기에 이상적인 구조다 — 버텍스 개별 조작 대신 "레시피(노드 그래프)"를 수정하면 된다.

기술 구조: Houdini 내부에 Python addon이 localhost:9876에서 TCP 서버로 동작한다. Claude는 MCP 브릿지를 통해 이 서버와 JSON 프로토콜로 통신한다. 지원 명령: 씬 정보 조회, 노드 생성/수정, 지오메트리 조작, 머티리얼 적용, 시뮬레이션 제어, 렌더링, 내보내기. 특히 `execute_houdini_code` 도구로 임의의 Python 코드를 Houdini 세션 내에서 실행 가능하다 (강력하나 보안 주의).

OPUS 프로시저럴 에셋 라이브러리(RapidAPI)와 통합하여 가구·환경 에셋 자동 생성도 지원한다.

3D generation research 프로젝트와의 직접 연관성: 3DAgent는 LLM이 Houdini 코드를 생성하여 절차적 3D를 자동화하는 프로젝트다. HoudiniMCP는 LLM→Houdini 통신 레이어를 MCP 표준으로 제공하므로, 현재 Python 스크립트 직접 실행 방식보다 더 구조화된 에이전트 통합이 가능하다. Claude Code에서 바로 사용 가능: `claude mcp add-json "houdini-mcp" '{"command":"npx","args":["-y","houdini-mcp"]}'`

## 핵심 수치/벤치마크

- GitHub Stars: **177** (2026-03-31 기준)
- GitHub Forks: 22
- Commits: 26
- 지원 Houdini 버전: **19.5+**
- 플랫폼: Windows (문서화 기준), 기타 OS 커뮤니티 확장 중

## 아키텍처/방법론

1. **Houdini Python Addon**: localhost:9876 TCP 서버, MCP 명령을 Houdini API 호출로 변환
2. **MCP Bridge (stdio)**: Claude ↔ Houdini 간 JSON 프로토콜 변환 레이어
3. **도구 세트**: scene_info, create_node, modify_geometry, apply_material, run_simulation, render, export, execute_houdini_code
4. **OPUS 통합**: RapidAPI 경유 프로시저럴 에셋 라이브러리 접근
5. **설치**: uv 패키지 매니저, npx 원라인 실행

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [github.com/capoomgit/houdini-mcp](https://github.com/capoomgit/houdini-mcp) (MIT) |
| 모델 | N/A (도구 서버) |
| 데이터 | N/A |
| 라이선스 | **MIT** |
| 요구사양 | Houdini 19.5+, Python, Node.js(npx), Windows 권장 |

## 나에게 주는 시사점

3D generation research 프로젝트에 **즉시 통합 가능한 인프라**.

1. **MCP 표준 통신 레이어**: 현재 3DAgent는 Python 스크립트를 직접 Houdini에 전달하는 방식인데, HoudiniMCP는 MCP 표준으로 Claude↔Houdini 통신을 구조화. Claude Code에서 `claude mcp add-json`으로 원라인 설치 가능.
2. **execute_houdini_code**: 임의 Python 코드 실행 도구로, 3DAgent의 코드 생성→실행 파이프라인을 그대로 MCP 위에 올릴 수 있음.
3. **MIT 라이선스 + 177 stars**: 프로덕션 적용에 라이선스 제약 없음. 단, 보안(임의 코드 실행) 주의 필요.

적용 시나리오: Nemotron-Cascade-2 로컬 추론 + HoudiniMCP = **완전 로컬 3D generation research** 구현.

### 관련 볼트 노트

- 260331_NVIDIA_Nemotron_Cascade_2 — 로컬 LLM 추론 엔진 후보
- 260329_Proc3D_Procedural_3D_Generation_LLM_PCG — PCG 구조 생성, MCP 경유 Houdini 실행 가능
- 260327_LL3M_Large_Language_3D_Modelers_Blender — Blender용 유사 아키텍처 (blender-mcp 선행작)

## 원본 링크

- [GitHub](https://github.com/capoomgit/houdini-mcp)
- [Glama MCP 목록](https://glama.ai/mcp/servers/capoom/houdini-mcp)
- [Claude Code 설치 가이드](https://mcpservers.com/servers/capoom-houdini-3d/claude)
