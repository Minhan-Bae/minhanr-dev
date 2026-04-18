---
title: W15 Research — Video_Generation Weekly Digest (Part 1)
status: published
slug: 260412-w15-research-video-generation-weekly-digest-part1
summary: '- DynVFX: 저자: Danah Yatim, Rafail Fridman, Omer Bar-Tal, Tali Dekel (Weizmann
  Institute of Science 추정) 원문 - VFXMaster: 저자: Baolu Li 외 (arXiv:2510.'
created: 2026-04-12
tags:
- 3D-understanding
- AI_R&D_Paper
- Cache_Aware
- DMD
- DiT
- Distillation
- EffectMaker
- Few_Step
- In_Context_Learning
- LoRA
- MLLM
- Project-D
- Project-V
- Real_Time
- Reference_Based
- Synthesis
- UE5-dataset
- VFX
- Video_Generation
- Weekly_Digest
- camera-control
- depth-guidance
- domain/3d
- domain/3d_consistency
- domain/4d_reconstruction
- domain/diffusion
- domain/efficiency
- domain/egocentric
- domain/hand_object
- domain/hand_object_interaction
- domain/multimodal
- domain/vfx
- domain/video
- domain/video-generation
- domain/video_generation
- domain/zero_shot
- project/Project-3D
- project/Project-C
- project/Project-V
- tech/4D-latent
- tech/DiT
- tech/HunyuanVideo
- tech/I2V
- tech/MLLM
- tech/MMDiT
- tech/OOD-correction
- tech/Pi3
- tech/T2V
- tech/attention
- tech/diffusion
- tech/embodied
- tech/foundation-model
- tech/free-form-composition
- tech/in-context-learning
- tech/keyframe-interpolation
- tech/long-video
- tech/motion-transfer
- tech/multi-view
- tech/thinking-mode
- tech/training-free
- tech/trajectory-control
- tech/v2v
- tech/video-editing
- tech/zero-shot
- video-diffusion
- video-generation
period: 2026-04-05 ~ 2026-04-12
consolidated_from: 15
date: '2026-04-12'
author: MinHanr
---

# W15 Research — Video_Generation Weekly Digest (Part 1)

> 2026-04-05 ~ 2026-04-12 수집된 15건 통합.

## 수록 노트

| # | 제목 | 출처 | 생성일 |
|---|------|------|--------|
| 1 | [DepthDirector: Beyond Inpainting for Camera-Controlled Video](https://arxiv.org/abs/2601.10214) | 04-05 |
| 2 | [FreeLOC: Free-Lunch Long Video Generation via Layer-Adaptive](https://arxiv.org/abs/2603.25209) | 04-08 |
| 3 | [ViCoDR — View-Consistent Diffusion Representations for 3D-Co](https://arxiv.org/abs/2511.18991) | 04-08 |
| 4 | [Hand2World: Autoregressive Egocentric Interaction Generation](https://arxiv.org/abs/2602.09600) | 04-08 |
| 5 | [VideoWeaver: Multimodal Multi-View Video-to-Video Transfer f](https://arxiv.org/abs/2603.25420) | 04-08 |
| 6 | [T3-Video — Transform Trained Transformer: Native 4K Video Ge](https://arxiv.org/abs/2512.13492) | 04-08 |
| 7 | [OmniWeaving: Tencent Hunyuan 통합 비디오 생성 — Free-form Compositi](https://arxiv.org/abs/2603.24458) | 04-08 |
| 8 | [Salt: 자기일관 분포매칭 + 캐시 인지 학습으로 초저 NFE 비디오 생성](https://arxiv.org/abs/2604.03118) | 04-08 |
| 9 | [ArtHOI — Articulated Human-Object Interaction Synthesis by 4](https://arxiv.org/abs/2603.04338) | 04-08 |
| 10 | [EffectMaker: 추론 + 생성 통합 — 레퍼런스 기반 커스텀 VFX 합성](https://arxiv.org/abs/2603.06014) | 04-08 |
| 11 | [DynVFX: Augmenting Real Videos with Dynamic Content](https://arxiv.org/abs/2502.03621) | 4-10" |
| 12 | [VFXMaster: Unlocking Dynamic Visual Effect Generation via In](https://arxiv.org/abs/2510.25772) | 4-10" |
| 13 | [FrameDiT: Diffusion Transformer with Frame-Level Matrix Atte](https://arxiv.org/abs/2603.09721) | 4-10" |
| 14 | [MotionAdapter: Video Motion Transfer via Content-Aware Atten](https://arxiv.org/abs/2601.01955) | 4-10" |
| 15 | [FreeTraj: Tuning-Free Trajectory Control via Noise Guided Vi](https://link.springer.com/article/10.1007/s11263-026-02732-3) | 4-10" |

## 요약

### "2026-04-10" (5건)

- **DynVFX**: **저자**: Danah Yatim, Rafail Fridman, Omer Bar-Tal, Tali Dekel (Weizmann Institute of Science 추정) [원문](https://arxiv.org/abs/2502.03621)
- **VFXMaster**: **저자**: Baolu Li 외 (arXiv:2510.25772, OpenReview: RuIPoQBbNW) [원문](https://arxiv.org/abs/2510.25772)
- **FrameDiT**: **저자**: (arXiv:2603.09721) [원문](https://arxiv.org/abs/2603.09721)
- **MotionAdapter**: **저자**: Zhexin Zhang, Yifeng Zhu, Yangyang Xu, Long Chen, Yong Du, Shengfeng He, Jun Yu 외 [원문](https://arxiv.org/abs/2601.01955)
- **FreeTraj**: **저자**: Haonan Qiu, Zhaoxi Chen, Zhouxia Wang, Yingqing He, Menghan Xia, Ziwei Liu [원문](https://link.springer.com/article/10.1007/s11263-026-02732-3)

### 2026-04-05 (1건)

- **DepthDirector**: 비디오 확산 모델(VDM)에서 카메라 궤적을 정밀하게 변경하면서 콘텐츠를 보존하는 것은 여전히 난제다. 기존 주류 접근법은 3D 표현을 타겟 궤적에 따라 워핑하지만, VDM의 3D 프라이어를 충분히 활용하지 못하고  [원문](https://arxiv.org/abs/2601.10214)

### 2026-04-08 (9건)

- **FreeLOC**: **arXiv:** 2603.25209 (v1, 2026-03) [원문](https://arxiv.org/abs/2603.25209)
- **ViCoDR**: | 항목 | 값 | [원문](https://arxiv.org/abs/2511.18991)
- **Hand2World**: Egocentric **interactive world model** 분야의 최신 작업. 단일 장면 이미지(single scene image)와 사용자의 free-space 손 제스처만 입력으로 받아, 손이 장면에  [원문](https://arxiv.org/abs/2602.09600)
- **VideoWeaver**: **arXiv:** 2603.25420 (2026-03) [원문](https://arxiv.org/abs/2603.25420)
- **T3-Video**: | 항목 | 값 | [원문](https://arxiv.org/abs/2512.13492)
- **OmniWeaving**: **arXiv:** 2603.24458 (Tencent Hunyuan, 2026-03-25 / 코드·모델 공개 2026-04-03) [원문](https://arxiv.org/abs/2603.24458)
- **Salt**: Salt는 비디오 확산 모델을 **2–4 NFE(neural function evaluation)** 수준의 극저 추론 예산으로 증류해 실시간 배포를 가능케 하는 프레임워크다. arXiv 2604.03118 (202 [원문](https://arxiv.org/abs/2604.03118)
- **ArtHOI**: | 항목 | 값 | [원문](https://arxiv.org/abs/2603.04338)
- **EffectMaker**: EffectMaker는 **MLLM 기반 추론 + DiT 기반 생성**을 통합한 레퍼런스 기반 VFX 커스터마이제이션 프레임워크다. arXiv 2603.06014 (2026-03 제출, 프로젝트 페이지 effectm [원문](https://arxiv.org/abs/2603.06014)

## 원본 노트

<details><summary>통합된 15건 (아카이브됨)</summary>

- 260405_DepthDirector_3D_Camera_Controlled_Video_Generation_DDRC
- 260408_FreeLOC_FreeLunch_Long_Video_Generation_OOD_Correction_FLOC
- 260408_ViCoDR_View_Consistent_Diffusion_3D_Video_Gen_VCDR
- 260408_Hand2World_Autoregressive_Egocentric_HOI_Gen_H2W
- 260408_VideoWeaver_MultiView_V2V_Pi3_Embodied_VWVR
- 260408_T3_Video_Transform_Trained_Transformer_4K_Acceleration_T3V
- 260408_OmniWeaving_Tencent_Hunyuan_Unified_VideoGen_MLLM_OWVG
- 260408_Salt_SC_DMD_CacheAware_Fast_Video_Generation_SALT
- 260408_ArtHOI_Articulated_HOI_4D_Reconstruction_Video_Priors_AHOI
- 260408_EffectMaker_MLLM_Reasoning_DiT_Custom_VFX_EFMK
- 260410_DynVFX_Augmenting_Real_Videos_Dynamic_Content_DNVX
- 260410_VFXMaster_InContext_VFX_Video_Generation_VFXM
- 260410_FrameDiT_Frame_Level_Matrix_Attention_FRDT
- 260410_MotionAdapter_DiT_Motion_Transfer_DINO_MADP
- 260410_FreeTraj_TuningFree_Trajectory_Control_FRTJ

</details>
