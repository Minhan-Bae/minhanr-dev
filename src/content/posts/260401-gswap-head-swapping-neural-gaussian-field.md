---
author: MinHanr
categories:
- Research
date: '2026-04-01'
summary: "USTC + CityU HK 공동 연구. SMPL-X 표면에 3D Gaussian feature를 임베딩하여 비디오 헤드 스와핑의 3D 일관성·시간 연속성·아이덴티티 보존을 동시에 달성. RTX 4090 단일 GPU. TVCG 채택."
draft: false
slug: 260401-gswap-head-swapping-neural-gaussian-field
tags:
- gaussian-splatting
- head-swapping
- face-generation
- SMPL-X
title: "GSwap: 동적 뉴럴 가우시안 필드로 리얼리스틱 헤드 스와핑을 구현하다"
---

## 한줄 요약

USTC와 City University of Hong Kong 공동 연구팀이 **동적 뉴럴 가우시안 필드(Dynamic Neural Gaussian Field)** 기반의 비디오 헤드 스와핑 시스템 GSwap을 발표했다. 기존 2D 생성 모델이나 3DMM 기반 방법의 한계를 극복하여, 3D 일관성·시간적 연속성·아이덴티티 보존을 동시에 달성한다. RTX 4090 단일 GPU에서 동작하며, IEEE TVCG에 채택되었다.

## 연구 배경: 왜 헤드 스와핑이 어려운가

헤드 스와핑(Head Swapping)은 영상 편집에서 가장 도전적인 과제 중 하나다. 얼굴만 바꾸는 페이스 스와핑(Face Swapping)과 달리, 머리카락·목·귀·턱선까지 포함한 **전체 헤드 영역**을 자연스럽게 교체해야 한다.

기존 접근법의 한계:

| 방식 | 문제점 |
|---|---|
| **2D GAN 기반** | 측면 포즈에서 3D 일관성 붕괴, 시간적 깜빡임 |
| **3DMM (3D Morphable Model)** | 표현력 제한 (머리카락·액세서리 미모델링), 표정 전달 부자연스러움 |
| **Diffusion 기반** | 단일 프레임 품질은 높으나 프레임 간 일관성 미보장 |

공통된 근본 문제는 **3D 인체 구조의 부재**다. 머리는 3D 물체이므로, 2D 평면에서의 합성은 포즈 변화에 취약할 수밖에 없다.

![GSwap 파이프라인 — SMPL-X 기반 3D Gaussian Feature Field에서 Few-Shot Domain Adaptation과 Neural Re-Rendering을 거쳐 최종 합성](/images/posts/260401-gswap/pipeline.jpg)

## 핵심 기술: 3단계 파이프라인

### 1단계: SMPL-X 기반 3D Gaussian Feature Field

GSwap의 핵심 혁신은 **전신 인체 모델(SMPL-X) 표면에 intrinsic 3D Gaussian feature field를 임베딩**하는 것이다.

구체적으로:

- 2D 포트레이트 비디오를 SMPL-X 파라미터로 피팅 (체형·포즈·표정 추출)
- SMPL-X 메쉬 표면의 각 정점에 3D Gaussian primitive를 배치
- 각 Gaussian이 appearance feature를 함께 인코딩 → **Neural Gaussian Portrait Prior**

이 설계의 장점:

- 머리-몸통-목의 관계가 **해부학적으로 정확**하게 모델링됨
- 포즈 변화 시 Gaussian이 SMPL-X와 함께 변형 → **3D 일관성 자동 보장**
- 시간축에서 SMPL-X 파라미터가 연속적 → **temporal coherence** 확보

### 2단계: Few-Shot Domain Adaptation

사전학습된 2D 포트레이트 생성 모델(diffusion 기반)을 **소수의 참조 이미지만으로** 소스 헤드 도메인에 적응시킨다.

- 대규모 재학습 불필요 → 실용적 배포 가능
- 소스 인물의 아이덴티티 특징(피부톤, 얼굴 형태, 머리카락 스타일)을 정밀 캡처
- DreamBooth 스타일의 few-shot finetuning 전략

### 3단계: Neural Re-Rendering

합성된 전경(swapped head + body)과 원본 배경을 조화롭게 통합:

