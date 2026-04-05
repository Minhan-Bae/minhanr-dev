---
title: "Project-C — Video Inpainting DiT 파이프라인 2주차 수렴"
tags: [Weekly, Insight, Project-C, Inpainting, DiT, Video_Generation]
source_type: synthesis
status: mature
created: 2026-04-05
relevance: 5
related:
  - "[[260401_CharacterShift_Inpainting_Synthesis]]"
  - "[[260402_MoCha_EndToEnd_Video_Character_Replacement_MCHA]]"
  - "[[260405_MoCha_EndToEnd_Video_Character_Replacement_MCHA]]"
  - "[[260402_VideoPainter_AnyLength_Video_Inpainting_DiT]]"
  - "[[260403_DirectSwap_MaskFree_Video_Head_Swapping_DSWP]]"
  - "[[260403_EraserDiT_Fast_Video_Inpainting_DiT_1080p_ERDT]]"
  - "[[260404_DiTPainter_Efficient_Video_Inpainting_DiT_DITP]]"
  - "[[260405_Inpaint360GS_360_Scene_Inpainting_GS_I360]]"
  - "[[260402_SlotID_Identity_Preserving_Video_Reference_SLID]]"
  - "[[260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP]]"
  - "[[260403_ViFeEdit_VideoFree_Tuner_Video_DiT_VFED]]"
---

# Project-C Video Inpainting DiT 파이프라인 수렴 (W14, 2026-04-05)

> W14(260402~260405) 10건의 growing 노트에서 도출. 260401 CharacterShift synthesis 이후 1주간의 급격한 기술 진전을 반영한다.

## 1. 핵심 발견: DiT 기반 Video Inpainting의 패러다임 전환

W14에서 video inpainting 분야에 DiT(Diffusion Transformer) 아키텍처가 일제히 진입했다. 기존 UNet 기반(ProPainter 등)에서 DiT로의 전환은 3가지 축에서 동시에 발생:

| 축 | 기존 (UNet) | 신규 (DiT) | 대표 논문 |
|----|-------------|------------|-----------|
| 캐릭터 교체 | 구조적 가이드 필수 (pose/depth) | 마스크+참조 1장만으로 end-to-end | MoCha |
| 배경/객체 제거 | 프레임별 처리, 길이 제한 | 임의 길이, 1080p 지원 | EraserDiT, VideoPainter |
| 합성/편집 | 별도 후처리 필요 | 생성 시점에 합성 통합 | GenCompositor, ViFeEdit |

## 2. 기술 블록별 분석

### 2.1 캐릭터 교체: MoCha 패러다임

**MoCha**는 Condition-Aware RoPE로 비디오+마스크+참조 이미지를 단일 시퀀스로 통합. 구조적 가이드(pose/depth) 없이 전신 캐릭터 교체를 최초 달성.

- **핵심 혁신**: RL post-training + facial reward로 identity preservation 강화
- **실용성**: ComfyUI 노드 + HuggingFace 가중치 공개 → 즉시 실험 가능
- **보완점**: 두부(head) 전문은 DirectSwap(MEAR loss)이 더 정밀

**DirectSwap**은 마스크 프리 head swapping 특화. HeadSwapBench(8K 학습 + 500 벤치마크)를 자체 구축하여 head-specific 메트릭을 제안. MoCha와 상보적.

### 2.2 비디오 인페인팅 엔진: 3자 경쟁

| 모델 | 백본 | 핵심 기법 | 속도 | 해상도 |
|------|------|-----------|------|--------|
| **EraserDiT** | LTX-Video | Circular Position-Shift (학습 불필요) | 180s/121f @A100 | 1080p |
| **VideoPainter** | Video DiT (범용) | Dual-branch + Target Region ID Resampling | - | 임의 |
| **DiTPainter** | From-scratch DiT | Flow Matching (4-8 step) | 10x 빠름 | 임의 |

**EraserDiT**이 1080p 프로덕션급으로 가장 실용적. **VideoPainter**는 임의 길이 + 멀티 리전이 강점. **DiTPainter**는 추론 속도에서 압도적(10x).

### 2.3 합성 및 후처리

- **GenCompositor** (ICLR 2026): Background Preservation Branch로 전경 합성 시 배경 일관성 유지. 캐릭터 교체 후 장면 통합에 직접 활용 가능.
- **ViFeEdit**: 2D 이미지 100~250쌍만으로 비디오 스타일/편집 학습 → 비디오 학습 데이터 불필요. Project-C 후처리 파이프라인의 비용 절감 핵심.
- **SlotID**: 참조 비디오 클립에서 시공간 identity dynamics 추출. 단일 이미지 대비 identity 보존 크게 향상.

### 2.4 3D 확장

**Inpaint360GS**: 3DGS 기반 360도 장면 인페인팅. 2D segmentation → 3D 필드 리프팅 경로 제시. Project-C가 3D 일관성을 요구할 때 참조 아키텍처.

## 3. Project-C 파이프라인 업데이트 제안

```
[세그멘테이션]  →  [캐릭터 교체]  →  [인페인팅]  →  [합성/편집]  →  [QA]
 SAM 3 / GenMask   MoCha (전신)      EraserDiT      GenCompositor    ViFeEdit
                   DirectSwap (두부)  VideoPainter   (장면 통합)      (스타일)
                                     DiTPainter(속도)
```

**W13 대비 변화점:**
1. 편집/교체 블록: Step1X-Edit → **MoCha** (end-to-end, 구조적 가이드 불필요)
2. 인페인팅 블록: InverFill → **EraserDiT** (1080p, 학습 불필요) 또는 **DiTPainter** (속도)
3. 합성 블록: 신규 — **GenCompositor** (배경 보존 합성)
4. Identity 강화: **SlotID** 참조 비디오 기반 identity 토큰

## 4. 액션 아이템

- [ ] MoCha ComfyUI 노드 로컬 테스트 — Wan2.1 backbone 호환 확인
- [ ] EraserDiT vs DiTPainter 비교 벤치마크 — Project-C 영상 소스 기준
- [ ] GenCompositor CogVideoX-5B 가중치 확보 및 파이프라인 통합 테스트
- [ ] SlotID 참조 비디오 → identity token → MoCha 조건 주입 실험 설계

## 5. 메타 관찰

W14에서 video inpainting/editing 논문 10건이 동시 출현한 것은 DiT 아키텍처의 성숙을 보여준다. 특히 "학습 불필요"(EraserDiT, ViFeEdit) 접근의 부상은 프로덕션 파이프라인 진입 장벽을 급격히 낮추고 있다. Project-C의 기술 리스크가 W13 대비 현저히 감소.

---

> 이전 synthesis: [[260401_CharacterShift_Inpainting_Synthesis]]
> 다음 업데이트: W15 수렴 시
