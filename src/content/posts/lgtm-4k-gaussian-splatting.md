---
title: "4K 실시간 렌더링의 돌파구 — LGTM: 기하-텍스처 분리로 Gaussian Splatting의 해상도 한계를 넘다"
date: 2026-03-28
draft: false
author: MinHanr
tags: ["gaussian-splatting", "3d-rendering", "real-time", "paper-review", "4K"]
categories: ["Research"]
summary: "Feed-Forward 3D Gaussian Splatting의 해상도 스케일링 한계를 돌파한 LGTM. 컴팩트 기하 프리미티브 + per-primitive 텍스처 분리로 4K에서도 프리미티브 수가 일정한 혁신적 접근을 분석합니다."
description: "LGTM(Less Gaussians, Texture More)은 기존 피셀 정렬 3DGS의 2차 스케일링 문제를 해결하여, 단일 포워드 패스에서 4K 해상도 렌더링을 가능하게 합니다. 실시간 VFX 파이프라인에 미치는 영향을 분석합니다."
keywords: ["LGTM", "Gaussian Splatting", "3DGS", "4K rendering", "real-time rendering", "feed-forward", "neural rendering", "VFX"]
---
![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/lgtm-4k-gaussian-splatting/fig-1.png)
*Source: [arXiv 2603.25745 (Fig. 1)](https://arxiv.org/abs/2603.25745)*


3D Gaussian Splatting(3DGS)이 NeRF를 대체하며 실시간 렌더링의 새 표준으로 자리잡고 있습니다. 그러나 한 가지 근본적 한계가 있었습니다: **해상도가 올라가면 프리미티브 수가 2차적으로 폭증**하여, 4K 해상도에서의 실시간 합성은 사실상 불가능했습니다.

LGTM(Less Gaussians, Texture More)은 이 문제를 **기하-텍스처 분리**라는 우아한 접근으로 해결합니다.

## 문제: 왜 기존 Feed-Forward 3DGS는 4K에서 실패하는가

기존 Feed-Forward 3DGS 방법들은 **픽셀 정렬 프리미티브**를 예측합니다. 각 입력 픽셀에 대응하는 Gaussian 프리미티브를 생성하므로:

- 1080p (1920×1080) → ~200만 프리미티브
- 4K (3840×2160) → ~800만 프리미티브 (**4배**)

프리미티브 수가 해상도의 제곱에 비례하여 증가합니다. GPU 메모리와 연산량이 폭발적으로 늘어나, 4K 실시간 렌더링은 현재 하드웨어로는 비현실적입니다.

## LGTM의 해법: 기하와 텍스처의 분리

LGTM의 핵심 아이디어는 단순하지만 강력합니다:

**기하학적 구조**(위치, 크기, 방향)는 **소수의 컴팩트 Gaussian**으로, **시각적 디테일**(색상, 패턴, 질감)은 **각 프리미티브에 부착된 텍스처 맵**으로 분리합니다.

```
기존: 해상도 ↑ → 프리미티브 수 ↑↑ → 연산 폭발
LGTM: 해상도 ↑ → 프리미티브 수 동일, 텍스처 해상도만 ↑ → 연산 안정
```

이 분리의 결과:
- 4K에서도 프리미티브 수가 **해상도와 무관하게 일정**
- 단일 포워드 패스(최적화 루프 없이) 추론
- 카메라 포즈 정보 불필요 (Pose-Free)

## BBSplat에서 LGTM으로

LGTM은 BBSplat(Billboard Splatting)의 아이디어를 확장합니다. BBSplat는 2D Gaussian 위에 텍스처를 인쇄하는 방식으로 프리미티브 수를 줄였지만, **장면별 최적화가 필요**했습니다.

| 방법 | 텍스처 Gaussian | 최적화 | 실시간 |
|------|----------------|--------|--------|
| BBSplat | 있음 | 장면별 필요 | 제한적 |
| **LGTM** | **있음** | **불필요** | **가능** |

Feed-Forward로 전환함으로써, 추론 시간이 장면 복잡도에 관계없이 일정해집니다.

## 기술 맥락에서의 위치

| 기술 | 접근 방식 | 해상도 스케일링 | 실시간 |
|------|----------|----------------|--------|
| NeRF | 암묵적 + 볼륨 렌더링 | N/A | 불가 |
| 3DGS (원본) | 장면별 최적화 | 최적화로 조절 | 제한적 |
| Feed-Forward 3DGS | 픽셀 정렬 | **2차 증가** | 1080p까지 |
| **LGTM** | **기하-텍스처 분리** | **해상도 독립** | **4K 가능** |

## VFX 파이프라인에서의 의미

LGTM이 VFX 현장에 미치는 영향은 직접적입니다:

1. **실시간 4K 프리뷰**: 촬영 현장에서 3D 에셋의 4K 프리뷰를 최적화 없이 즉시 확인
2. **NLE 통합**: Feed-Forward 특성 덕분에 비선형 편집기에 Gaussian 렌더링 플러그인으로 통합 가능
3. **에셋 프로덕션 가속**: 스캔 → 즉시 4K 렌더링 가능한 Gaussian 에셋 생성

## 한계점

- 텍스처 맵 해상도 자체의 상한이 최종 품질을 결정
- 동적 장면(비디오)으로의 확장은 미검증
- 프리프린트 단계로 정량적 벤치마크 공개 대기 중

2026년, Gaussian Splatting은 "연구 데모"에서 "프로덕션 도구"로 전환되고 있습니다. LGTM은 그 전환의 핵심 퍼즐 조각 — 4K 실시간 렌더링 — 을 채웁니다.

---

*이 글은 personal knowledge system 볼트의 연구 노트를 기반으로 작성되었습니다.*

Sources:
- [arXiv: 2603.25745v1](https://arxiv.org/abs/2603.25745v1)
- [OpenReview: RExGGPD5tw](https://openreview.net/forum?id=RExGGPD5tw)
