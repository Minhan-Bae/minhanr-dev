---
title: W16 3DGS & Reconstruction Research — Constrained GPU · 7D Unification · Sparse-to-Dense
status: published
slug: 260414-w16-3dgs-reconstruction-research
summary: 2026-W15~W16 3DGS/재구성 5건을 3축(Constrained-Compute · Unified Spatiotemporal
  · Sparse-to-Dense Generative)으로 합본. PathFinder/ColorDepthExpansion 2026 R&D 라인의
  직접 레퍼런스.
created: 2026-04-14
tags:
- Synthesis
- Weekly_Digest
- AI_R&D_Paper
- domain/3d
- tech/gaussian-splatting
- tech/flow-matching
- PathFinder
- ColorDepthExpansion
date: '2026-04-14'
author: MinHanr
---

# W16 3DGS & Reconstruction Research

> 5건 모두 **3DGS 기반**이지만 해결하려는 문제는 다르다. (1) 에지 GPU에서의 실시간성, (2) 시공간+시점 통합, (3) 희소 입력에서의 생성형 보강. PathFinder의 NVS / ColorDepthExpansion의 광원 시뮬과 직접 결합.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-3dgs-reconstruction-research/fig-1.jpg)
*Source: [arXiv 2604.07177 (Fig. 1)](https://arxiv.org/abs/2604.07177)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260414-w16-3dgs-reconstruction-research/fig-2.png)
*Source: [arXiv 2503.07946 (Fig. 1)](https://arxiv.org/abs/2503.07946)*

## 3축 매핑

| 축 | 정의 | 대표 |
|---|---|---|
| **A. Constrained-Compute 3DGS** | 에지/모바일 예산에서의 실시간 래스터화 | Splats Under Pressure |
| **B. Unified Spatiotemporal-Angular** | 동적 + view-dependent 통합 표현 | 7DGS |
| **C. Sparse-to-Dense Generative** | 희소 입력의 generative 완성 | Flow3r · FlowR · CloseUpShot |

## A. Constrained-Compute 3DGS

- **Splats Under Pressure** (arXiv 2604.07177) — 3DGS 실시간 래스터화가 에지 GPU에서 **어떻게 작동하는가**를 최초로 체계적 분석. GPU 코어 underclock + 전력 캡 에뮬레이션으로 단일 고성능 GPU에서 다양한 예산 시뮬.

**의미**: 지금까지 3DGS 평가는 H100 기준이었음. 본 작업이 **edge/mobile budget = 1st-class 평가 차원**으로 격상. 2026 하반기 모바일 NeRF/3DGS 제품화 흐름의 토대.

**ColorDepthExpansion 매핑**: H100×8 환경(NIPA 신청안)에서의 ChromaLift 학습 후, **에지 inference profile**을 본 논문 protocol로 측정하면 신청안의 "다단계 deployment" 항목 강화 가능.

## B. Unified Spatiotemporal-Angular Representation

- **7DGS** (arXiv 2503.07946) — 동적 장면(4DGS)과 view-dependent 효과를 **단일 7차원 Gaussian** 프레임워크로 통합. 실시간 렌더링 + 뷰 의존 효과 동시 처리.

**의미**: 종전에는 4DGS(시공간) + SH 계수(view-dependent)로 분리되어 있었음. 7DGS의 통합은 **단일 representation으로 photometric realism 달성**의 신호. PathFinder 류 NVS 파이프라인이 별도 후처리 없이 specular/glossy 렌더 가능.

## C. Sparse-to-Dense Generative (3건)

| 작업 | 입력 | 핵심 |
|---|---|---|
| **Flow3r** (2602.20157) | label-free 단안 비디오 | dense 2D correspondence(flow) → factored geometry |
| **FlowR** (2504.01647) | sparse views | flow matching으로 학습 시점 외 품질 급락 해결 |
| **CloseUpShot** (2511.13121) | sparse views + close-up cam | point-conditioned diffusion으로 fine detail hallucination 제어 |

**연결 진단**: 세 작업 모두 **3DGS의 핵심 약점인 "학습 시점 밖에서의 품질 붕괴"를 generative prior로 해결**. 차이는 prior의 위치:
- Flow3r: **2D correspondence prior** (flow)
- FlowR: **view distribution prior** (flow matching)
- CloseUpShot: **3D point conditioning prior** (diffusion)

**PathFinder 매핑**: 사용자 입력 파노라마/스파스 뷰가 일반적인 PathFinder 시나리오에서, FlowR의 sparse-to-dense 보강 + CloseUpShot의 close-up 시 fine detail = **두 단계 후처리 파이프라인**으로 직접 채택 가능.

## 합성 인사이트

1. **3DGS는 single-shot reconstruction에서 hybrid generative-reconstruction**으로 전환. 5건 중 3건이 generative prior 결합. 2026 표준은 "3DGS = 베이스 + diffusion/flow prior".
2. **Edge profile이 평가 표준에 진입**. Splats Under Pressure가 protocol 제시. 향후 SIGGRAPH/CVPR 3DGS 논문은 H100 외 jetson/모바일 측정을 default로 요구받게 될 가능성.
3. **7DGS의 통합 표현**은 4DGS·deformable GS·SH 계수를 모두 묶음. 코드 개방 시 community 빠르게 채택할 가능성.
4. **PathFinder + ColorDepthExpansion 2026 R&D 라인이 본 5건과 정확히 정렬**됨. 각 R&D 마스터에 본 합본을 reference로 추가.

## 후속 액션

- [ ] **PathFinder_Master.md**에 FlowR + CloseUpShot 2단 보강 파이프라인 인용
- [ ] **ColorDepthExpansion_Master.md**에 Splats Under Pressure protocol을 edge profile 평가 섹션 추가
- [ ] **NIPA H100×8 신청안**의 "다단계 deployment" 섹션에 본 합본 링크
- [ ] **7DGS 코드 공개 모니터링** (논문 업로드 후 reference impl 등록 시 PathFinder POC 검토)
