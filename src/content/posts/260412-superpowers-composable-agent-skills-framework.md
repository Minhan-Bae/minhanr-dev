---
title: Superpowers — 코딩 에이전트를 위한 조합형 스킬 프레임워크, 148K 스타 도달
tags:
- AI_Daily_Trend
- domain/agents
- open-source
- harness-engineering
- agent-skills
source_url: https://github.com/obra/superpowers
source_platform:
- GitHub
status: published
created: 2026-04-12
slug: 260412-superpowers-composable-agent-skills-framework
summary: '> Jesse Vincent / Prime Radiant (2025~) — MIT 라이선스, v5.0.7, 148,000+ GitHub
  스타'
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260412-superpowers-composable-agent-skills-framework&category=Trends
  alt: Superpowers — 코딩 에이전트를 위한 조합형 스킬 프레임워크, 148K 스타 도달
date: '2026-04-12'
---



# Superpowers — Composable Agent Skills Framework for Coding Agents

> Jesse Vincent / Prime Radiant (2025~) — MIT 라이선스, v5.0.7, 148,000+ GitHub 스타

## 핵심 요약

Superpowers는 AI 코딩 에이전트를 위한 **조합형(composable) 스킬 프레임워크**이자 소프트웨어 개발 방법론이다. 에이전트가 코드를 즉시 작성하는 대신, 구조화된 워크플로우(브레인스토밍 → 설계 검증 → 구현 계획 → 서브에이전트 실행 → 코드 리뷰 → 브랜치 완료)를 강제한다. Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot CLI 등 주요 AI 코딩 도구를 모두 지원하며, 2026-04-08 GitHub Trending Weekly에서 "Skills Ecosystem Explosion"의 핵심 프로젝트로 선정되었다.

## 4대 설계 원칙

1. **Test-Driven Development** — "Write tests first, always"
2. **Systematic over ad-hoc** — 프로세스가 추측보다 우선
3. **Complexity reduction** — 단순성이 최우선 목표
4. **Evidence over claims** — 선언 전 검증 필수

## 필수 워크플로우 시퀀스

### Phase 1: Brainstorming
- 코드 작성 전 활성화, 질문으로 아이디어 정제
- 설계 대안 탐색, 소화 가능한 섹션으로 분할 제시
- 설계 문서 자동 저장

### Phase 2: Git Worktree 격리
- 설계 승인 후 새 브랜치에 격리된 워크스페이스 생성
- 프로젝트 셋업 실행 + 클린 테스트 베이스라인 검증

### Phase 3: Implementation Plan
- 작업을 **2-5분 단위** bite-sized 태스크로 분해
- 각 태스크에 정확한 파일 경로, 완전한 코드, 검증 스텝 포함
- "열정적이지만 판단력 없는 주니어 엔지니어"도 따를 수 있는 명확성

### Phase 4: Subagent-Driven Execution
- 태스크별 새로운 서브에이전트 디스패치
- **2단계 리뷰**: (1) 스펙 준수 검증 → (2) 코드 품질 평가
- RED-GREEN-REFACTOR TDD 사이클 강제

### Phase 5: Code Review + Branch Completion
- 계획 대비 리뷰, 심각도별 이슈 분류
- Critical 이슈는 진행 차단
- 테스트 통과 확인 후 머지/PR 옵션 제시

## 조합형 스킬 라이브러리 (14개)

| 카테고리 | 스킬 | 설명 |
|----------|------|------|
| Testing | test-driven-development | RED-GREEN-REFACTOR + 안티패턴 참조 |
| Debugging | systematic-debugging | 4단계 근본 원인 분석 |
| Debugging | verification-before-completion | 수정 진위 확인 |
| Collaboration | brainstorming | 소크라테스식 설계 정제 |
| Collaboration | writing-plans | 상세 구현 계획 작성 |
| Collaboration | executing-plans | 체크포인트 포함 배치 실행 |
| Collaboration | dispatching-parallel-agents | 병행 서브에이전트 워크플로우 |
| Collaboration | requesting-code-review | 사전 리뷰 체크리스트 |
| Collaboration | receiving-code-review | 피드백 응답 절차 |
| Git | using-git-worktrees | 병렬 개발 브랜치 |
| Git | finishing-a-development-branch | 머지/PR 결정 워크플로우 |
| Execution | subagent-driven-development | 2단계 리뷰 포함 빠른 반복 |
| Meta | writing-skills | 새 스킬 작성 모범 사례 |
| Meta | using-superpowers | 스킬 시스템 소개 |

