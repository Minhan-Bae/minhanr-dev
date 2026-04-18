---
status: published
slug: 260417-projectv-weekly-synthesis-w16
summary: 'W16 Project-V 클러스터 17건은 세 가지 메가 트렌드로 수렴한다: (1) VFX 합성(compositing·matting·relighting)
  파이프라인의 AI 네이티브 통합, (2) 분 단위 장기 비디오 생성의 실용화, (3) 멀티모달 조건 제어의 통합 프레임워크.'
created: 2026-04-17
tags:
- AI_R&D_Paper
- domain/video
- domain/vfx
- domain/compositing
- Synthesis
- Weekly
period: 2026-W16
synthesized_from:
- '[[260414_SelfForcingPP_MinuteScale_LongVideo_Generation_SFPP]]'
- '[[260414_OmniShow_HOIVG_Multimodal_Interaction_VideoGen_OMSH]]'
- '[[260413_OmniEffects_Unified_SpatiallyControllable_VFX_Generation_OMFX]]'
- '[[260413_GenCompositor_Generative_Video_Compositing_DiT_GCMP]]'
- '[[260413_RefVFX_TuningFree_Visual_Effect_Transfer_Videos_RVFX]]'
- '[[260413_OverPP_Generative_Video_Compositing_Layer_Effects_OVPP]]'
- '[[260413_FramePrompt_InContext_Controllable_Animation_FRPT]]'
- '[[260412_GSDiT_Pseudo4D_Gaussian_Video_Generation_GSDT]]'
- '[[260411_Light4D_TrainingFree_4D_Video_Relighting_L4D]]'
- '[[260411_VideoMaMa_MaskGuided_Video_Matting_Generative_Prior_VMMA]]'
- '[[260410_DiagDistill_Streaming_AR_Video_Diagonal_Distillation_DGDS]]'
- '[[260413_GenAI_Film_Creation_Survey_CVPR2025_GAFC]]'
date: '2026-04-17'
author: MinHanr
---

# Project-V 주간 수렴 리포트 — 2026-W16

> VFX 합성 파이프라인의 AI 네이티브 전환 + 장기 비디오 생성 프론티어 돌파

## 주간 핵심 시그널

W16 Project-V 클러스터 17건은 세 가지 메가 트렌드로 수렴한다: **(1) VFX 합성(compositing·matting·relighting) 파이프라인의 AI 네이티브 통합**, **(2) 분 단위 장기 비디오 생성의 실용화**, **(3) 멀티모달 조건 제어의 통합 프레임워크**. 특히 VFX 합성 축에서 6건이 동시 수렴한 것은 기존 Nuke/Fusion 기반 수동 합성 워크플로우가 AI 파이프라인으로 대체되는 변곡점 신호다.

## 수렴 분석

### 1. VFX 합성 파이프라인의 AI 네이티브 전환 (6건)

이번 주 가장 강한 수렴 축. 레이어 기반 합성, 효과 전이, 공간 제어 VFX가 동시에 연구 결과를 내놓았다:

- **Over++** (ILM 공저): 전경-배경 합성 시 그림자·반사·조명 상호작용을 학습. Masked Token Injection + ERoPE 기법으로 DiT 기반 물리적 합성 달성. ILM이 공저라는 점에서 산업 현장 적용 의도가 명확하다.
- **GenCompositor**: DiT 아키텍처로 비디오 합성 전체를 end-to-end 처리. Over++과 상호 보완적 — Over++이 레이어 효과에 집중한다면, GenCompositor는 전체 합성 파이프라인을 제어.
- **RefVFX**: 레퍼런스 비디오에서 VFX 스타일을 추출해 다른 비디오에 training-free로 전이. 기존 T2V 백본 활용으로 즉시 후반 작업에 적용 가능.
- **OmniEffects**: LoRA-MoE로 20+ VFX 효과 유형을 단일 모델에 통합. per-effect model silo를 제거하는 핵심 아키텍처.
- **VideoMaMa**: SAM2+SVD 기반 pixel-accurate alpha matting. ComfyUI + Sammie-Roto 2 생태계에 통합 완료.
- **Light4D**: Training-free 4D 비디오 relighting. IC-Light + Disentangled Flow Guidance로 ±90° 카메라 회전까지 처리.

**Project-V 시사점**: 이 6건을 조합하면 "AI 네이티브 VFX 합성 파이프라인"의 프로토타입이 가능하다. matting(VideoMaMa) → compositing(Over++/GenCompositor) → effect transfer(RefVFX/OmniEffects) → relighting(Light4D) 순서의 4-stage 파이프라인. 기존 Nuke 워크플로우 대비 인력 투입을 90%+ 절감할 잠재력.

### 2. 분 단위 장기 비디오 생성 프론티어 (3건)

- **Self-Forcing++**: Long-Horizon Teacher 없이 4분 15초(20–50× 기존) 비디오 생성. AR 방식의 self-referential guidance가 temporal consistency를 유지하면서 길이를 확장. Project-V의 기존 10초 프레임에서 분 단위로의 도약 경로.
- **DiagDistill**: Diagonal Distillation으로 streaming AR 비디오를 5초→2.61초(31 FPS)로 가속. Self-Forcing++의 추론 속도 병목을 해소하는 보완 기술.
- **GS-DiT**: Pseudo-4D Gaussian fields가 DiT를 가이드하여 카메라 포즈 무관한 콘텐츠 생성 + 100배 빠른 3D point tracking.

### 3. 멀티모달 조건 제어 통합 (2건)

- **OmniShow**: 텍스트·이미지·오디오·포즈 4채널을 Unified Channel-wise Conditioning으로 통합. Human-Object Interaction 비디오 생성에서 GLCA 립싱크까지 지원. VFX previz의 "storyboard → AI 비디오" 파이프라인에 4채널 조건 입력은 혁신적.
- **FramePrompt**: 아키텍처 변경 없이 visual sequence conditioning만으로 in-context 애니메이션 달성.

### 4. 산업 컨텍스트

- **GenAI Film Creation Survey** (CVPR 2025): character consistency, stylistic coherence, motion continuity 3대 과제 정리. Project-V가 해결해야 할 정확한 과제 목록.

## 이번 주 액션

1. **Over++ × GenCompositor 통합 PoC**: Over++의 Masked Token Injection을 GenCompositor 파이프라인에 이식하여 "물리적으로 정확한 레이어 합성" 벤치 → 10초 compositing 샘플로 Nuke 대비 품질 비교
2. **Self-Forcing++ 추론 코드 clone + DiagDistill 가속 적용**: 4분 생성 → 2분 이하로 단축 가능 여부 확인. Project-V previz 파이프라인의 핵심 백본 후보.
3. **OmniShow 4-modal 조건 중 audio+pose 먼저 통합 테스트**: previz 시나리오에서 오디오(배경음) + 포즈(캐릭터 동작) 2채널만 먼저 활성화하여 실용성 검증.

## 관련 볼트 노트

- 260413_Project3D_Weekly_Synthesis_W16 — GS-DiT가 3D↔Video 브릿지로 양쪽 synthesis에 교차 기여
- 260413_TrinityX_Weekly_Synthesis_W16 — OrgForge + ClawEval이 VFX 파이프라인 거버넌스에 적용 가능
- 260411_SammieRoto2_OSS_AI_Roto_SAM2_MatAnyone_VideoMaMa_SR2 — VideoMaMa 실무 적용 경로
- 260410_DiffHDR_Re-Exposing_LDR_Videos_Video_Diffusion_HDR — HDR 확장은 합성 파이프라인의 마지막 단계로 연결
