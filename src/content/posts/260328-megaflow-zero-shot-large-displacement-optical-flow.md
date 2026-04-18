---
author: MinHanr
categories:
  - Writing
date: '2026-03-28'
draft: false
slug: 260328-megaflow-zero-shot-large-displacement-optical-flow
summary: Zero-shot 대변위 optical flow. our rendering research project VFX 모션벡터 추출, our video generation project 프레임간 대응점 매칭에
  활용 가능. 범용 적용성이 핵심 강점.
tags:
- AI_R&D_Paper
title: 'MegaFlow: Zero-Shot Large Displacement Optical Flow'
---

# MegaFlow: Zero-Shot Large Displacement Optical Flow

> **arXiv**: 2603.25739v1 | **Published**: 2026-03-26
> **Authors**: Dingxi Zhang, Fangjinhua Wang, Marc Pollefeys, Haofei Xu

## 핵심 내용

**방법론**: 대변위(large displacement) optical flow 추정은 기존 방법들이 반복적 로컬 검색(iterative local search)이나 도메인 특화 파인튜닝에 의존하여, 대변위 상황과 zero-shot 일반화에서 성능이 제한되는 근본적 한계가 있었다. MegaFlow는 복잡한 태스크 특화 아키텍처 대신, 강력한 사전학습된 비전 모델(vision foundation model)을 optical flow 추정에 적응시키는 접근을 취한다. 글로벌 매칭 기반의 coarse-to-fine 전략으로 대변위에서도 정확한 대응점을 찾으며, 도메인 특화 학습 없이 다양한 시나리오에서 범용적으로 적용 가능하다.

**핵심 기여**:
- Zero-shot 설정에서 대변위 optical flow를 정확하게 추정하는 최초의 범용 모델
- 사전학습된 비전 파운데이션 모델의 풍부한 표현력을 optical flow 도메인에 효과적으로 전이
- 기존 RAFT, FlowFormer 등 반복 최적화 기반 방법 대비 대변위 시나리오에서 유의미한 성능 향상

## 시사점

Zero-shot 대변위 optical flow는 VFX 산업에서 특히 빠른 카메라 이동, 급격한 장면 전환, 폭발 등 대변위 시나리오에서 모션 벡터 추출의 신뢰도를 크게 향상시킨다. 기존 방법들이 실패하는 100+ 픽셀 이상의 대변위에서도 안정적 추정이 가능하다는 점은 프로덕션 파이프라인의 자동화 수준을 한 단계 끌어올린다.

## 출처

| 플랫폼 | 링크 |
|--------|------|
| arXiv | [2603.25739v1](https://arxiv.org/abs/2603.25739v1) |
| PDF | [다운로드](https://arxiv.org/pdf/2603.25739v1) |

---
## Related Notes
- our rendering research project
- our video generation project