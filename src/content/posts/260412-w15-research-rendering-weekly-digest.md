---
title: W15 Research — Rendering Weekly Digest
status: published
slug: 260412-w15-research-rendering-weekly-digest
summary: '- GO-Renderer: 저자: Zekai Gu, Shuoxuan Feng, Yansong Wang, Hanzhuo Huang,
  Zhongshuo Du, Chengfeng Zhao, Chengwei Ren, Peng Wang, Yua 원문 - DiffusionRenderer:
  저자: Ruofan Liang, Zan Go…'
created: 2026-04-12
tags:
- 3D-avatar
- 3DGS
- 4K
- AI_R&D_Paper
- CVPR2026
- FeedForward
- G-buffer
- GaussianSplatting
- Gaussian_Splatting
- NVS
- Project-3D
- Project-R
- Project-V
- Rendering
- Research
- Synthesis
- Weekly_Digest
- acceleration
- animatable
- avatar-rendering
- dataset
- domain/3d
- domain/3dgs
- domain/4d
- domain/cloud_rendering
- domain/color-depth
- domain/diffusion
- domain/relighting
- domain/rendering
- domain/video
- domain/video-generation
- feedforward
- forward-rendering
- full-body
- game-data
- gaussian-splatting
- human-avatar
- inverse-rendering
- material-decomposition
- monocular-video
- occlusion
- open-source
- pre-training
- tech/3d-generation
- tech/EX-4D
- tech/HDR
- tech/IC-Light
- tech/diffusion
- tech/gaussian-splatting
- tech/inverse-rendering
- tech/relighting
- tech/training-free
- video-diffusion
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 10
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Rendering Weekly Digest

> 2026-04-05 ~ 2026-04-12 수집된 10건 통합.

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [AHOY! Animatable Humans under Occlusion from YouTube Videos ](https://arxiv.org/abs/2603.17975) | 04-05 |
| 2 | [Generative World Renderer](https://arxiv.org/abs/2604.02329) | 04-05 |
| 3 | [Large-scale Codec Avatars (LCA)](https://arxiv.org/abs/2604.02320) | 04-06 |
| 4 | LGTM — Less Gaussians, Texture More | 04-07 |
| 5 | [FastGS — 100초 안에 끝내는 3D Gaussian Splatting 학습 (CVPR 2026)](https://arxiv.org/abs/2511.04283) | 04-07 |
| 6 | [Streaming Real-Time Rendered Scenes as 3D Gaussians (S3DGS)](https://arxiv.org/abs/2604.02851) | 04-08 |
| 7 | [GO-Renderer: Generative Object Rendering with 3D-aware Contr](https://arxiv.org/abs/2603.23246) | 4-10" |
| 8 | [GaSLight: Gaussian Splats for Spatially-Varying Lighting in ](https://arxiv.org/abs/2504.10809) | 04-10 |
| 9 | [DiffusionRenderer: Neural Inverse and Forward Rendering with](https://arxiv.org/abs/2501.18590) | 4-10" |
| 10 | [Light4D: Training-Free Extreme Viewpoint 4D Video Relighting](https://arxiv.org/abs/2602.11769) | 04-12 |

## 요약

### "2026-04-10" (2건)

- **GO-Renderer**: **저자**: Zekai Gu, Shuoxuan Feng, Yansong Wang, Hanzhuo Huang, Zhongshuo Du, Chengfeng Zhao, Chengwei Ren, Peng Wang, Yua [원문](https://arxiv.org/abs/2603.23246)
- **DiffusionRenderer**: **저자**: Ruofan Liang*, Zan Gojcic, Huan Ling, Jacob Munkberg, Jon Hasselgren, Zhi-Hao Lin, Jun Gao, Alexander Keller, Na [원문](https://arxiv.org/abs/2501.18590)

### 2026-04-05 (2건)

- **AHOY! Animatable Humans under Occlusion **: 인터넷의 단안(monocular) 영상에서 사람의 3D 가우시안 아바타를 재구성하는 것은 가려짐(occlusion)이 심할수록 극도로 어려워진다. AHOY는 **Identity-finetuned 비디오 확산 모델** [원문](https://arxiv.org/abs/2603.17975)
- **Generative World Renderer**: 실세계 시나리오로의 생성적 역방향/순방향 렌더링 확장은 기존 합성 데이터셋의 리얼리즘과 시간적 일관성 부족에 병목되어 있었다. **Generative World Renderer**는 AAA 게임(Cyberpunk 2 [원문](https://arxiv.org/abs/2604.02329)

### 2026-04-06 (1건)

- **Large-scale Codec Avatars (LCA)**: 고품질 3D 아바타 모델링은 **충실도 vs. 일반화** 사이의 근본적 트레이드오프에 직면해 있다. 다시점 스튜디오 데이터로는 높은 충실도를 달성하지만 야생 데이터로 일반화가 어렵고, 대규모 야생 데이터로 학습하면  [원문](https://arxiv.org/abs/2604.02320)

### 2026-04-07 (2건)

- **LGTM**: 4K 해상도까지 스케일 가능한 **feed-forward 3D [[260328_3D_Gaussian_Splatting_for_Real-Time_Radiance_Field_Rendering|Gaussian Splatt
- **FastGS**: FastGS는 3D Gaussian Splatting을 표준 벤치마크에서 **약 100초** 만에 학습 완료시키는 범용 가속 프레임워크다. CVPR 2026에 채택되었으며, 깃허브 `fastgs/FastGS` 저장소 [원문](https://arxiv.org/abs/2511.04283)

### 2026-04-08 (1건)

- **Streaming Real-Time Rendered Scenes as 3**: | 항목 | 값 | [원문](https://arxiv.org/abs/2604.02851)

### 2026-04-10 (1건)

- **GaSLight**: 일반 LDR 이미지로부터 **HDR Gaussian Splats** 기반 공간 가변 조명(spatially-varying lighting)을 생성하는 최초의 방법. 디퓨전 모델로 LDR→HDR 변환 후 3DGS 피팅 [원문](https://arxiv.org/abs/2504.10809)

### 2026-04-12 (1건)

- **Light4D**: **4D relighting** — 비디오의 조명을 프레임 단위가 아니라 **3D 공간 + 시간(4D)** 위에서 일관되게 재조명하는 작업 — 은 VFX·게임·XR 컨텐츠 파이프라인에서 오랫동안 미해결 난제였다. 문 [원문](https://arxiv.org/abs/2602.11769)

## 원본 노트

<details><summary>통합된 10건 (아카이브됨)</summary>

- 260405_AHOY_Animatable_Humans_Occlusion_YouTube_GS_VideoDiffusion_AHOY
- 260405_Generative_World_Renderer_AAA_Inverse_Forward_Rendering_GWR
- 260406_LCA_LargeScale_Codec_Avatars_Pretraining_LCA
- 260407_LGTM_4K_FeedForward_Textured_Splatting
- 260407_FastGS_3DGS_Training_100sec_CVPR2026_FSGS
- 260408_Streaming_3DGS_CloudRendering_Aalto_Unity_S3DGS
- 260410_GO-Renderer_3D_Controllable_Video_Diffusion_GORR
- 260410_GaSLight_HDR_GaussianSplats_SpatiallyVarying_Lighting_GSLT
- 260410_DiffusionRenderer_Neural_Inverse_Forward_Rendering_DFRN
- 260412_Light4D_TrainingFree_4D_Video_Relighting_LT4D

</details>
