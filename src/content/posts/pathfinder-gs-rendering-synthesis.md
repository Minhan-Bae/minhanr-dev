---
title: "PathFinder — Gaussian Splatting 실시간 렌더링의 진화"
slug: pathfinder-gs-rendering-synthesis
date: 2026-04-01
description: "OIKBAS TrinityX 파이프라인이 수집·수렴한 기술 동향 종합 리포트"
tags: [AI_R&D_Synthesis, domain/rendering, domain/gaussian-splatting, PathFinder]
status: mature
created: 2026-04-01
relevance: 5
related: [PathFinder]
source_type: synthesis
---

# PathFinder Gaussian Splatting & 렌더링 기술 종합 (2026-04 Synthesis)

> 2026년 3월 수집된 69개 growing notes에서 도출한 GS 렌더링 브레이크스루 분석. PathFinder의 실시간 렌더링 파이프라인 전략을 제시한다.

## 1. 2026년 GS 생태계 — 프로덕션 진입의 해

2026년은 Gaussian Splatting이 연구 프로토타입에서 **프로덕션 파이프라인으로 진입**하는 해다. 세 가지 산업 표준화가 동시에 진행 중이다:

1. **Khronos glTF 2.0 KHR_gaussian_splatting 확장**: GS를 웹/게임 엔진에서 표준 포맷으로 교환
2. **OpenUSD 26.03 GS 스키마**: VFX 파이프라인에서의 GS 통합 표준
3. **World Labs Spark 2.0 .RAD 포맷**: HTTP Range 스트리밍 지원하는 웹 GS 렌더러

이 세 경로가 수렴하면 "스캔 → GS 생성 → 압축/LoD → 웹/앱 스트리밍 → 실시간 렌더링"의 풀 파이프라인이 완성된다.

## 2. 핵심 브레이크스루

### 2-1. 웹 GS 렌더러: World Labs Spark 2.0

[[260331_World_Labs_Spark2_GS_Renderer|Spark 2.0]]은 Fei-Fei Li가 이끄는 World Labs ($1B 펀딩)의 오픈소스 THREE.js 기반 GS 웹 렌더러다. 핵심은 **Splat Pager** 시스템 — LRU 기반 공유 GPU 메모리 풀을 사전 할당하고, 뷰포인트 관련성에 따라 splat 청크를 동적으로 페치/에빅트한다. 수십억 개의 splat을 제한된 GPU 메모리에서 렌더링 가능하다. ExtSplats 32-byte 포맷(float32 좌표), tiny-lod/bhatt-lod 알고리즘, .RAD 파일의 HTTP Range 스트리밍으로 multi-GB 씬을 점진적으로 로드한다.

**PathFinder 적용**: DiffusionRenderer 출력을 3DGS로 변환 후 Spark로 웹 렌더링하여, 클라이언트 설치 없이 브라우저에서 결과물을 공유하는 데모 파이프라인을 즉시 구축 가능하다.

### 2-2. GS → 메쉬 추출: CoMe

[[260329_CoMe_Confidence_Based_Mesh_Extraction_3DGS|CoMe]]는 3DGS에서 view-dependent 효과(반사 등)가 풍부한 씬의 메쉬 추출을 **자기지도 신뢰도(self-supervised confidence)** 프레임워크로 해결한다. 학습 가능한 per-primitive confidence로 photometric/geometric 손실을 동적 밸런싱하고, variance loss로 spurious geometry를 제거한다. **외부 사전학습 모델 불필요**로 추론 효율이 높으며, 기존 SOTA(MILo) 대비 더 세밀한 디테일과 적은 아티팩트를 달성했다. Huawei Technologies와의 협력 연구이므로 상용화 방향성에도 주목해야 한다.

PathFinder에서 "스캔 → GS → 메쉬 → 렌더링" 풀 파이프라인 구축 시, 신뢰도 기반 접근은 "어디가 불확실한지"를 자동으로 알려주므로 사용자에게 재촬영/보강 가이드를 제공하는 UX로도 활용 가능하다.

### 2-3. 동적 4DGS: Relaxed Rigidity

[[260329_Relaxed_Rigidity_Ray_Grouping_Dynamic_4DGS|Relaxed Rigidity]]는 모노큘러 비디오에서 동적 4DGS의 모션 일관성을 **외부 프라이어(옵티컬 플로우, 2D 트랙) 없이** 개선한다. Ray-based Gaussian Clustering으로 동일 레이와 교차하는 가우시안들을 그룹으로 묶고, 완화된 강성(relaxed rigidity)으로 시간 일관성을 확보한다. 옵티컬 플로우 계산 병목을 제거할 수 있어 모바일/경량 환경에서의 동적 씬 처리에 유리하다.

### 2-4. Diffusion → GS 변환: Generative GS & GO-Renderer

[[260331_Generative_GS_video_diffusion_3D_scene|Generative Gaussian Splatting (GGS)]]은 사전학습된 비디오 디퓨전 모델에 3D 디코더만 추가하여, 백본 동결 + 증분 학습으로 포토리얼리스틱 3D 씬을 생성한다. RealEstate10K, ScanNet+에서 FID ~20% 개선. "비디오 디퓨전 모델이 이미 암묵적으로 3D 구조를 학습하고 있으며, 이를 명시적 GS로 추출만 하면 된다"는 인사이트가 핵심이다.

