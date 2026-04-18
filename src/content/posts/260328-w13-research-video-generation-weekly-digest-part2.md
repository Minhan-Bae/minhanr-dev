---
title: W15 Research — Video_Generation Weekly Digest (Part 2)
status: published
slug: 260328-w13-research-video-generation-weekly-digest-part2
summary: '- S2D2: Block-diffusion language models offer a promising path toward faster-than-autoregressive
  generation by combining block-w 원문 - Text-to-image Diffusion Models in Genera: This…'
created: 2026-04-12
tags:
- AI_R&D_Paper
- Acceleration
- Attention
- Controllable
- Depth
- DiT
- Distillation
- Multimodal
- Quantization
- Segmentation
- Synthesis
- Unified_Model
- Video_Generation
- Weekly_Digest
- domain/3d
- domain/audio
- domain/diffusion
- domain/video
- domain/video-compositing
- domain/video-generation
- domain/world-model
- paper-review
- tech/DiT
- tech/GRPO
- tech/T2I
- tech/T2V
- tech/attention
- tech/diffusion
- tech/diffusion-transformer
- tech/efficiency
- tech/geometry
- tech/identity-preservation
- tech/inference-optimization
- tech/rl
- tech/slot-attention
- tech/survey
- tech/video-agent
- tech/video-editing
- tech/video-generation
- tech/world-model
- venue/ICLR2026
period: 2026-03-13 ~ 2026-04-12
consolidated_from: 15
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Video_Generation Weekly Digest (Part 2)

