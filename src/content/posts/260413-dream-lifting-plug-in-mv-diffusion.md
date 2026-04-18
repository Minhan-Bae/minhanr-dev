---
tags:
- AI_R&D_Paper
- domain/3d
- tech/3d-generation
- tech/PBR
- tech/2DGS
- tech/diffusion
source_url: https://arxiv.org/html/2509.07435v1
code_url: https://zx-yin.github.io/dreamlifting/
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 사전학습된 multi-view diffusion 모델에 플러그인으로 결합하여 relightable 3D mesh 에셋을 생성. LGAA
  Wrapper로 사전학습 지식 보존/퓨전, Tamed VAE(LGAA Decoder)로 2DGS+PBR 채널 예측, 후처리로 고품질 mesh 추출.
  69K multi-view 인스턴스로 효율적 학습.
slug: 260413-dream-lifting-plug-in-mv-diffusion
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-dream-lifting-plug-in-mv-diffusion&category=Research
  alt: 260413-dream-lifting-plug-in-mv-diffusion
date: '2026-04-13'
---



# DreamLifting: A Plug-in Module Lifting MV Diffusion Models for 3D Asset Generation

**프로젝트**: [zx-yin.github.io/dreamlifting](https://zx-yin.github.io/dreamlifting/)

## 핵심 요약

기존 multi-view diffusion 모델은 RGB만 출력하여 relighting 불가능한 3D 에셋을 생성한다. DreamLifting은 **사전학습 MV diffusion에 플러그인 모듈**로 결합하여 **(1) LGAA Wrapper**가 사전학습 지식을 보존/퓨전하고, **(2) LGAA Decoder(Tamed VAE)**가 2D Gaussian Splatting + PBR 채널을 예측하며, **(3) 후처리**로 relightable mesh 에셋을 추출. 텍스트/이미지 조건 모두 지원, **69K multi-view 인스턴스**만으로 효율적 학습.

## 방법론

1. **LGAA Wrapper**: 사전학습 MV diffusion의 각 레이어에 적응적으로 결합 → 지식 보존 + 3D 인식 퓨전
2. **LGAA Switcher**: 여러 LGAA Wrapper 레이어의 디퓨전 프라이어 정렬
3. **LGAA Decoder (Tamed VAE)**: 2D Gaussian Splatting + PBR(albedo, roughness, metallic) 채널 동시 예측
4. **Post-processing**: 2DGS → 고품질 relightable mesh 추출
5. **경량 학습**: 69K multi-view 인스턴스로 수렴

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ 공개 (프로젝트 페이지) |
| 모델 | ✅ 사전학습 가중치 공개 |
| 라이선스 | 미명시 |
| 요구사양 | MV diffusion backbone + LGAA 모듈 |

## PathFinder R&D 적용 가능성

- **Phase 2 에셋 파이프라인**: PathFinder의 3D 에셋 생성에서 기존 MV diffusion(MVDream 등)에 플러그인으로 PBR 출력을 추가하는 경량 접근. 대규모 재학습 불필요.
- **2DGS+PBR**: 2D Gaussian Splatting 위에 PBR을 올리는 구조는 PathFinder의 GS 기반 렌더링과 직접 호환.
- **플러그인 아키텍처**: 새 MV diffusion 모델이 나올 때마다 backbone만 교체 가능 → 유지보수 효율.

## 한계점

1. **MV diffusion 의존**: Backbone 모델의 품질에 바운드
2. **오브젝트 중심**: 씬 레벨 미지원

## 관련 노트

- 260413_Large_Material_Gaussian_Relightable_3D_LMGM — Gaussian material model
- 260413_SViM3D_Stable_Video_Material_Diffusion_3D_SVM3 — Video-based PBR 3D
- PathFinder_Master

## 상세 배경 (보강)

DreamLifting의 출발점은 **"PBR-ready 3D asset을 end-to-end로 자동 생성하기 어렵다"**는 산업적 병목이다. 기존 3D 생성 방법은 기하 모델링에 집중하여 텍스처를 vertex color로 베이크하거나, 후처리 단계에서 image diffusion으로 텍스처만 따로 합성하는 2-stage 구조가 많았다. 결과물은 **재조명 불가(non-relightable)**하거나 **재질 일관성이 깨지는** 문제를 안는다. 엔진에 바로 투입 가능한 asset은 albedo/normal/roughness/metallic이 정렬된 PBR 재질이 필수인데, 이 요구를 단일 파이프라인에서 충족하는 사례가 드물었다.

저자들이 제안한 **LGAA(Lightweight Gaussian Asset Adapter)**는 이를 모듈형 구조로 풀어낸다. LGAA Wrapper는 기존 **MV diffusion 모델의 네트워크 레이어를 재사용·어댑테이션**하여 수십억 이미지로 학습된 2D prior를 그대로 가져오고, LGAA Switcher가 서로 다른 prior를 담은 여러 Wrapper 층을 정렬한다. 최종 LGAA Decoder는 tamed VAE로서 **PBR 채널이 붙은 2D Gaussian Splatting**을 예측하고, 후처리 단계에서 relightable mesh asset으로 추출된다. 모듈 디자인의 직접적 결과로 **단 69k multi-view 샘플만으로 fine-tuning이 가능**하다 — MV diffusion 모델의 기존 지식을 보존하는 knowledge-preserving scheme 덕분이다.

## 시사점 (보강)

- **데이터 효율성의 재정의**: 수십만~수백만 3D asset 데이터셋이 관행인 상황에서 69k라는 수치는 파격적이다. "대규모 2D prior를 끌어올려(lift) 3D 생성에 활용"이라는 전략이 **데이터 부족 도메인**에서 일반화 가능한 템플릿임을 보여준다.
- **Plug-in 아키텍처의 확장성**: Wrapper/Switcher/Decoder 구조는 Stable Diffusion 계열 외에도 새 MV diffusion backbone이 등장할 때마다 교체 가능하다. **현역 diffusion 생태계를 곧바로 3D로 가져오는 브릿지 레이어**로 기능한다.
- **엔진 파이프라인 통합**: 2DGS + PBR 채널 → relightable mesh 추출이라는 출력 포맷은 Unity/Unreal/Blender 에셋 파이프라인에 **추가 컨버전 없이 투입 가능한 수준**에 근접한다. 게임·AR/VR·VFX 실무 관점에서 가장 주목할 요소.