- 블렌딩 아티팩트(목 경계, 조명 불일치) 제거
- 원본 영상의 조명·색감에 자동 맞춤
- 배경 보존으로 자연스러운 합성

## 벤치마크 비교

GSwap은 기존 헤드/페이스 스와핑 방법 대비 전 지표에서 우위를 보인다:

### vs Head Swapping

| Method | 시각 품질 | 시간 일관성 | ID 보존 | 3D 일관성 |
|---|---|---|---|---|
| HeSer | △ | △ | ○ | ✕ |
| **GSwap** | **◎** | **◎** | **◎** | **◎** |

### vs Face Swapping (참고)

| Method | 유형 | 한계 |
|---|---|---|
| DeepLiveCam | GAN | 얼굴만 교체, 목/머리카락 경계 아티팩트 |
| DiffSwap | Diffusion | 단일 프레임, temporal flickering |
| InfoSwap | GAN | 아이덴티티 손실, 측면 포즈 취약 |
| BlendFace | Hybrid | 블렌딩 경계 가시적 |
| LivePortrait | Reenactment | 헤드 교체가 아닌 표정 전달 |
| **GSwap** | **3DGS + SMPL-X** | **전체 헤드, 3D 일관, 시간 일관** |

핵심 차별점: GSwap은 얼굴(face)이 아닌 **머리 전체(head)**를 교체하며, 이를 **3D 공간에서** 수행한다.

## 실용성 체크

| 항목 | 상태 |
|---|---|
| 논문 | ✅ [arXiv 2603.23168](https://arxiv.org/abs/2603.23168) |
| 프로젝트 페이지 | ✅ [ustc3dv.github.io/GSwap](https://ustc3dv.github.io/GSwap/) |
| 코드 | ⏳ "Coming soon" |
| 모델 | ❌ 미공개 |
| 라이선스 | 미명시 |
| 요구사양 | **RTX 4090 단일 GPU** (24GB VRAM) |
| 학회 | **IEEE TVCG** 채택 |

## VFX/미디어 산업 시사점

### 1. 캐릭터 교체 파이프라인

VFX에서 배우 교체(actor replacement)는 고비용 작업이다. GSwap의 접근법은 스턴트 대역 → 주연 배우 얼굴 합성, 혹은 사후 캐스팅 변경 시나리오에서 기존 로토스코핑 + CG 헤드 교체 워크플로우를 대폭 간소화할 수 있다.

### 2. 3DGS + 인체 모델 결합의 범용성

SMPL-X 표면에 Gaussian feature를 임베딩하는 아이디어는 헤드 스와핑을 넘어서:

- **전신 캐릭터 스타일 전환** (의상 포함)
- **가상 아바타 실시간 렌더링** (메타버스/XR)
- **모션 캡처 + 외형 분리** (퍼포먼스 캡처)

등 다양한 응용으로 확장 가능하다.

### 3. Few-Shot 적응의 프로덕션 적용

소수 참조 이미지만으로 도메인 적응이 가능하다는 것은, 현장에서 배우의 사진 몇 장만 촬영하면 즉시 시스템에 등록할 수 있음을 의미한다. 대규모 3D 스캐닝이나 수백 장의 학습 데이터 수집이 불필요.

### 4. RTX 4090 접근성

A100/H100이 아닌 소비자급 GPU에서 동작하므로, 대형 스튜디오뿐 아니라 인디 VFX 팀이나 크리에이터도 활용 가능한 접근성을 제공한다.

## 한계점

- 코드 미공개로 재현 불가 (프로젝트 페이지에 "Coming soon")
- 정량적 벤치마크 수치(FID, CSIM 등)가 논문 본문에 있으나 arXiv 접근 제한으로 미확인
- SMPL-X 피팅 실패 시(극단적 포즈, 오클루전) 파이프라인 전체가 영향받을 수 있음
- 헤드 스와핑의 윤리적 이슈(딥페이크 악용 가능성) — 저자가 논의하지 않은 점은 아쉬움

## 출처

- [arXiv 2603.23168 — GSwap](https://arxiv.org/abs/2603.23168)
- [프로젝트 페이지 — GSwap](https://ustc3dv.github.io/GSwap/)
- [SMPL-X 인체 모델](https://smpl-x.is.tue.mpg.de/)
