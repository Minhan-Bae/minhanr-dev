---
title: W15 Research — Inpainting Weekly Digest
status: published
slug: 260412-w15-research-inpainting-weekly-digest
summary: '- [260402MoChaEndToEndVideoCharacter: MoCha는 비디오에서 캐릭터를 통째로 교체하는 최초의 엔드투엔드
  프레임워크이다. 기존 방법들이 포즈 추정, 뎁스맵, 세그멘테이션 등 구조적 가이던스(structural guidance)를 필요로 했던 것과  [원문
  - VOID: 저자: Netflix A…'
created: 2026-04-12
tags:
- 360-degree
- 3D-editing
- 3DGS
- AI_R&D_Paper
- ComfyUI
- Inpainting
- LoRA
- NeurIPS-2024
- Project-C
- Project-R
- Synthesis
- WACV2026
- Wan22
- Weekly_Digest
- character-consistency
- character-replacement
- diffusion
- domain/inpainting
- domain/video-generation
- identity-transfer
- in-context-learning
- inpainting
- multi-object
- multi-view
- novel-view-synthesis
- open-source
- project/Project-C
- project/Project-V
- scene-editing
- slot-attention
- stable-diffusion
- tech/3d-inpainting
- tech/DiT
- tech/KV-cache
- tech/VACE
- tech/Wan2.1
- tech/autoregressive
- tech/character-replacement
- tech/counterfactual
- tech/depth-estimation
- tech/diffusion
- tech/effect-erasing
- tech/gaussian-splatting
- tech/multi-view-consistency
- tech/object-removal
- tech/physics-aware
- tech/pose-driven
- tech/real-time
- tech/reciprocal-learning
- tech/streaming
- tech/video-inpainting
- training-free
- video-editing
- video-inpainting
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 9
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Inpainting Weekly Digest

> 2026-04-05 ~ 2026-04-12 수집된 9건 통합.

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [[[260402_MoCha_EndToEnd_Video_Character_Replacement_MCHA|MoC](https://arxiv.org/abs/2601.08587) | 04-05 |
| 2 | [VOID: Video Object and Interaction Deletion](https://arxiv.org/abs/2604.02296) | 04-05 |
| 3 | [MVInpainter: Multi-View Consistent Inpainting Bridging 2D an](https://arxiv.org/abs/2408.08000) | 04-05 |
| 4 | [EffectErase: Joint Video Object Removal and Insertion for Hi](https://arxiv.org/abs/2603.19224) | 04-05 |
| 5 | [Inpaint360GS: 360° 씬 멀티오브젝트 인페인팅 via [[260328_3D_Gaussian_Sp](https://arxiv.org/abs/2511.06457) | 04-05 |
| 6 | [SplatFill: 3D Scene Inpainting via Depth-Guided [[260328_3D_](https://arxiv.org/abs/2509.07809) | 04-06 |
| 7 | [LanPaint v1.5 — "Think Mode" 학습-프리 인페인팅 샘플러 (TMLR)](https://github.com/scraed/LanPaint) | 04-07 |
| 8 | [Replace Anyone in Videos (ReplaceAnyone) — DiT/Wan2.1 호환 캐릭터](https://arxiv.org/abs/2409.19911) | 04-08 |
| 9 | [Adapting VACE for Real-Time Autoregressive Video Diffusion (](https://arxiv.org/abs/2602.14381) | 04-08 |

## 요약

### 2026-04-05 (5건)

- **[[260402_MoCha_EndToEnd_Video_Character_**: MoCha는 비디오에서 캐릭터를 통째로 교체하는 **최초의 엔드투엔드 프레임워크**이다. 기존 방법들이 포즈 추정, 뎁스맵, 세그멘테이션 등 구조적 가이던스(structural guidance)를 필요로 했던 것과  [원문](https://arxiv.org/abs/2601.08587)
- **VOID**: **저자:** Netflix AI Team [원문](https://arxiv.org/abs/2604.02296)
- **MVInpainter**: 3D 편집을 **멀티뷰 2D 인페인팅 태스크로 재정의**하는 프레임워크. 기존 3D 편집 방법들이 제한된 카테고리나 합성 에셋에 국한되고, 야생 장면에서 카메라 포즈에 과도하게 의존하는 한계를 돌파한다. [원문](https://arxiv.org/abs/2408.08000)
- **EffectErase**: **저자:** (arXiv 2603.19224) [원문](https://arxiv.org/abs/2603.19224)
- **Inpaint360GS**: Inpaint360GS는 3D Gaussian Splatting 기반의 360° 무제한 [원문](https://arxiv.org/abs/2511.06457)

### 2026-04-06 (1건)

- **SplatFill**: **저자:** Mahtab Dahaghin et al. [원문](https://arxiv.org/abs/2509.07809)

### 2026-04-07 (1건)

- **LanPaint v1.5**: LanPaint는 모델별 재학습 없이 **임의의 디퓨전 모델**에 고품질 인페인팅 능력을 부여하는 범용 샘플러로, TMLR에 등재된 연구의 공식 구현이다. 1.5.0 버전이 최근 z-image-base의 품질 버그를 [원문](https://github.com/scraed/LanPaint)

### 2026-04-08 (2건)

- **Replace Anyone in Videos (ReplaceAnyone)**: **arXiv:** 2409.19911 (v2 — 2026 업데이트로 Wan2.1/DiT 백본 지원 확장) [원문](https://arxiv.org/abs/2409.19911)
- **Adapting VACE for Real-Time Autoregressi**: **arXiv:** 2602.14381 (Daydream / Livepeer, Ryan Fosdick et al., 2026-02) [원문](https://arxiv.org/abs/2602.14381)

## 원본 노트

<details><summary>통합된 9건 (아카이브됨)</summary>

- 260405_MoCha_EndToEnd_Video_Character_Replacement_MCHA
- 260405_VOID_Video_Object_Interaction_Deletion_VOID
- 260405_MVInpainter_MultiView_Consistent_Inpainting_2D_3D_Bridge_MVIN
- 260405_EffectErase_Joint_Video_Object_Removal_Insertion_EFER
- 260405_Inpaint360GS_360_Scene_Inpainting_GS_I360
- 260406_SplatFill_DepthGuided_3D_Scene_Inpainting_GS_SPFL
- 260407_LanPaint_TrainingFree_Universal_Inpaint_Sampler_Wan22_LNPT
- 260408_ReplaceAnyone_DiT_Wan21_Pose_Driven_Char_Replace_RPLA
- 260408_VACE_RealTime_Autoregressive_Wan_Streaming_VRTA

</details>
