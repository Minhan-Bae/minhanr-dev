---
title: "CharacterShift — SAM 3와 DiT 기반 VFX 인페인팅 파이프라인"
slug: charactershift-inpainting-synthesis
date: 2026-04-01
description: "OIKBAS TrinityX 파이프라인이 수집·수렴한 기술 동향 종합 리포트"
tags: [AI_R&D_Synthesis, domain/inpainting, CharacterShift]
status: mature
created: 2026-04-01
relevance: 5
related: [CharacterShift]
source_type: synthesis
---

# CharacterShift 인페인팅 + 세그멘테이션 기술 종합 (2026-04 Synthesis)

> 2026년 3월 수집된 16개 growing notes에서 도출한 인페인팅/세그멘테이션/편집 기술 랜드스케이프. CharacterShift VFX 파이프라인의 구성 전략을 제시한다.

## 1. CharacterShift 파이프라인 개요

CharacterShift는 영상 내 캐릭터를 다른 캐릭터로 교체하는 VFX 파이프라인이다. 핵심 기술 블록은 4가지:

```
[세그멘테이션] → [편집/교체] → [인페인팅] → [품질 보증(QA)]
   SAM 3          Step1X-Edit    InverFill    Agentic Retoucher
   GenMask         (MLLM+DiT)    (1-step)     (Perception-Reasoning-Action)
```

2026년 3월에 각 블록에서 의미 있는 브레이크스루가 동시에 발생하여, 풀 파이프라인 구축의 기술적 준비가 완료된 상태다.

## 2. 세그멘테이션: SAM 3 + GenMask

### SAM 3 (Segment Anything with Concepts)

[[260330_SAM3_Segment_Anything_Concepts|SAM 3]]은 Meta가 발표한 **개념 프롬프트 기반 세그멘테이션** 모델이다. 짧은 명사구, 이미지 예시, 또는 두 가지의 조합으로 이미지/비디오에서 객체를 감지, 세그멘테이션, 추적한다. "Promptable Concept Segmentation(PCS)"이라는 새로운 태스크를 정의했다.

**핵심 성능**: 이미지/비디오 PCS 정확도 기존 대비 **2x 향상**, 400만 고유 개념 레이블 데이터셋. SAM 3 Agent는 MLLM이 명사구 쿼리를 생성하고 SAM 3가 세그멘테이션하는 반복 정제 루프로, ReasonSeg와 OmniLabel에서 **Zero-shot SOTA**를 달성했다. 2026년 3월 27일 SAM 3.1 Object Multiplex가 출시되어 공유 메모리 기반 합동 다중 객체 추적으로 속도를 대폭 개선했다.

**코드/모델 오픈소스** (github.com/facebookresearch/sam3) — CharacterShift의 마스크 생성 파이프라인에 **즉시 PoC 가능**. "이 장면에서 주인공 캐릭터"라는 개념 프롬프트만으로 정밀한 마스크를 생성할 수 있다.

### GenMask (DiT 세그멘테이션)

[[260330_genmask_dit_segmentation|GenMask]]은 Diffusion Transformer(DiT) 내부에서 직접 세그멘테이션 마스크를 생성하는 접근이다. DiT 블록의 Attention 맵과 쿼리 정보를 활용하여 마스크를 직접 디코딩하는 헤드를 도입했다. COCO, ADE20K에서 기존 DiT-Segmentation 대비 mIoU 유의미 향상을 보고했으며, zero-shot 강건함과 노이즈 내성이 특징이다.

**파이프라인 통합 관점**: GenMask를 사용하면 별도 SAM 호출 없이 DiT 기반 편집 모델 내부에서 세그멘테이션 + 생성을 동시에 수행할 수 있어 파이프라인이 단순화된다. 다만 코드/모델 미공개 상태이므로, 현재는 SAM 3을 1차 옵션으로 하고 GenMask 공개를 추적한다.

## 3. 편집/교체: Step1X-Edit

[[260331_Step1X_Edit_MLLM_diffusion_image_edit|Step1X-Edit]]는 StepFun이 공개한 **MLLM(7B) + 커넥터 + DiT(12B) 디코더** 3단 통합 아키텍처(총 19B)의 범용 이미지 편집 모델이다. GEdit-Bench 11개 축에서 오픈소스 1위, 스타일 변환과 색상 변경에서 GPT-4o 초과 성능을 달성했다.

**CharacterShift 핵심 적용**: 11개 편집 카테고리 중 **피사체 교체(subject replacement)**가 CharacterShift의 정확한 유스케이스다. "이 캐릭터를 저 캐릭터로 교체"라는 고수준 지시를 MLLM이 해석하고 DiT가 실행하는 구조가 CharacterShift와 정확히 일치한다. 2,000만+ instruction-image 삼중항 생성 → 100만+ 고품질 필터링의 데이터 파이프라인도 참고 가치가 높다.

**실용성**: Apache-2.0 라이선스, 코드/모델 공개 (github.com/stepfun-ai/Step1X-Edit, HuggingFace). 19B 모델이라 A100급 GPU가 필요하지만 양자화 검토 가능. GEdit-Bench는 CharacterShift 결과물 품질 평가 프레임워크로도 재활용할 수 있다.

