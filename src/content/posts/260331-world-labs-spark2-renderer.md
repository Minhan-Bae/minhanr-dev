---
tags:
- AI_Daily_Trend
- domain/rendering
- domain/3d
- tech/gaussian-splatting
- tech/3d-generation
source_url: https://sparkjs.dev/2.0.0-preview/docs/new-features-2.0/
code_url: https://github.com/sparkjsdev/spark
code_available: true
model_available: false
license: unknown
status: published
created: 2026-03-31
slug: 260331-world-labs-spark2-renderer
summary: Fei-Fei Li가 이끄는 World Labs가 Spark 2.0 Developer Preview를 공개했다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260331-world-labs-spark2-renderer/cover.png
  alt: 260331 World Labs Spark2 GS Renderer
date: '2026-03-31'
categories:
  - VFX
---

# World Labs Spark 2.0 — 오픈소스 3DGS 웹 렌더러 메이저 업데이트

## 개요

Fei-Fei Li가 이끄는 World Labs가 Spark 2.0 Developer Preview를 공개했다. Spark는 THREE.js와 통합되는 고성능 Gaussian Splatting 웹 렌더러로, 2.0은 수억~수십억 개의 splat을 가진 거대 3D 씬을 동적으로 렌더링할 수 있도록 렌더러를 완전히 재작성한 메이저 업데이트다. World Labs는 $1B 펀드레이징을 완료하고 공간 지능(Spatial Intelligence) 분야를 선도하며, Marble이라는 멀티모달 World Model도 함께 개발 중이다.

## 핵심 수치/벤치마크

| 항목 | 수치 |
|------|------|
| World Labs 펀딩 | $1B (2026년 2월) |
| Spark 버전 | 2.0 Developer Preview |
| 지원 splat 수 | 수억~수십억 개 (GPU 메모리 제한 내 동적 로딩) |
| splat 포맷 | ExtSplats 32-byte (float32 좌표, 기존 16-byte 대비 고정밀) |
| LoD 알고리즘 | tiny-lod (온디맨드), bhatt-lod (프리프로세싱) |
| 파일 포맷 | .RAD (RADiance field) — HTTP Range 스트리밍 지원 |

## 아키텍처/방법론

Spark 2.0의 핵심은 **Splat Pager** 시스템이다. LRU 기반 공유 GPU 메모리 풀을 사전 할당하고, 뷰포인트 관련성에 따라 splat 청크를 동적으로 페치/에빅트한다. 이를 통해 제한된 GPU 메모리에서도 수십억 개의 splat을 렌더링할 수 있다. .RAD 파일 포맷은 프리컴퓨팅된 LoD splat 트리를 저장하며, HTTP Range 요청으로 임의 청크 스트리밍이 가능해 multi-GB 파일을 전부 다운로드하지 않아도 즉시 coarse 렌더링 후 점진적 리파인이 가능하다. SparkPortals 실험 기능으로 비연속 공간 간 포탈 렌더링도 지원한다.

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ github.com/sparkjsdev/spark (오픈소스) |
| 모델 | ❌ 렌더러이므로 해당 없음 |
| 데이터 | ✅ .RAD 포맷 공개 |
| 라이선스 | 미명시 (GitHub 확인 필요) |
| 요구사양 | WebGL 지원 브라우저, GPU 메모리에 따라 스케일 |

## 나에게 주는 시사점

### real-time VFX rendering pipeline 직접 적용 — 웹 기반 3DGS 뷰어 레퍼런스 아키텍처

Spark 2.0의 **Splat Pager** 시스템은 PathFinder가 목표로 하는 120fps 실시간 렌더링의 핵심 레퍼런스다.
LRU 기반 GPU 메모리 풀 관리 + 뷰포인트 기반 동적 페칭은 PathFinder의 DiffusionRenderer 출력을
웹 브라우저에서 인터랙티브하게 보여주는 데모 파이프라인에 바로 적용 가능하다.

**구체적 적용 시나리오:**
1. **real-time VFX rendering pipeline 데모 뷰어**: DiffusionRenderer로 생성한 AOV/G-Buffer를 3DGS로 변환 후 Spark로 웹 렌더링 → 클라이언트 배포 없이 브라우저에서 결과물 공유
2. **3D generation research Houdini 프리뷰**: Houdini에서 생성한 프로시저럴 3D 씬을 .RAD 포맷으로 익스포트, Spark로 실시간 웹 프리뷰 제공 → 비개발자 아티스트가 LLM 생성 결과를 즉시 확인

### .RAD 포맷의 전략적 가치

.RAD 파일 포맷의 HTTP Range 스트리밍은 multi-GB 3DGS 씬을 점진적으로 로드하는 산업 표준 후보다.
glTF 2.0의 KHR_gaussian_splatting 확장 + OpenUSD 26.03 스키마와 함께,
VFX 파이프라인의 3DGS 통합이 2026년 하반기에 실질적으로 가능해진다.
real-time VFX rendering pipeline Phase 2에서 이 세 포맷(.RAD, glTF+KHR, OpenUSD) 호환을 검토해야 한다.

### World Model 생태계와의 교차점

World Labs는 Marble(멀티모달 World Model)과 Spark(3DGS 렌더러)를 동시 개발 중이다.
AMI Labs의 JEPA + World Labs의 Spatial Intelligence가 3DGS 렌더링과 결합하면,
"월드 모델이 예측한 미래 상태를 실시간 3DGS로 렌더링"하는 파이프라인이 형성된다.
이는 real-time VFX rendering pipeline(렌더링) + 3D generation research(씬 이해) 양쪽 모두에 장기적 영향.

### 관련 볼트 노트

- 260328_GaussianSplatting_IndustryStandard_glTF_OpenUSD — glTF/OpenUSD 3DGS 표준화, .RAD와의 포맷 생태계 비교 필요
- 260329_F4Splat_FeedForward_Predictive_Densification_3DGS — Splat budget 제어 기법, Spark의 Pager 시스템과 상보적
- 260329_GSMem_3DGS_Persistent_Spatial_Memory_Embodied_Agent_GSMM — 3DGS를 에이전트 메모리로 활용, Spark 뷰어와 결합 가능
- real-time VFX rendering pipeline — 120fps 목표의 웹 데모 레이어로 Spark 2.0 검토
- 3D generation research — Houdini 프로시저럴 씬의 웹 프리뷰 도구로 Spark 활용

## 원본 링크

- [Spark 2.0 공식 문서](https://sparkjs.dev/2.0.0-preview/docs/new-features-2.0/)
- [GitHub](https://github.com/sparkjsdev/spark)
- [World Labs 블로그](https://www.worldlabs.ai/blog)
- [Radiance Fields 커버리지](https://radiancefields.com/world-labs-previews-spark-2.0)
