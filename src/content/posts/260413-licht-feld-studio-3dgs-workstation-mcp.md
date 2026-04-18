---
title: 'LichtFeld Studio — 오픈소스 3DGS 워크스테이션: 학습·편집·자동화를 단일 앱에서 (MCP + Python 플러그인)'
tags:
- AI_Daily_Trend
- domain/3d
- tech/gaussian-splatting
- tech/MCP
- open-source
- tool
source_url: https://github.com/MrNeRF/LichtFeld-Studio
source_platform:
- GitHub
status: published
created: 2026-04-13
updated: 2026-04-13
related_projects:
- Project-3D
- Project-R
slug: 260413-licht-feld-studio-3dgs-workstation-mcp
summary: '> v0.5.1 (2026-03-31) — C++23 / CUDA 12.8+ / GPLv3 — 2.8K Stars'
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-licht-feld-studio-3dgs-workstation-mcp&category=Trends
  alt: 'LichtFeld Studio — 오픈소스 3DGS 워크스테이션: 학습·편집·자동화를 단일 앱에서 (MCP + Python 플러그인)'
date: '2026-04-13'
---



# LichtFeld Studio — 오픈소스 3DGS 통합 워크스테이션

> v0.5.1 (2026-03-31) — C++23 / CUDA 12.8+ / GPLv3 — 2.8K Stars

## 핵심 내용

LichtFeld Studio는 3D Gaussian Splatting의 **학습(train) → 검사(inspect) → 편집(edit) → 자동화(automate) → 내보내기(export)** 전 과정을 단일 네이티브 앱에서 처리하는 오픈소스 워크스테이션이다. MCP 엔드포인트와 Python 플러그인 시스템을 갖춰 외부 파이프라인과의 자동화 통합이 가능하며, Project-3D(HoudiniMCP)와 연동 시 3DGS 에셋 생성 자동화 파이프라인의 핵심 컴포넌트가 될 수 있다.

## 기술 스택

| 항목 | 사양 |
|------|------|
| 언어 | C++ 60.1%, JavaScript 24.7%, Python 6.7%, CUDA 6.6% |
| C++ 표준 | C++23 |
| CUDA | 12.8+ |
| GPU 요구 | NVIDIA 전용 (최신 드라이버) |
| 라이선스 | GPLv3 |
| 최신 릴리스 | v0.5.1 (2026-03-31) |
| GitHub | 2.8K Stars, 288 Forks, 1,704 커밋 |

## 핵심 기능

### 1. 학습 (Training)
- **COLMAP 데이터셋 로딩**: 표준 SfM 파이프라인 출력 직접 투입
- **체크포인트 재개**: 학습 중단 후 이어서 진행
- **실시간 진행 모니터링**: 학습 중 실시간 시각화
- **데스크탑 + Headless**: GUI 없이 배치 학습 가능

### 2. 씬 검사 & 편집
- **실시간 인터랙티브 시각화**: 학습 중/후 즉시 확인
- **가우시안 서브셋 선택 & 변환**: Brush, Lasso, Polygon, Crop 도구
- **Undo/Redo**: 씬 수정 이력 관리
- **Bilateral Grid Appearance Modeling**: 외관 보정
- **MCMC 최적화 지원**: 고급 최적화 알고리즘 내장

### 3. 특수 기능
- **3DGUT 지원**: 왜곡 카메라 모델 대응
- **Pose Optimization**: 카메라 포즈 자동 보정
- **타임랩스 생성**: 시퀀스 기반 시각화
- **USD Import/Export** (v0.5.1): Universal Scene Description 호환

### 4. 내보내기 형식
| 형식 | 용도 |
|------|------|
| PLY | 표준 포인트 클라우드 |
| SOG | 자체 포맷 |
| SPZ | 압축 포맷 |
| USD | 산업 표준 씬 포맷 |
| HTML Viewer | 웹 공유용 스탠드얼론 뷰어 |

## MCP & 자동화

### MCP (Model Context Protocol) 통합
- **리소스 통합**: 3DGS 씬을 MCP 리소스로 노출
- **도구 자동화**: MCP 도구 호출로 학습·편집 파이프라인 제어
- **임베디드 Python 실행**: MCP 컨텍스트 내에서 Python 코드 실행
- **에이전트 자동화 호환**: AI 에이전트가 3DGS 워크플로우 직접 제어 가능

### Python 플러그인 시스템
- **커스텀 패널/오퍼레이터**: UI 확장
- **플러그인 로컬 의존성 관리**: 격리된 환경
- **배치 도구 빌드**: 대량 처리 자동화
- **개발자 가이드 & 예제 제공**

## R&D 시사점

### Project-3D 연관
LichtFeld Studio의 MCP 엔드포인트를 HoudiniMCP와 연결하면:
1. Houdini에서 SfM 데이터 전처리 → LichtFeld에서 3DGS 학습
2. 학습된 씬을 USD로 내보내기 → Houdini 씬에 재통합
3. 전 과정을 MCP 에이전트가 오케스트레이션

이 파이프라인이 성립하면 "3D 스캔 → GS 재구성 → VFX 합성"의 자동화 루프가 완성된다.

### Project-R 연관
- v0.5.1의 USD Import/Export → DiffusionRenderer 출력과 직접 연동 가능
- Bilateral Grid Appearance Modeling → G-Buffer 기반 relighting 전처리로 활용 가능

### 오픈소스 3DGS 생태계 위치
| 도구 | 역할 | 차별점 |
|------|------|--------|
| gsplat | CUDA 래스터라이저 | 최적화 엔진 |
| OpenSplat | C++ 3DGS 구현 | 포터블/경량 |
| **LichtFeld Studio** | **통합 워크스테이션** | **MCP + 플러그인 + 편집** |
| SuperSplat | 웹 기반 뷰어 | 브라우저 접근성 |

## 후원 & 지속가능성

- Core11 GmbH: Foundational Sponsor (누적 €36,500, 2026년 말까지 지원 연장)
- Volinga: 공식 후원사
- GPLv3 → 상업적 사용 시 소스 공개 의무

## 관련 링크

- 웹사이트: lichtfeld.io
- GitHub: MrNeRF/LichtFeld-Studio
- Discord 커뮤니티 운영 중

## 실용성 체크

| 항목 | 평가 |
|------|------|
| 코드 공개 | 미공개/미확인 |
| 재현 난이도 | 중간 |
| 프로덕션 적용 | 연구 단계 |
| HW 요구사항 | GPU (상세 미확인) |

## 한계점

- 코드/모델 공개 여부에 따른 재현성 제약
- 대규모 장면/고해상도 적용 시 계산 비용 검증 필요
- 실제 프로덕션 환경에서의 안정성 및 일반화 성능 미검증
