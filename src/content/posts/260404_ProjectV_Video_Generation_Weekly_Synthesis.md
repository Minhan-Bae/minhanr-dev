---
tags:
  - Weekly
  - Insight
  - Project-V
  - Video_Generation
source_type: synthesis
status: mature
created: 2026-04-04
period: 2026-W14
relevance: 5
related:
  - "260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP"
  - "260403_SANA-Video_Block_Linear_DiT_Efficient_Video_Generation_SNVD"
  - "260403_ViFeEdit_VideoFree_Tuner_Video_DiT_VFED"
  - "260404_DiffusionAsShader_3DAware_Video_Diffusion_Control_DaS"
  - "260401_Memesis_Video_Generation_Synthesis"
summary: 260404 Project-V Video Generation Weekly Synthesis 2026-W14 (4/1–4/4) 수집된 비디오 생성 논문 4건의 크로스 분석.
categories:
  - Visual
---

# 260404 Project-V Video Generation Weekly Synthesis

> 2026-W14 (4/1–4/4) 수집된 비디오 생성 논문 4건의 크로스 분석. 이전 Memesis Synthesis(4/1)를 기반으로 이번 주 기술 동향의 변화를 추적한다.

## 이번 주 핵심 발견

이번 주 4건의 논문은 공통적으로 **DiT(Diffusion Transformer) 아키텍처의 세분화·특화**라는 흐름을 보여준다. 지난주 Memesis Synthesis에서 정리한 "실시간 장시간 생성"과 "멀티 API 시대"의 기조 위에, 이번 주는 **비디오 후처리 자동화**(GenCompositor), **효율적 추론**(SANA-Video), **데이터 효율적 파인튜닝**(ViFeEdit), **3D-aware 제어**(DaS)라는 네 가지 직교적 혁신 축이 동시에 전개되고 있다.

특히 주목할 점은 세 가지다:

1. **비디오 데이터 없는 비디오 모델 튜닝**: [[260403_ViFeEdit_VideoFree_Tuner_Video_DiT_VFED|ViFeEdit]]가 100~250장의 이미지 쌍만으로 Video DiT를 편집 태스크에 적응시키는 데 성공했다. 이는 도메인 특화 비디오 편집 모델 구축의 진입 장벽을 근본적으로 낮추는 파라다임 전환이다.

2. **Linear Attention의 비디오 생성 실증**: [[260403_SANA-Video_Block_Linear_DiT_Efficient_Video_Generation_SNVD|SANA-Video]]가 O(n²)→O(n) 복잡도 전환으로 Wan 2.1-14B 대비 **53배 빠른 추론**을 2B 파라미터로 달성했다. MovieGen 학습 비용의 1%라는 효율성은 소규모 팀의 자체 모델 학습 가능성을 현실화한다.

3. **3D 메시 → 포토리얼 비디오의 직접 변환**: [[260404_DiffusionAsShader_3DAware_Video_Diffusion_Control_DaS|Diffusion as Shader]]가 "디퓨전 = 쉐이더" 메타포로 VFX 파이프라인의 중간 과정을 대폭 단축할 수 있음을 보여주었다.

## 개별 논문 분석

### 1. GenCompositor — 생성적 비디오 컴포지팅 (ICLR 2026)

[[260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP|GenCompositor]]는 전경 비디오를 배경 비디오에 사용자 지정 크기·모션 궤적·속성으로 합성하는 DiT 기반 프레임워크다. CogVideoX-5B-I2V를 백본으로 하며, ERoPE(Extended Rotary Position Embedding)로 전경-배경의 위치·레이아웃 관계를 인코딩한다. 61K 세트의 VideoComp 데이터셋과 SAM2 기반 자동 세그멘테이션을 결합했다. ICLR 2026 수록으로 학술적 검증이 완료되었으며, 코드가 완전 공개되어 있다. 다만 VRAM ≥ 40GB 요구와 CogVideoX 전용 설계라는 제약이 프로덕션 적용의 병목이다.

### 2. SANA-Video — Linear Attention 기반 효율적 비디오 생성 (ICLR 2026 Oral)

[[260403_SANA-Video_Block_Linear_DiT_Efficient_Video_Generation_SNVD|SANA-Video]]는 NVIDIA/MIT 공동 연구로, Block Linear Attention을 DiT에 도입하여 720×1280에서 분 단위 영상을 36초 만에 생성한다(Wan 2.1-14B 대비 53배). Constant-Memory KV Cache로 이론적으로 무제한 길이 확장이 가능하며, 64 H100 × 12일이라는 극히 효율적인 학습 비용을 달성했다. RTX 5090 단일 GPU 배포가 가능하고, HuggingFace diffusers·ComfyUI·SGLang 생태계에 이미 통합 완료되어 즉시 활용 가능한 성숙도를 보인다.

### 3. ViFeEdit — 비디오-프리 Video DiT 튜너

[[260403_ViFeEdit_VideoFree_Tuner_Video_DiT_VFED|ViFeEdit]]는 비디오 데이터 없이 2D 이미지 쌍 100~250장만으로 Video DiT를 편집 태스크에 적응시키는 최초의 프레임워크다. 아키텍처 리파라미터라이제이션으로 공간-시간 모델링을 구조적으로 분리하고, 시간 모듈은 동결하여 사전학습된 시간적 일관성을 보존한다. FLUX·Qwen-Image-Edit로 학습 데이터를 자동 생성할 수 있어, 도메인 특화 비디오 편집기를 극히 낮은 비용으로 구축 가능하다. Apache 2.0 라이선스로 상업 활용에 제약이 없다.

