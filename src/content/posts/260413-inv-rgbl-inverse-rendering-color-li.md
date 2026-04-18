---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/inverse-rendering
- tech/LiDAR
- tech/3DGS
- venue/ICCV2025
source_url: https://arxiv.org/abs/2507.17613
code_url: https://github.com/cxx226/InvRGBL
code_available: true
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: RGB+LiDAR 시퀀스에서 대규모 동적 씬의 relightable 복원. LiDAR 강도(active illumination, 별도
  스펙트럼)를 물리 기반 셰이딩 모델로 모델링하여 가시광 간섭을 극복. Relighting PSNR 30.42, 야간 시뮬레이션/동적 오브젝트 삽입
  지원.
slug: 260413-inv-rgbl-inverse-rendering-color-li
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2507.17613/gradient.png
  alt: 260413-inv-rgbl-inverse-rendering-color-li
date: '2026-04-13'
---


# InvRGB+L: Inverse Rendering of Complex Scenes with Unified Color and LiDAR Reflectance Modeling

**저자**: Chen et al.
**발표**: ICCV 2025 (arXiv:2507.17613)

## 핵심 요약

기존 inverse rendering은 RGB만 사용하고 LiDAR는 geometry 정보로만 활용했다. InvRGB+L은 **LiDAR intensity(active illumination, 별도 스펙트럼)**를 물리 기반 셰이딩 모델로 모델링하여 가변 조명 하에서도 robust한 material 추정을 달성. 대규모 도시/실내 동적 씬의 relightable 복원, 야간 시뮬레이션, 동적 오브젝트 삽입을 지원.

## 방법론

1. **Physics-based LiDAR shading model**: LiDAR intensity를 반사 모델로 모델링 (active illumination의 보완적 단서)
2. **RGB-LiDAR material consistency loss**: RGB 추정 material과 LiDAR 추정 material의 일관성 제약
3. **Dynamic Scene Graph**: 동적 오브젝트를 개별 노드로 분리하여 정적 배경과 독립 처리
4. **Night simulation**: 추정된 material + 야간 조명으로 낮 → 밤 변환

## 정량 결과

### Relighting

| 메트릭 | InvRGB+L | UrbanIR | w/o Consistency |
|--------|----------|---------|-----------------|
| PSNR↑ | **30.42** | 28.84 | 29.97 |
| SSIM↑ | **0.72** | 0.67 | 0.73 |
| LPIPS↓ | **0.30** | 0.49 | 0.34 |

### LiDAR Intensity Simulation (RMSE↓)

| 방법 | Average |
|------|---------|
| **InvRGB+L** | **0.063** |
| AlignMiF | 0.073 |
| NFL | 0.080 |
| LiDARsim | 0.120 |

### Reconstruction

| 설정 | PSNR↑ | SSIM↑ |
|------|-------|-------|
| Full | **34.76** | **0.91** |
| w/o LiDAR | 33.35 | 0.89 |
| w/o DSG | 29.13 | 0.83 |

### 야간 데이터 증강 → Object Detection

| 설정 | mAP@50↑ |
|------|---------|
| w/o augmentation | 0.236 |
| **w/ nighttime aug** | **0.321** |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [cxx226/InvRGBL](https://github.com/cxx226/InvRGBL) |
| 모델 | ❌ (씬별 최적화) |
| 라이선스 | 미명시 |
| 요구사양 | Gaussian Splatting 기반 |

## PathFinder R&D 적용 가능성

- **Autonomous driving VFX**: 도시 씬 relighting/야간 시뮬레이션은 PathFinder의 직접 범위 외이나, LiDAR-RGB 통합 역렌더링 패턴은 multi-modal 입력 처리에 참고.
- **Material consistency loss**: RGB와 보조 센서 간 일관성 제약은 범용적으로 적용 가능한 기법.

## 한계점

1. **Gaussian 기반 그림자 부정확**: Opacity 특성으로 정확한 그림자 재현 어려움
2. **야간 씬 한계**: 조명 모델이 복잡한 야간 환경에 불충분
3. **LiDAR 의존**: LiDAR 없는 환경에서는 적용 불가

## 관련 노트

- 260413_3DGS_Inverse_Rendering_Approximated_GI_3GIR — 3DGS + GI 역렌더링
- PathFinder_Master
