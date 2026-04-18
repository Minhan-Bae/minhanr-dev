---
author: MinHanr
categories:
  - Writing
date: '2026-03-29'
summary: "Stability AI의 ReLi3D는 소수의 멀티뷰 이미지로부터 1초 미만에 geometry, PBR material, HDR 조명을 동시에 추론하는 relightable 3D 재구성 모델이다. ICLR 2026 채택, MIT 라이선스로 VFX 및 게임 파이프라인에 즉시 통합 가능하다."
draft: false
slug: 260329-reli3d-relightable-3d-reconstruction-stability-rl3d
tags:
- AI_R&D_Paper
- tech/gaussian-splatting
- tech/3d-generation
title: 'ReLi3D: Relightable Multi-view 3D Reconstruction with Disentangled Illumination'
---

# ReLi3D: Relightable Multi-view 3D Reconstruction with Disentangled Illumination

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260329-reli3d-relightable-3d-reconstruction-stability-rl3d/fig-1.jpg)
*Source: [arXiv 2603.19753 (Fig. 1)](https://arxiv.org/abs/2603.19753)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260329-reli3d-relightable-3d-reconstruction-stability-rl3d/fig-2.png)
*Source: [GitHub · Stability-AI/ReLi3D](https://github.com/Stability-AI/ReLi3D)*

**저자:** Jan-Niklas Dihlmann, Mark Boss, Simon Donne, Andreas Engelhardt, Hendrik P. A. Lensch, Varun Jampani (Stability AI)
**발표:** 2026-03-25 (arXiv: 2603.19753) | **ICLR 2026** 채택

## 문제 정의

기존 단일 이미지 기반 3D 재구성 방법은 material과 illumination의 분리(disentanglement)가 근본적으로 ill-posed. Multi-view 정보를 활용하면 이 문제를 극적으로 개선할 수 있으나, geometry + PBR material + environment lighting을 **동시에** end-to-end로 추론하는 통합 파이프라인이 없었음.

## 핵심 기술

### 1. Dual-Path Architecture
- **Geometry & Appearance Path (Blue):** 공유 cross-conditioning transformer → **Triplane Transformer**로 mesh geometry + PBR material 예측
- **Illumination Path (Green):** **Multi-View Illumination Transformer**로 HDR environment map 추정
- 두 경로를 **differentiable Monte Carlo Multiple Importance Sampling (MIS) rendering**으로 통합

### 2. Cross-Conditioning Transformer
- Multi-view 입력 이미지를 shared transformer로 융합
- 뷰 간 상호 정보를 활용하여 material-light ambiguity 해소

### 3. Mixed Domain Training Protocol
- **Synthetic PBR 데이터셋** + **Real-world RGB 캡처**를 혼합 학습
- Synthetic에서 정확한 material supervision, Real에서 일반화 성능 확보

## 정량적 결과

| 메트릭 | 수치 |
|--------|------|
| 추론 속도 | Sparse multi-view → 완전한 relightable 3D asset **< 1초** |
| 출력물 | UV-unwrapped textured mesh + PBR materials + HDR environment |
| 비교 | 최근 generative/reconstruction 파이프라인 대비 geometry, relighting, material 모두 우수 |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [github.com/Stability-AI/ReLi3D](https://github.com/Stability-AI/ReLi3D) (MIT) |
| 모델 | ✅ [HuggingFace StabilityLabs/ReLi3D](https://huggingface.co/StabilityLabs/ReLi3D) |
| 데이터 | Mixed (synthetic PBR + real RGB) — 학습 데이터셋 공개 여부 미확인 |
| 라이선스 | MIT |
| 요구사양 | 추론 < 1초 (GPU 사양 미상, Stability AI급 인프라 기준 추정) |

## 왜 중요한가

1. **최초 통합 파이프라인:** Geometry + PBR Material + HDR Illumination을 1초 미만에 동시 추론
2. **Relighting 가능:** 추출된 PBR material로 임의 조명 환경에서 re-rendering 가능 — VFX/게임 파이프라인 직접 통합
3. **Stability AI 공식 릴리스:** MIT 라이선스 + HuggingFace 모델 → 상용 활용 가능
4. **ICLR 2026 채택:** 학술적 검증 완료

## Practical Implications

our rendering research project 프로젝트에 직접적 영향. 현재 3DGS 기반 렌더링은 고정 조명 조건에서만 동작하는 한계가 있었는데, ReLi3D의 PBR material 분리 + HDR environment 추정은 **조명 변경이 필요한 VFX 워크플로우**에 핵심 모듈이 될 수 있음.

특히:
- Sparse multi-view (소수 카메라)에서 동작 → **현장 촬영 데이터로 즉시 활용 가능**
- MIT 라이선스 → 상용 프로젝트에 제약 없음
- 1초 미만 추론 → 실시간에 가까운 파이프라인 구성 가능

기존 Gaussian Splatting 파이프라인의 **material-agnostic 한계를 극복**하는 접근으로, our rendering research project에서 relightable asset 생성 모듈로 통합을 검토할 필요 있음.