---
title: W15 Research — Video_Generation Weekly Digest (Part 2)
status: published
slug: 260412-w15-research-video-generation-weekly-digest-part2
summary: '- LUVE: 비디오 디퓨전 모델의 시각 품질은 지난 2년간 극적으로 올라갔지만, ultra-high-resolution(UHR)
  영역은 여전히 열려 있는 문제다. 단일 모델로 UHR 비디오를 end-to-end 생성하려 하면 ( 원문 - SCAIL: 최근 2~3년간 character
  image animation은 dif…'
created: 2026-04-12
tags:
- AI_R&D_Paper
- Synthesis
- Weekly_Digest
- domain/3d
- domain/vfx
- domain/video
- domain/video-generation
- tech/DiT
- tech/LoRA
- tech/T2V
- tech/VFX-transfer
- tech/attention-manipulation
- tech/character-animation
- tech/consistency
- tech/in-context-learning
- tech/intrinsic-rendering
- tech/training-free
- tech/video-editing
- venue/CVPR2026
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 5
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Video_Generation Weekly Digest (Part 2)

> 2026-04-05 ~ 2026-04-12 수집된 5건 통합.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-video-generation-weekly-digest-part2/fig-1.png)
*Source: [arXiv 2512.05905 (Fig. 1)](https://arxiv.org/abs/2512.05905)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260412-w15-research-video-generation-weekly-digest-part2/fig-2.png)
*Source: [arXiv 2601.07833 (Fig. 1)](https://arxiv.org/abs/2601.07833)*

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [LUVE: Latent-Cascaded Ultra-High-Resolution Video Generation](https://hf.co/papers/2602.11564) | 04-11 |
| 2 | [SCAIL: Towards Studio-Grade Character Animation via In-Conte](https://arxiv.org/abs/2512.05905) | 04-11 |
| 3 | [RefVFX: Tuning-free Visual Effect Transfer across Videos](https://arxiv.org/abs/2601.07833) | 04-11 |
| 4 | [BachVid: Training-Free Video Generation with Consistent Back](https://arxiv.org/abs/2510.21696) | 04-12 |
| 5 | [V-RGBX: Video Editing with Accurate Controls over Intrinsic ](https://arxiv.org/abs/2512.11799) | 04-12 |

## 요약

### 2026-04-11 (3건)

- **LUVE**: 비디오 디퓨전 모델의 시각 품질은 지난 2년간 극적으로 올라갔지만, ultra-high-resolution(UHR) 영역은 여전히 열려 있는 문제다. 단일 모델로 UHR 비디오를 end-to-end 생성하려 하면 ( [원문](https://hf.co/papers/2602.11564)
- **SCAIL**: 최근 2~3년간 character image animation은 diffusion 모델과 pose 제어 모듈의 결합으로 빠르게 발전했지만, **스튜디오 레벨(production-level) 품질**에 도달하려면 (1 [원문](https://arxiv.org/abs/2512.05905)
- **RefVFX**: 비디오 편집·VFX 파이프라인에서 가장 어려운 영역은 **프롬프트로 기술하기 힘든 동적 시간 효과**다. 예컨대 "주변 조명이 점점 푸르게 변하면서 카메라 그림자가 길어진다", "캐릭터가 모래로 부스러지면서 바람에  [원문](https://arxiv.org/abs/2601.07833)

### 2026-04-12 (2건)

- **BachVid**: **"같은 캐릭터가, 같은 배경에서, 다른 액션을 하는 연속 샷"** — 이는 광고·숏폼·웹드라마·AI 영화 어디에서나 필요한 기본 요구인데, 현재 text-to-video 모델 대부분은 이 "identity 유지" [원문](https://arxiv.org/abs/2510.21696)
- **V-RGBX**: 현대 VFX 후반작업에서 가장 비용이 큰 작업 중 하나는 **"촬영된 푸티지의 조명·재질·표면을 프레임 간 일관성 있게 재편집하는 것"** 이다. 지금까지의 대규모 video diffusion은 appearance  [원문](https://arxiv.org/abs/2512.11799)

## 원본 노트

<details><summary>통합된 5건 (아카이브됨)</summary>

- 260411_LUVE_LatentCascaded_UHR_Video_DualFreq_Experts_LUVE
- 260411_SCAIL_StudioGrade_Character_Animation_InContext_3D_Pose_SCAL
- 260411_RefVFX_TuningFree_VisualEffect_Transfer_Reference_Video_RVFX
- 260412_BachVid_TrainingFree_Consistent_TextToVideo_DiT_BCHV
- 260412_V-RGBX_Intrinsic_Aware_Video_Editing_Keyframe_VRBX

</details>