[[260328_GO-Renderer_Generative_Object_Rendering_3D_Video_Diffusion|GO-Renderer]]는 소수 참조 이미지에서 3D 프록시를 구축하고 비디오 디퓨전으로 임의 뷰/조명의 고품질 렌더링을 생성한다. PSNR **18.26**(기존 대비 +3.96dB), DINO Avg **0.725**로 다시점 일관성이 매우 높다. **명시적 PBR 재료 모델링이나 환경맵 추정 없이** 고품질 렌더링을 달성하여, G-Buffer 추정이 불가능한 실세계 영상에도 Diffusion Rendering을 적용할 수 있는 가능성을 열었다. PathFinder에서 두 경로(경로 A: DiffusionRenderer G-Buffer 기반, 경로 B: GO-Renderer 프록시 기반)를 상호보완적으로 통합하는 전략이 유효하다.

### 2-5. GS 압축/스트리밍: ProGS & F4Splat

[[260329_ProGS_Progressive_Coding_3DGS_45x_Compression|ProGS]]는 Octree 기반 LoD + Mutual Information Enhancement + Context-based Arithmetic Encoding으로 3DGS를 **45x 압축**하면서 시각 품질 10%+ 향상, 모든 LoD에서 실시간 FPS를 유지한다. Progressive coding으로 coarse 장면을 먼저 보여주고 대역폭에 따라 디테일을 추가하는 점진적 로딩이 가능하다. WebGPU 기반 뷰어와 조합하면 표준화된 스트리밍 3DGS가 실현된다.

[[260329_F4Splat_FeedForward_Predictive_Densification_3DGS|F4Splat]]은 feed-forward 3DGS의 균일 Gaussian 할당 문제를 **densification score 기반 적응적 할당**으로 해결한다. 재학습 없이 Gaussian 수를 런타임에 제어할 수 있어 프로덕션 환경에서 품질-속도 트레이드오프를 유연하게 조절 가능하다. Korea University 연구팀(HF 32+ upvotes)으로 관심도가 높다.

### 2-6. NVIDIA DLSS 5

[[260327_NVIDIA_DLSS5_뉴럴_렌더링_발표|DLSS 5]]는 2026년 가을 출시 예정으로, 게임 컬러 출력 + 모션 벡터를 AI가 실시간 처리하여 포토리얼 라이팅/머티리얼을 픽셀 단위로 주입한다. DLSS 4.5에서 이미 화면 24픽셀 중 23픽셀(96%)을 AI가 생성하는 수준이다. 젠슨 황은 "그래픽스의 GPT 모먼트"라고 표현했다. Streamline 프레임워크를 통한 최소 침습적 AI 삽입 패턴은 PathFinder의 렌더 파이프라인 AI 통합 설계에 직접 참고 가능하다.

## 3. 실시간 렌더링 현황 — State-of-the-Art

| 기술 | 렌더링 속도 | 품질 | 동적 씬 | 웹 지원 |
|------|-----------|------|---------|---------|
| **Spark 2.0** | 실시간 (웹) | 중상 | 미지원 | ✅ |
| **F4Splat** | 실시간 (single-pass) | 상 | 미지원 | - |
| **Relaxed Rigidity** | 실시간 | 상 | ✅ (4DGS) | - |
| **ProGS** | 실시간 (모든 LoD) | 상 | 미지원 | 스트리밍 |
| **GO-Renderer** | 비실시간 (디퓨전) | 최상 | - | - |
| **DLSS 5** | 실시간 (4K) | 최상 | ✅ | ❌ (게임 전용) |

PathFinder의 120fps 목표 달성을 위해: **실시간 미리보기**에는 Spark 2.0 + F4Splat(적응적 Gaussian 할당), **최종 렌더**에는 GO-Renderer(디퓨전 기반 고품질), **동적 씬**에는 Relaxed Rigidity(외부 프라이어 불필요)의 조합이 최적이다.

## 4. 포맷 생태계 전략

| 포맷 | 용도 | 장점 | 상태 |
|------|------|------|------|
| glTF + KHR_gaussian_splatting | 웹/게임 엔진 교환 | 산업 표준 | 확장 초안 |
| OpenUSD 26.03 GS 스키마 | VFX 파이프라인 | Houdini/Nuke 통합 | 정식 지원 |
| .RAD (Spark) | 웹 스트리밍 | HTTP Range, LoD 내장 | Preview |

PathFinder Phase 2에서 세 포맷 호환을 검토하되, **우선순위는 glTF (웹 배포) > OpenUSD (VFX 파이프라인) > .RAD (대규모 씬 스트리밍)**이다.

## 이번 달 액션

1. **Spark 2.0 Developer Preview 기반 PathFinder 데모 뷰어 프로토타입**: GitHub에서 Spark 2.0을 클론하고, 기존 테스트 GS 씬을 .RAD로 변환하여 웹 브라우저에서 렌더링하는 PoC를 구축한다. Splat Pager의 LRU 메모리 관리가 RTX 3060(6GB) ~ RTX 4090(24GB) 범위에서 어떤 성능 특성을 보이는지 프로파일링한다.

2. **GO-Renderer 경로 B 프로토타입 설계**: 기존 PathFinder DiffusionRenderer(경로 A, G-Buffer 기반) 파이프라인 옆에 GO-Renderer 방식(경로 B, 3D 프록시 기반)의 실험 분기를 추가한다. 동일 입력에 대해 두 경로의 PSNR/SSIM/추론 시간을 비교하여 "미리보기 vs 최종 렌더" 분기 기준을 설정한다.

3. **ProGS 45x 압축 + Spark 스트리밍 결합 테스트**: ProGS의 progressive coding 출력을 Spark 2.0의 .RAD 파일로 변환하는 파이프라인을 설계한다. 코드 미공개이므로 PCGS(AAAI 2026 Oral, 코드 공개)를 대안으로 먼저 실험하고, ProGS 공개 시 교체한다. 목표: 100MB 이하의 파일로 1080p 품질 씬을 5초 내에 coarse 로딩.
