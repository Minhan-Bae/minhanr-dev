---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/3d-reconstruction
- tech/photometric-stereo
source_url: https://arxiv.org/abs/2506.04115
code_url: https://github.com/RobinBruneau/RNb-NeuS2
code_available: true
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: Multi-view normal + reflectance를 radiance 기반 표면 복원에 통합하는 범용 프레임워크(RNb-NeuS2).
  DiLiGenT-MV에서 Chamfer Distance 0.167mm로 SOTA. NeuS2 프레임워크 전환으로 100배 속도 향상(5분/씬).
slug: 260413-multi-view-surface-reconstruction-normal-reflectance
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2506.04115/gradient.png
  alt: 260413-multi-view-surface-reconstruction-normal-reflectance
date: '2026-04-13'
---


# Multi-view Surface Reconstruction Using Normal and Reflectance Cues

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-multi-view-surface-reconstruction-normal-reflectance/fig-1.png)
*Source: [arXiv 2506.04115 (Fig. 1)](https://arxiv.org/abs/2506.04115)*

**저자**: Robin Bruneau, Baptiste Brument, Yvain Quéau 외
**발표**: IJCV 2025 (arXiv:2506.04115)

## 핵심 요약

기존 multi-view 표면 복원은 photometric stereo의 normal/reflectance 정보를 활용하지 못하거나 별도 파이프라인으로 처리했다. RNb-NeuS2는 **reflectance와 surface normal을 다양한 조명 하의 radiance 벡터로 재파라미터화**하여 기존 MVS/NVR 파이프라인에 원활히 통합. NeuS2 프레임워크로 전환하여 원본(RNb-NeuS) 대비 **100배 속도 향상**(15시간→5분/씬).

## 방법론

1. **Joint re-parametrization**: Reflectance + surface normal → 시뮬레이션 조명 하 radiance 벡터로 변환
2. **NeuS2 통합**: 기존 NeuS 대비 instant-NGP 기반 가속
3. **Photometric stereo 입력**: UniMS-PS, SDM-UniPS 등 기존 PS 방법의 normal/reflectance 맵 활용
4. **Sparse-view robust**: 5뷰만으로도 안정적 복원 (기존 MVS 대비 0.217mm vs 0.529-1.069mm)

## 정량 결과

### DiLiGenT-MV (5 objects)

| 방법 | Chamfer Distance↓ | Normal MAE↓ |
|------|-------------------|-------------|
| **RNb-NeuS2 (UniMS-PS)** | **0.167mm** | **5.42°** |
| SuperNormal (SDM) | 0.186mm | — |
| PS-NeRF | 0.287mm | — |
| NeuS2 | 0.331mm | — |

### 기타 데이터셋

| 데이터셋 | RNb-NeuS2 CD | GT Normals CD |
|----------|-------------|---------------|
| LUCES-MV (10 obj) | 0.362mm | 0.121mm |
| Skoltech3D (20 obj) | 1.332mm | 0.351mm |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [RobinBruneau/RNb-NeuS2](https://github.com/RobinBruneau/RNb-NeuS2) |
| 모델 | ❌ (학습 필요) |
| 라이선스 | 미명시 |
| 요구사양 | ~5분/씬 (NeuS2 기반) |

## PathFinder R&D 적용 가능성

- **Phase 1 geometry 보강**: 3DGS 복원 전 단계에서 photometric stereo normal을 활용한 고정밀 표면 복원. PathFinder의 G-buffer 품질 향상에 기여.
- **Sparse-view robustness**: 실제 촬영에서 뷰 수가 제한될 때 안정적 복원 가능.

## 한계점

1. **Skoltech3D 성능 저하**: 어려운 조명에서 PS 품질 저하 시 전체 성능 열화
2. **Lambertian 가정**: 복잡한 BRDF 미지원
3. **노이즈 입력 민감**: Normal 입력 노이즈에 성능 급감

## 관련 노트

- 260413_MAGE_Material_Aware_3D_GBuffer_Estimation_MAGE — Single-image multi-view G-buffer
- PathFinder_Master
