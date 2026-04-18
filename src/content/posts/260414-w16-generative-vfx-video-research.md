---
title: W16 Generative VFX & Video Research — Compositing · Physics · Long-Horizon
  Generation
status: published
slug: 260414-w16-generative-vfx-video-research
summary: 2026-W15~W16 비디오/VFX 9건을 3축(Generative Compositing · Physics-Grounded I2V
  · Long-Horizon Autoregressive)으로 합본. CharacterShift/Project-V·D·R 파이프라인과 직접 매칭.
created: 2026-04-14
tags:
- Synthesis
- Weekly_Digest
- AI_R&D_Paper
- domain/video-generation
- domain/vfx
- tech/video-diffusion
- tech/DiT
- Project-V
- Project-D
- Project-R
- CharacterShift
date: '2026-04-14'
author: MinHanr
---

# W16 Generative VFX & Video Research

> 비디오 생성/합성 9건. 단순 T2V를 넘어서 **(1) 합성(compositing)이 일급 객체화**, **(2) 물리 시뮬을 diffusion이 흡수**, **(3) 장기 영상의 품질 붕괴 해결**이라는 세 축이 W16에 동시 출현.

## 3축 매핑

| 축 | 정의 | 대표 |
|---|---|---|
| **A. Generative Compositing** | 합성 자체를 생성 모델로 자동화 | GenCompositor · OverPP · RefVFX · OmniEffects |
| **B. Physics-Grounded I2V/V2V** | Navier-Stokes·MPM 등 시뮬 → 비디오 컨트롤 | PhysCtrl · ImplicitFluid · GSDiT |
| **C. Controllable / Long-Horizon Gen** | 캐릭터 모션·분 단위 길이 제어 | FramePrompt · Self-Forcing++ |

## A. Generative Compositing (4건)

| 작업 | 기관 | 핵심 |
|---|---|---|
| **GenCompositor** (2509.02460) | DiT pipeline | 전경 오브젝트 ↔ 배경 비디오 자동 합성, 아이덴티티 보존 |
| **OverPP** (2512.19661) | UNC + UMD + **ILM** | 프로페셔널 VFX 워크플로우 layer compositing 직접 채택 |
| **RefVFX** (2601.07833) | CMU + Snap | tuning-free 비디오↔비디오 효과 전이 (LoRA 없이 feedforward) |
| **OmniEffects** (2508.07981) | LoRA + MoE | 불·연기·비·눈 등 통합 + 공간 제어 |

**핵심 진단**: ILM(Industrial Light & Magic)이 OverPP에 공저자로 참여한 게 결정적. **현업 VFX 파이프라인이 생성 모델을 layer compositor로 받아들이기 시작**. RefVFX의 tuning-free 접근은 프로덕션 한 컷당 비용을 LoRA 학습 시간에서 추론 시간으로 압축.

**CharacterShift 매핑**: GenCompositor + OverPP는 캐릭터 합성에서 ID 보존과 layer 분리를 동시에 다룸 → CharacterShift v2의 reference layer 분리 설계에 직접 인용.

## B. Physics-Grounded Video Generation (3건)

- **PhysCtrl** (2509.20358) — Young's Modulus·외력 등 명시적 물리 파라미터로 조건된 diffusion이 3D 파티클 궤적을 생성 → I2V 모델 구동. **elastic/sand/plasticine/rigid 4종 550K 애니메이션** 학습.
- **ImplicitFluidPhysics** (2508.08254, ICCV 2025) — 단일 스틸 → Navier-Stokes 기반 4D 유체. PINN(Physics-informed Neural Network)이 motion 예측.
- **GSDiT** (2501.02690, CVPR 2025) — Pseudo 4D Gaussian Field를 DiT에 conditioning. 카메라 내외부 파라미터 정밀 제어.

**합성 신호**: 세 작업 모두 **명시적 물리 representation**(파티클 / 유체장 / 4D Gaussian)을 diffusion의 conditioning으로 사용. 즉 diffusion이 시뮬을 대체하는 게 아니라 **시뮬과 결합한 controllable renderer**로 진화. Project-V/D/R이 "physics aware video"를 표방한다면 GSDiT(카메라) + PhysCtrl(재료) + ImplicitFluid(유체)의 conditioning channel을 합치는 것이 사실상의 **Project-V 컨디셔닝 표준 셋**이 된다.

## C. Controllable / Long-Horizon (2건)

- **FramePrompt** (2506.17301) — 레퍼런스 + 스켈레톤 + 타겟을 **하나의 통합 비주얼 시퀀스**로 입력. 외부 가이더 네트워크/모델 구조 변경 zero. 캐릭터 애니메이션의 in-context learning화.
- **Self-Forcing++** (2510.02283) — 자가 생성 긴 비디오에서 세그먼트 샘플링 → 학생 모델 가이드. teacher 재학습 없이 **4분 15초** (base position embedding의 99.9%, baseline의 50배).

**의미**: FramePrompt는 캐릭터 애니의 **데이터 형식 통일**을 보여주고, Self-Forcing++는 **장기 시퀀스의 distribution drift**를 self-distillation으로 해결. 둘을 합치면 **4분 길이 캐릭터 시퀀스**가 단일 모델로 가능해지는 경로가 보인다.

## 합성 인사이트

1. **VFX 자체가 학습 가능한 layer**가 됨. OmniEffects의 통합 + OverPP의 ILM 검증으로 "VFX = 별개 후처리"가 아닌 "VFX = 생성 모델의 한 컨디셔닝 채널".
2. **물리 시뮬은 사라지지 않고 conditioning으로 들어옴**. PhysCtrl의 4종 재료 데이터셋(550K)은 사실상 NVIDIA Cosmos·Genesis 시뮬과 같은 유형의 자산. 2026 하반기 관건은 "시뮬 데이터셋 ↔ diffusion conditioning" 인터페이스 표준화.
3. **Long-horizon 문제는 architectural reform이 아닌 self-distillation**으로 풀림. Self-Forcing++의 50× 확장은 모델 변경 없이 가능. → 기존 기반 모델들도 즉시 수혜.
4. **In-context Animation** (FramePrompt)의 등장은 prompt engineering이 비디오 도메인에서도 일급 패턴이 됨을 의미.

## 후속 액션

- [ ] **Project-V conditioning 매트릭스 갱신**: GSDiT(카메라) + PhysCtrl(재료) + ImplicitFluid(유체) 3축 표준
- [ ] **CharacterShift v2 설계 노트에 GenCompositor + OverPP layer 분리 패턴 인용**
- [ ] **ILM × OverPP 공저자 협력을 산업 트렌드 시그널로 RT-3 모닝브리핑에 등록**
- [ ] **Self-Forcing++ 50× 효과**를 ColorDepthExpansion 장기 시퀀스 실험에 적용 가능성 검토