> 2026-03-13 ~ 2026-04-12 수집된 15건 통합.

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [S2D2: Fast Decoding for Diffusion LLMs via Training-Free Sel](https://huggingface.co/papers/2603.25702) | 03-28 |
| 2 | [Text-to-image Diffusion Models in Generative AI: A Survey](https://arxiv.org/abs/2303.07909v3) | 03-28 |
| 3 | [Text Generation with Diffusion Language Models: A Pre-traini](https://arxiv.org/abs/2212.11685v2) | 03-28 |
| 4 | [ViBe: Ultra-High-Resolution Video Synthesis Born from Pure I](https://arxiv.org/abs/2603.23326) | 03-28 |
| 5 | [daVinci-MagiHuman: Single-Stream Audio-Video Generative Foun](https://arxiv.org/abs/2603.21986) | 03-29 |
| 6 | [PackForcing: Short Video Training Suffices for Long Video Sa](https://arxiv.org/abs/2603.25730) | 03-29 |
| 7 | [[[260407_A_New_Framework_for_Evaluating_Voice_Agents_EVA|EVA](https://huggingface.co/papers/2603.22918) | 03-30 |
| 8 | [Helios: Real Real-Time Long Video Generation Model](https://arxiv.org/abs/2603.04379) | 03-31 |
| 9 | [VGGRPO: Towards World-Consistent Video Generation with 4D La](https://arxiv.org/abs/2603.26599) | 04-01 |
| 10 | [Just-in-Time (JiT): Training-Free Spatial Acceleration for D](https://arxiv.org/abs/2603.10744) | 04-02 |
| 11 | [OmniVDiff: 생성+이해 통합 Omni Controllable 비디오 확산](https://arxiv.org/abs/2504.10825) | 04-02 |
| 12 | [Slot-ID: Identity-Preserving Video Generation from Reference](https://arxiv.org/abs/2601.01352) | 04-02 |
| 13 | [TurboDiffusion: 비디오 확산 모델 100–200배 가속 프레임워크](https://arxiv.org/abs/2512.16093) | 04-02 |
| 14 | [Video Generation Models as World Models: 효율적 패러다임, 아키텍처, 알고리](https://arxiv.org/abs/2603.28489) | 04-02 |
| 15 | [GenCompositor: Generative Video Compositing with Diffusion T](https://arxiv.org/abs/2509.02460) | 04-03 |

## 요약

### 2026-03-28 (4건)

- **S2D2**: Block-diffusion language models offer a promising path toward faster-than-autoregressive generation by combining block-w [원문](https://huggingface.co/papers/2603.25702)
- **Text-to-image Diffusion Models in Genera**: This survey reviews the progress of diffusion models in generating images from text, ~\textit{i.e.} text-to-image diffus [원문](https://arxiv.org/abs/2303.07909v3)
- **Text Generation with Diffusion Language **: In this paper, we introduce a novel dIffusion language modEl pre-training framework for text generation, which we call G [원문](https://arxiv.org/abs/2212.11685v2)
- **ViBe**: **방법론**: Relay LoRA 전략으로 2단계 적응 수행 — 1단계에서 저해상도 이미지로 모달리티 갭(이미지→비디오)을 해소하고, 2단계에서 고해상도 이미지로 공간 외삽(spatial extrapolation) [원문](https://arxiv.org/abs/2603.23326)

### 2026-03-29 (2건)

- **daVinci-MagiHuman**: **저자:** SII-GAIR, Sand.ai (Ethan Chern, Hansi Teng 외 37명) [원문](https://arxiv.org/abs/2603.21986)
- **PackForcing**: **문제**: Autoregressive 비디오 디퓨전 모델은 긴 영상 생성 시 KV 캐시가 선형 증가하여 메모리 폭발, 시간적 반복(temporal repetition), 누적 에러(compounding error [원문](https://arxiv.org/abs/2603.25730)

### 2026-03-30 (1건)

- **[[260407_A_New_Framework_for_Evaluating_**: EVA(Efficient Video Agent)는 긴 동영상의 효율적인 이해를 위해 '인식 전 계획(planning-before-perception)'을 가능케 하는 강화학습 기반 프레임워크입니다. 동영상의 모든 프 [원문](https://huggingface.co/papers/2603.22918)

### 2026-03-31 (1건)

- **Helios**: Peking University, ByteDance, Canva 공동 연구팀이 발표한 14B 파라미터 오토리그레시브 디퓨전 모델. 단일 [[260407_How_Autonomous_AI_Agents_Become_Sec [원문](https://arxiv.org/abs/2603.04379)

### 2026-04-01 (1건)

- **VGGRPO**: **저자:** Zhaochong An, Orest Kupyn, Théo Uscidda, Andrea Colaco, Karan Ahuja, Serge Belongie, Mar Gonzalez-Franco, Marta  [원문](https://arxiv.org/abs/2603.26599)

### 2026-04-02 (5건)

- **Just-in-Time (JiT)**: **저자:** Wenhao Sun, Ji Li, Zhaoqiang Liu [원문](https://arxiv.org/abs/2603.10744)
- **OmniVDiff**: OmniVDiff는 China Telecom의 Tele-AI Lab에서 개발한 통합 비디오 확산 프레임워크로, 단일 확산 모델 내에서 다중 비디오 시각 콘텐츠의 **합성(생성)과 이해를 동시에** 수행한다. Dian [원문](https://arxiv.org/abs/2504.10825)
- **Slot-ID**: **저자:** Yixuan Lai, He Wang, Kun Zhou, Tianjia Shao [원문](https://arxiv.org/abs/2601.01352)
- **TurboDiffusion**: TurboDiffusion은 Tsinghua대 TSAIL Lab과 ShengShu Technology(Vidu 개발사)가 공동 개발한 비디오 확산 모델 가속 프레임워크다. 단일 GPU에서 기존 대비 100–200배  [원문](https://arxiv.org/abs/2512.16093)
- **Video Generation Models as World Models**: **저자:** Muyang He et al. [원문](https://arxiv.org/abs/2603.28489)

### 2026-04-03 (1건)

- **GenCompositor**: | 항목 | 내용 | [원문](https://arxiv.org/abs/2509.02460)

## 원본 노트

<details><summary>통합된 15건 (아카이브됨)</summary>

- 260328_S2D2_Fast_Decoding_for_Diffusion_LLMs_via_Training-Free_Self
- 260328_Text-to-image_Diffusion_Models_in_Generative_AI_A_Survey
- 260328_Text_Generation_with_Diffusion_Language_Models_A_Pre-trainin
- 260328_ViBe_Ultra_High_Resolution_Video_Synthesis
- 260329_daVinci-MagiHuman_SingleStream_AudioVideo_Generation_DVMH
- 260329_PackForcing_Long_Video_Bounded_KV_Cache
- 260330_eva_video_rl_agent
- 260331_Helios_RT_Long_Video
- 260401_VGGRPO_Latent_Geometry_GRPO_World_Consistent_Video
- 260402_JiT_Just_in_Time_TrainingFree_DiT_Acceleration_JITD
- 260402_OmniVDiff_Omni_Controllable_Video_Diffusion_OVDF
- 260402_SlotID_Identity_Preserving_Video_Reference_SLID
- 260402_TurboDiffusion_100x_Video_Diffusion_Acceleration
- 260402_VideoWorldModels_Efficient_Paradigms_Architectures_VWME
- 260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP

</details>
