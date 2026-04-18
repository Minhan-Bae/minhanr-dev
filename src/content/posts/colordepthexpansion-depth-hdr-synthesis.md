---
title: "깊이 추정과 HDR — 2026 최신 연구 동향 종합"
slug: colordepthexpansion-depth-hdr-synthesis
date: 2026-04-01
description: "OIKBAS TrinityX 파이프라인이 수집·수렴한 기술 동향 종합 리포트"
tags: [AI_R&D_Synthesis, domain/depth, domain/multimodal, ColorDepthExpansion]
status: mature
created: 2026-04-01
relevance: 5
related: [ColorDepthExpansion, PathFinder]
source_type: synthesis
summary: ColorDepthExpansion 깊이 추정 + HDR 기술 종합 (2026-04 Synthesis) 2026년 3월 수집된 27개 growing notes에서 도출한 depth estimation + HDR reconstruction 기술 랜드스케이프.
categories:
  - Research
---

# ColorDepthExpansion 깊이 추정 + HDR 기술 종합 (2026-04 Synthesis)

> 2026년 3월 수집된 27개 growing notes에서 도출한 depth estimation + HDR reconstruction 기술 랜드스케이프. MinHanr의 depth 파이프라인 최적 전략을 제시한다.

## 1. 깊이 추정 — 세 가지 패러다임의 경쟁

2026년 3월 기준, 단안 깊이 추정(Monocular Depth Estimation)은 세 가지 패러다임이 경쟁하고 있다:

### 패러다임 A: 디퓨전 기반 (Iris)

[[260327_Iris_Diffusion_Monocular_Depth_Estimation|Iris]]는 **CVPR 2026 채택**된 결정적(deterministic) 깊이 추정 프레임워크다. Spectral-Gated Distillation(저주파 실세계 사전지식 전달) + Spectral-Gated Consistency(고주파 디테일 정제)의 2단계 학습으로, 59K 합성 + 100K pseudo-label 실제 이미지만으로 16개 방법 중 최고 성능을 달성했다.

**핵심 수치**: KITTI AbsRel **7.2**, NYUv2 AbsRel **4.9**, ETH3D AbsRel **5.5**, DA-2K delta1 **97.1%**

기존 디퓨전 기반 깊이 추정의 확률적 불안정성을 결정적 프레임워크로 해결한 점이 가장 큰 기여다. Spectral-Gated 접근법의 저주파/고주파 분리 처리 패턴은 HDR 확장과 결합 시에도 참고할 수 있다. ColorDepthExpansion의 **깊이 추정 백본 1순위 후보**.

### 패러다임 B: 경량 인코더 (AnyDepth + DINOv3)

[[260327_AnyDepth_DINOv3_Lightweight_Depth_Estimation|AnyDepth]]는 DINOv3를 visual encoder로 사용하고 Simple Depth Transformer(SDT) 디코더를 설계하여, 기존 DPT 대비 **파라미터 85-89% 절감**하면서 정확도를 유지했다. 369K 고품질 데이터만으로 학습하여 "데이터 양보다 데이터 품질"이라는 원칙을 실증했다. 모바일/엣지 환경에서의 depth 추정 배포에 직접 참고할 수 있는 아키텍처 패턴이다.

**핵심 기여**: DINOv3 dense feature + 경량 디코더 → zero-shot 일반화. 85-89% 파라미터 절감은 엣지 디바이스 배포 비용을 대폭 줄인다.

### 패러다임 C: 시맨틱 임베딩 (PureCLIP-Depth)

[[260327_PureCLIP_Depth_CLIP_Embedding_Depth_Estimation|PureCLIP-Depth]]는 CLIP 임베딩 공간 내에서 프롬프트와 디코더 없이 RGB→깊이 직접 매핑을 학습한다. NYU AbsRel **0.201**(기존 CLIP 방법 0.319 대비 37% 개선), KITTI AbsRel **0.172**(기존 0.238 대비 28% 개선). 특히 KITTI RMSE에서 1.062(기존 5.756)로 압도적 개선을 보여, CLIP의 시맨틱 표현이 기하학적 깊이 추정에도 유효함을 입증했다.

**PathFinder 시너지**: 텍스트 조건부 VFX 생성과 depth 추정을 동일 CLIP 공간에서 연동하는 아키텍처 설계에 참고 가능.

### 패러다임 비교

| 모델 | AbsRel (NYU)↓ | AbsRel (KITTI)↓ | 장점 | 한계 |
|------|--------------|-----------------|------|------|
| **Iris** | **4.9** | **7.2** | CVPR 검증, 결정적 추론 | 디퓨전 추론 비용 |
| **AnyDepth** | (동급) | (동급) | 85% 파라미터 절감, 엣지 | 정밀도 약간 낮을 수 있음 |
| **PureCLIP** | 20.1 | 17.2 | 프롬프트/디코더 불필요 | 전용 depth 모델 대비 정밀도 열위 |

## 2. 실시간 깊이 추정: AsyncMDE