### 4. Diffusion as Shader — 3D-aware 비디오 디퓨전 제어

[[260404_DiffusionAsShader_3DAware_Video_Diffusion_Control_DaS|DaS]]는 3D 메시 렌더링 결과(position, normal, depth)를 컨디셔닝으로 사용하여 비디오 디퓨전을 3D-aware하게 만드는 프레임워크다. 카메라 제어, 모션 전이, 오브젝트 조작, 메시→비디오 생성을 하나의 아키텍처에서 수행한다. 10K 미만 비디오 + 8×H800 3일이라는 효율적 학습이 돋보이며, HuggingFace Space 데모가 라이브 상태다. 기존 VFX 워크플로우(모델링→텍스처→라이팅→렌더링)의 중간 과정을 "쉐이딩" 한 단계로 압축할 수 있는 잠재력이 있다.

## 크로스 분석: 트렌드와 패턴

### 패턴 1: DiT 아키텍처의 모듈화·특화 가속

4건 모두 DiT를 기반으로 하되, 각기 다른 방식으로 특화한다. GenCompositor는 DiT Fusion Block과 ERoPE로 컴포지팅에, SANA-Video는 Block Linear Attention으로 효율성에, ViFeEdit는 Architectural Reparameterization으로 데이터 효율에, DaS는 3D 트래킹 컨디셔닝으로 3D 제어에 특화했다. DiT가 비디오 생성의 **범용 기반 아키텍처로 확고히 자리잡았으며**, 이제 경쟁은 DiT 위에서의 모듈 설계로 이동했다.

### 패턴 2: 학습 효율 혁명의 다방면 전개

SANA-Video(MovieGen 1% 비용), ViFeEdit(이미지 100~250장, 비디오 0건), DaS(10K 비디오, 3일)까지 — 세 논문이 각자 다른 차원에서 학습 효율의 극한을 보여주고 있다. 이는 지난주 [[260401_Memesis_Video_Generation_Synthesis|Memesis Synthesis]]에서 지적한 "소규모 팀의 자체 모델 학습 가능성"이 이번 주에 더욱 구체화되고 있음을 의미한다.

### 패턴 3: VFX 파이프라인 재편의 복수 진입점

GenCompositor(합성 자동화) + DaS(3D→비디오 직접 변환) + ViFeEdit(스타일 통일)을 조합하면, 전통적 VFX 후처리 파이프라인의 상당 부분을 AI로 대체하는 End-to-End 워크플로우가 구성 가능하다. 이 세 기술은 직교적이면서 보완적이다.

### 패턴 4: 배포 생태계 성숙도의 양극화

SANA-Video는 diffusers/ComfyUI/SGLang 통합이 완료된 반면, GenCompositor는 40GB VRAM + CogVideoX 전용이라는 제약이 있다. 논문의 학술적 기여도와 실무 배포 가능성은 여전히 별개의 축이며, Project-V는 **배포 성숙도**를 1차 필터로 우선 적용해야 한다.

## 이번 주 액션

1. **SANA-Video ComfyUI 워크플로우 구축 및 벤치마크**: diffusers 통합이 완료된 SANA-Video 2B 모델을 ComfyUI에 편입하고, 지난주 [[260401_Memesis_Video_Generation_Synthesis|Memesis Synthesis]]의 Helios Distilled PoC와 동일 프롬프트셋으로 품질/속도/VRAM을 비교한다. RTX 5090 단일 GPU 환경에서 실측한다.

2. **ViFeEdit 도메인 특화 PoC 설계**: VFX 스타일 이미지 쌍 150장을 준비하고, ViFeEdit 어댑터를 학습시켜 Project-V의 도메인 특화 비디오 편집기 프로토타입을 만든다. FLUX.1-dev로 학습 데이터 자동 생성 파이프라인도 함께 구축한다.

3. **GenCompositor + DaS 파이프라인 아키텍처 스케치**: DaS로 3D 메시에서 배경 비디오를 생성하고, GenCompositor로 전경 요소를 합성하는 2단계 파이프라인의 아키텍처를 [[020_Projects/023_Trinity_x/TrinityX_Master|TrinityX Master]] 문서에 스케치한다. VRAM 요구량과 백본 호환성(CogVideoX vs Wan) 제약을 정리한다.

## 다음 주 관찰 포인트

- **SANA-Video의 커스텀 도메인 파인튜닝 가이드**: 현재 미제공 상태. NVIDIA가 공개할 경우 Project-V의 자체 모델 학습 전략에 직접 반영 필요.
- **ViFeEdit의 Wan 2.7 / CogVideoX 호환성 검증**: 논문에서 미검증된 최신 백본과의 호환성. 커뮤니티 리포트를 추적한다.
- **GenCompositor의 멀티 백본 확장**: CogVideoX 전용에서 Wan/HunyuanVideo로 확장하는 후속 연구 여부를 모니터링.
- **DaS + [[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation|Lyra]] 역방향 파이프라인**: DaS(3D→비디오)와 Lyra(비디오→3DGS)를 결합한 양방향 3D-비디오 변환의 가능성.
- **ICLR 2026 본회의 발표(4/23~27)**: GenCompositor, SANA-Video 모두 ICLR 2026 수록작. 본회의에서의 후속 데모와 업데이트를 주시한다.