## 4. 인페인팅: InverFill

[[260329_InverFill_OneStep_Inversion_FewStep_Diffusion_Inpainting_IVFL|InverFill]]은 few-step T2I 모델(FLUX, SDXL)을 인페인팅에 적용할 때 발생하는 harmonization 실패의 원인을 **random Gaussian noise 초기화에 의한 semantic misalignment**로 진단하고, **one-step inversion**으로 해결한다. 마스크된 입력 이미지에서 semantically aligned noise latent를 생성하여, 추론 시 **+0.06초**의 최소 오버헤드만 추가한다.

**핵심 혁신**: 기존 few-step T2I 모델을 재훈련 없이(training-free) 인페인팅에 활용. FLUX, SDXL 등 다양한 base 모델에 적용 가능한 범용성이 강점이다. Random 초기화 대비 consistently lower LPIPS(배경 보존 향상)를 달성하며, few-step(1-4 NFE)에서 전용 인페인팅 모델에 필적하는 성능을 보인다.

**CharacterShift 적용**: 캐릭터 교체 후 경계 영역의 인페인팅 품질과 속도가 핵심 병목인데, 0.06초 오버헤드로 고품질 harmonization이 가능하다면 배치 처리 시 무시할 수 있는 수준이다. 다만 Qualcomm AI Research 출처로 코드 공개 여부가 불확실하다.

## 5. 품질 보증(QA): Agentic Retoucher

[[260331_Agentic_Retoucher_T2I|Agentic Retoucher]]는 T2I 생성 이미지의 미세 왜곡(팔다리/얼굴/텍스트)을 **Perception-Reasoning-Action 에이전트 루프**로 자동 보정하는 프레임워크다. 3개 에이전트로 구성: Perception Agent(contextual saliency 기반 왜곡 탐지), Reasoning Agent(progressive preference alignment으로 원인 진단), Action Agent(적응적 로컬 인페인팅).

**GenBlemish-27K 데이터셋**: 6K 이미지, 12개 카테고리, 27K 아티팩트 어노테이션. CharacterShift 결과물의 품질 평가 기준으로 재활용 가능하다.

CharacterShift 파이프라인에서 캐릭터 교체 후 남는 미세 아티팩트(손가락 왜곡, 경계 불일치 등)를 자동 보정하는 QA 단계에 직접 적용 가능하다. 코드/모델 미공개가 아쉬우나, 에이전트 아키텍처 패턴 자체가 참고 가치가 높다.

## 6. 풀 파이프라인 구성 권장

| 단계 | 추천 도구 | 라이선스 | 코드 공개 | 즉시 실행 |
|------|---------|---------|----------|----------|
| **세그멘테이션** | SAM 3 / SAM 3.1 | Meta 연구 | ✅ | ✅ |
| **편집/교체** | Step1X-Edit | Apache-2.0 | ✅ | ✅ |
| **인페인팅** | InverFill (논문 재현) 또는 HiFi-Inpaint | 미명시 | ❌ | △ |
| **QA 보정** | Agentic Retoucher 패턴 + SAM 3 | 미명시 | ❌ | △ |

**즉시 실행 가능한 최소 파이프라인**: SAM 3 (마스크 생성) → Step1X-Edit (캐릭터 교체) → 수동 QA. 이 2단 파이프라인만으로도 AX 지원사업 PoC 수준의 결과물은 생산 가능하다.

**완전 자동화 파이프라인**: SAM 3.1 Object Multiplex (비디오 추적 + 마스크) → Step1X-Edit (프레임별 교체) → InverFill (경계 harmonization) → Agentic Retoucher 패턴 (자동 QA). 코드 공개 상황에 따라 2026년 Q2 중 구축 목표.

## 이번 달 액션

1. **SAM 3 + Step1X-Edit 2단 파이프라인 PoC**: SAM 3 GitHub 코드를 AIDC GPU에 설치하고, 테스트 영상 5개에서 "주인공 캐릭터" 개념 프롬프트로 마스크를 생성한다. 생성된 마스크를 Step1X-Edit에 입력하여 캐릭터를 다른 인물로 교체하는 end-to-end 실험을 수행한다. 처리 시간, 마스크 정밀도(IoU), 교체 품질(FID, LPIPS)을 측정하여 AX 지원사업 PoC 가능성을 판단한다.

2. **GEdit-Bench 기반 CharacterShift 평가 체계 설계**: Step1X-Edit의 GEdit-Bench 11축 중 CharacterShift에 관련된 축(피사체 교체, 배경 일관성, 아이덴티티 보존)을 선별하여 CharacterShift 전용 평가 메트릭을 정의한다. GenBlemish-27K의 12개 아티팩트 카테고리도 참조하여 "교체 후 아티팩트 등급" 기준을 확립한다.

3. **InverFill one-step inversion 재현 실험 설계**: 논문의 핵심 기법(마스크 이미지 → semantically aligned noise latent → blended sampling)을 FLUX Dev 모델 위에서 재현하는 실험을 설계한다. Gaussian Regularization(JSD 최소화) 부분의 구현 스펙을 작성하고, 코드 공개 전까지 자체 구현으로 CharacterShift의 경계 harmonization 문제를 해결한다.
