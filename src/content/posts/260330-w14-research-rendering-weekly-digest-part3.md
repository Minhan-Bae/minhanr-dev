---
title: W15 Research — Rendering Weekly Digest (Part 3)
status: published
slug: 260330-w14-research-rendering-weekly-digest-part3
summary: '- GenMask: GenMask는 Diffusion Transformer(DiT)를 세그먼테이션 작업에 직접 활용하는 혁신적인
  프레임워크입니다. 기존 방식이 생성 모델을 단순히 특징 추출기(feature extractor)로 사용했던 원문 - I2P: 저자: Yeqi He
  외 7명 원문 - VideoMatGen: 저자:…'
created: 2026-04-12
tags:
- 3DGS
- AI_R&D_Paper
- BRDF
- Bayesian
- Environment_Map
- Gaussian_Splatting
- Inverse_Rendering
- Outdoor
- PBR
- Project-R
- Relighting
- Rendering
- Synthesis
- Weekly_Digest
- domain/3d
- domain/image-processing
- domain/rendering
- gaussian-splatting
- novel-view-synthesis
- rendering
- tech/3DGS
- tech/3d-generation
- tech/4d-generation
- tech/4d-reconstruction
- tech/ICLR
- tech/T2I
- tech/T2V
- tech/dit
- tech/dynamical-system
- tech/gaussian-splatting
- tech/inpainting
- tech/instance-segmentation
- tech/mobile
- tech/real-time
- tech/segmentation
- tech/video-diffusion
- uncertainty-estimation
period: 2026-03-13 ~ 2026-04-12
consolidated_from: 9
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Rendering Weekly Digest (Part 3)

> 2026-03-13 ~ 2026-04-12 수집된 9건 통합.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260330-w14-research-rendering-weekly-digest-part3/fig-1.png)
*Source: [arXiv 2603.22965 (Fig. 1)](https://arxiv.org/abs/2603.22965)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260330-w14-research-rendering-weekly-digest-part3/fig-2.png)
*Source: [arXiv 2603.16566 (Fig. 1)](https://arxiv.org/abs/2603.16566)*

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [GenMask: Adapting DiT for Segmentation via Direct Mask](https://huggingface.co/papers/2603.23906) | 03-30 |
| 2 | [I2P: Few-Shot Generative Model Adaption via Identity Injecti](https://arxiv.org/abs/2603.22965) | 03-30 |
| 3 | [VideoMatGen: PBR Materials through Joint Generative Modeling](https://arxiv.org/abs/2603.16566) | 03-30 |
| 4 | [Generative [[260328_3D_Gaussian_Splatting_for_Real-Time_Radi](https://arxiv.org/abs/2503.13272) | 03-31 |
| 5 | [EvoGS: 4D [[260328_3D_Gaussian_Splatting_for_Real-Time_Radia](https://arxiv.org/abs/2512.19648) | 04-01 |
| 6 | [Diff4Splat: Controllable 4D Scene Generation with Latent Dyn](https://arxiv.org/abs/2511.00503) | 04-02 |
| 7 | [Mobile-GS: Real-time [[260328_3D_Gaussian_Splatting_for_Real](https://arxiv.org/abs/2603.11531) | 04-02 |
| 8 | [R3GW: 야외 비정형 환경의 Relightable 3D [[260328_3D_Gaussian_Splatti](https://arxiv.org/abs/2603.02801) | 04-02 |
| 9 | [Predictive Photometric Uncertainty in [[260328_3D_Gaussian_S](https://arxiv.org/abs/2603.22786) | 04-04 |

## 요약

### 2026-03-30 (3건)

- **GenMask**: GenMask는 Diffusion Transformer(DiT)를 세그먼테이션 작업에 직접 활용하는 혁신적인 프레임워크입니다. 기존 방식이 생성 모델을 단순히 특징 추출기(feature extractor)로 사용했던 [원문](https://huggingface.co/papers/2603.23906)
- **I2P**: **저자:** Yeqi He 외 7명 [원문](https://arxiv.org/abs/2603.22965)
- **VideoMatGen**: **저자:** Jon Hasselgren, Zheng Zeng, Miloš Hašan, Jacob Munkberg ([[260407_How_Autonomous_AI_Agents_Become_Secure_by_Desi [원문](https://arxiv.org/abs/2603.16566)

### 2026-03-31 (1건)

- **Generative Gaussian Splatting(GGS)은 사전 학습된 잠재 비디 [원문](https://arxiv.org/abs/2503.13272)

### 2026-04-01 (1건)

- **EvoGS**: **저자:** Arnold Caleb et al. (2025-12-22) [원문](https://arxiv.org/abs/2512.19648)

### 2026-04-02 (3건)

- **Diff4Splat**: **저자:** Panwang Pan*, Chenguo Lin* (equal contribution), Jingjing Zhao, Chenxin Li, Yuchen Lin, Haopeng Li, Honglei Yan, [원문](https://arxiv.org/abs/2511.00503)
- **Mobile-GS**: **저자:** Xiaobiao Du, Yida Wang, Kun Zhan, Xin Yu [원문](https://arxiv.org/abs/2603.11531)
- **R3GW**: R3GW(Relightable 3D Gaussians for Outdoor Scenes in the Wild)는 야외에서 비정형 조건(변화하는 조명, 다양한 날씨)으로 촬영된 장면의 Relightable [[2603 [원문](https://arxiv.org/abs/2603.02801)

### 2026-04-04 (1건)

- **Predictive Photometric Uncertainty in Gaussian Splatting([[260328_3D_Gaussian_Splat [원문](https://arxiv.org/abs/2603.22786)

## 원본 노트

<details><summary>통합된 9건 (아카이브됨)</summary>

- 260330_genmask_dit_segmentation
- 260330_I2P_Identity_Injection_Preservation_FewShot_I2P
- 260330_VideoMatGen_PBR_Materials_Video_Diffusion_VMTG
- 260331_Generative_GS_video_diffusion_3D_scene
- 260401_EvoGS_4D_GS_Dynamical_System
- 260402_Diff4Splat_Controllable_4D_Scene_Generation_D4SP
- 260402_MobileGS_Realtime_Gaussian_Splatting_Mobile_MBGS
- 260402_R3GW_Relightable_3DGS_Outdoor_Wild_PBR_R3GW
- 260404_PPU_Predictive_Photometric_Uncertainty_3DGS_NVS_PPU

</details>