## 설치 방법

| 도구 | 명령 |
|------|------|
| Claude Code | `/plugin install superpowers@claude-plugins-official` |
| Cursor | `/add-plugin superpowers` 또는 마켓플레이스 검색 |
| Codex | Fetch & follow `.codex/INSTALL.md` |
| Gemini CLI | `gemini extensions install https://github.com/obra/superpowers` |
| GitHub Copilot CLI | `copilot plugin marketplace add obra/superpowers-marketplace` |

## R&D 시사점

### TrinityX 하네스 엔지니어링 직접 적용

1. **스킬 기반 RT 프롬프트 재구조화**: 현재 TrinityX RT 슬롯 프롬프트(slot1_collect_all, slot2_content_amplify 등)는 단일 거대 프롬프트 구조. Superpowers의 조합형 스킬 패턴을 적용하면 각 Phase를 독립 스킬로 분리 → 재사용·교체·A/B 테스트 가능. 예: `brainstorming` → `collect-brainstorm` (도메인 키워드 탐색), `executing-plans` → `collect-execute` (WebFetch + 정제).

2. **Subagent-Driven Development → RT 병렬화**: Superpowers의 서브에이전트 디스패치 + 2단계 리뷰 패턴은 TrinityX RT가 여러 도메인 수집을 병렬 서브에이전트로 분산하고, 결과를 스펙 준수 → 품질 2단계로 검증하는 구조와 정확히 매핑. 현재 순차 실행을 병렬화할 레퍼런스.

3. **Git Worktree 격리 → 볼트 브랜치 실험**: Superpowers가 브랜치 격리로 실험/프로덕션을 분리하듯, TrinityX도 실험적 수집(새 도메인 탐색)을 별도 브랜치에서 실행하고, 품질 검증 후 main에 머지하는 패턴 적용 가능.

4. **Emerging Theme 연결**: feedback_signals의 "Agent Execution Control / Governance" 21건 클러스터와 직결. Superpowers의 필수 워크플로우 시퀀스가 곧 execution-time enforcement의 실전 구현 사례.

### 한계
- Claude Code 생태계에 최적화 — 다른 에이전트 프레임워크(LangChain, CrewAI)와의 호환성 미확인
- 스킬이 개발 워크플로우에 특화 — 지식 관리/수집 워크플로우로의 확장에는 커스터마이징 필요
- 148K 스타 대비 실제 엔터프라이즈 도입 사례 부족 (커뮤니티 중심)

## 한계점 및 제약

- **생태계 락인**: 특정 프레임워크/SDK에 종속되면 전환 비용이 크며, API 변경 시 마이그레이션 부담 발생
- **프로덕션 안정성**: 대부분 v1.x 이하 초기 버전으로, 프로덕션 환경에서의 장기 안정성이 검증되지 않음
- **커뮤니티 지속성**: 오픈소스 프로젝트의 경우 메인테이너 이탈 리스크 존재
- **성능 오버헤드**: 추상화 레이어 추가로 인한 레이턴시/메모리 비용 측정 필요

## 실용성 체크

| 항목 | 평가 | 비고 |
|------|------|------|
| 즉시 적용 가능성 | 중 | PoC 수준 빠른 검증 가능 |
| TrinityX 연관성 | 높음 | 에이전트 프레임워크 선택에 직접 영향 |
| 학습 곡선 | 중 | 기존 Python/TS 경험 활용 가능 |
| 유지보수 부담 | 중~높 | 프레임워크 버전업 추적 필요 |