[[260331_asyncmde_async_depth_estimation|AsyncMDE]]는 foundation model(고품질/저속)과 경량 모델(실시간/매 프레임)을 **비동기(asynchronous)** 이중 트랙으로 운영하는 패러다임을 제안한다. Foundation model은 낮은 주파수로 실행되어 고품질 깊이 특징을 Asynchronous Spatial Memory에 저장하고, 경량 모델은 매 프레임 실시간 추론을 수행하면서 cross-frame feature reuse로 보완받는다. Complementary fusion + autoregressive updating으로 시간적 일관성을 유지하며, PEFT로 도메인 적응 비용을 최소화한다.

**ColorDepthExpansion 최적 조합**: 
- **Foundation track**: Iris (고품질, 저주파 실행)
- **Lightweight track**: AnyDepth/DINOv3 SDT (매 프레임, 실시간)
- **AsyncMDE 아키텍처**: 두 트랙을 비동기 결합하여 HDR 영상의 고품질 깊이 추정 + 실시간 처리를 동시 달성

## 3. HDR 복원 — Inverse Tone Mapping 패러다임 전환

[[260325_Single_Image_HDR_Reconstruction_Inverse_Tone_Mapping|Single Image HDR]] 분석에서 2025-2026년의 3대 패러다임 변화를 확인했다:

### 핵심 접근법 5가지

| 논문 | 방식 | 발표 | 핵심 |
|------|------|------|------|
| **RealRep** | Regression (attribute disentanglement) | **AAAI'26 Oral** | Lumi/Chroma 분리, 다양한 degradation domain 일반화 |
| **Diffusion Reg.** | Regression + Diffusion regularization | ICCVW'25 AIM | 생성 능력을 regularizer로만 활용 |
| **RAW-Flow** | Flow Matching (deterministic latent ODE) | **AAAI'26 Oral** | RGB→RAW 복원, Diffusion 대안 |
| **Diff. Paradigm** | 메타 프레임워크 | ArXiv'25 | 범용 IR에 diffusion 학습 이식 |
| **WMNet** | Wavelet MIM self-supervised | TMM'26 | 비디오 HDR, W-MIM 사전학습 |

**권장 경로**: 
1. **즉시 실행**: RealRep (Regression 기반, AAAI'26 Oral 검증, Diffusion 없이도 SOTA) → 추론 속도와 fidelity 모두 확보
2. **실험적 탐색**: RAW-Flow (Flow Matching, deterministic ODE) → Diffusion의 stochastic 불안정성 없이 HDR 복원
3. **비디오 확장**: WMNet (코드 공개, github.com/eezkni/WMNet) → 비디오 HDR 시간 일관성 보장

## 4. 통합 파이프라인 — MinHanr의 Depth 파이프라인

```
입력 영상 (SDR/LDR)
    │
    ├─ [HDR 확장] RealRep → HDR/WCG 이미지
    │
    ├─ [실시간 Depth] AsyncMDE 이중 트랙
    │     ├─ Foundation: Iris (Spectral-Gated, 결정적)
    │     └─ Lightweight: AnyDepth (DINOv3 + SDT, 85% 절감)
    │
    ├─ [시맨틱 연동] PureCLIP-Depth → CLIP 공간에서 depth + 텍스트 조건 통합
    │
    └─ [비디오 시간 일관성] WMNet W-MIM → temporal coherence 보장
```

### 기술 선택 의사결정

| 시나리오 | 권장 모델 | 이유 |
|----------|---------|------|
| 프로덕션 depth 추정 | **Iris** | CVPR 검증, 결정적 추론, SOTA |
| 엣지/모바일 depth | **AnyDepth** | 85% 파라미터 절감, 369K 데이터 |
| 실시간 비디오 depth | **AsyncMDE** 패턴 | Iris(고품질) + AnyDepth(실시간) 비동기 결합 |
| CLIP 기반 멀티모달 | **PureCLIP-Depth** | 텍스트-depth 동일 공간 |
| SDR→HDR 변환 | **RealRep** | AAAI Oral, Diffusion 불필요 |
| 비디오 HDR | **WMNet** | 코드 공개, W-MIM 사전학습 |

## 이번 달 액션

1. **Iris vs AnyDepth 비교 벤치마크 실행**: NYUv2, KITTI, ETH3D 공개 데이터셋에서 두 모델의 AbsRel/RMSE/delta1을 동일 조건으로 측정한다. 추론 시간(RTX 4090, 1080p)과 VRAM 사용량을 함께 프로파일링하여, ColorDepthExpansion의 프로덕션 depth 백본과 실시간 depth 백본을 확정한다.

2. **RealRep SDR→HDR 재현 실험**: AAAI'26 Oral 논문의 DDACMNet 구조를 자체 VFX 촬영분 10건으로 테스트한다. clipping된 하이라이트 영역의 복원 품질과 색역 확장 결과를 DaVinci Resolve에서 검증한다. 성공 시 PathFinder의 AOV 파이프라인에 HDR 전처리 모듈로 통합한다.

3. **AsyncMDE 비동기 이중 트랙 아키텍처 설계 문서 작성**: Iris(Foundation track)와 AnyDepth(Lightweight track)를 비동기로 결합하는 구체적 아키텍처를 설계한다. 핵심 파라미터: Foundation model 실행 주기(매 N프레임), Spatial Memory 크기, cross-frame feature reuse 전략. 코드 미공개이므로 논문의 아키텍처를 참고하여 자체 구현 스펙을 작성한다.
