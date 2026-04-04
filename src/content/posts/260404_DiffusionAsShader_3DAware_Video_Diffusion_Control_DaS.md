---
status: mature
tags:
  - video-generation
  - 3D-aware
  - diffusion
  - camera-control
  - motion-transfer
  - mesh-to-video
  - SIGGRAPH2025
source_type: paper
source_url: https://arxiv.org/abs/2501.03847
code_available: true
code_url: https://github.com/IGL-HKUST/DiffusionAsShader
created: 2026-04-04
relevance: 4
web_searched: 2026-04-04
related:
  - "[[260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP]]"
  - "[[260402_VideoWorldModels_Efficient_Paradigms_Architectures_VWME]]"
  - "[[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation]]"
---

# Diffusion as Shader (DaS): 3D-aware Video Diffusion for Versatile Video Generation Control

> Ye et al. (EXCAI) | arXiv: 2501.03847
> [HuggingFace Space](https://huggingface.co/spaces/EXCAI/Diffusion-As-Shader) | [Papers with Code](https://paperswithcode.com/paper/diffusion-as-shader-3d-aware-video-diffusion)

## 개요

Diffusion as Shader(DaS)는 3D 트래킹 비디오를 제어 입력으로 활용하여 비디오 디퓨전 프로세스를 본질적으로 3D-aware하게 만드는 새로운 프레임워크이다. 기존 비디오 생성 제어 방식이 2D 시그널(optical flow, pose skeleton 등)에 의존한 반면, DaS는 3D 메시 렌더링 결과를 직접 컨디셔닝으로 사용함으로써 카메라 제어, 모션 전이, 오브젝트 조작, 메시→비디오 생성 등 다양한 3D-aware 비디오 제어 태스크를 하나의 통합 아키텍처에서 수행한다.

핵심 혁신은 **"쉐이더"라는 메타포**: 3D 장면에서 렌더링된 기본 정보(위치, 법선, 깊이 등)를 디퓨전 모델이 "쉐이딩"하여 포토리얼리스틱 비디오로 변환하는 구조이다. 이 접근법은 기존의 2D 기반 제어와 달리 물리적으로 정확한 3D 일관성을 보장한다.

## 핵심 기능

### 지원 태스크
1. **Mesh-to-Video Generation**: 3D 메시 렌더링 → 포토리얼 비디오
2. **Camera Control**: 정밀한 카메라 궤적 제어
3. **Motion Transfer**: 소스 모션을 다른 장면/객체에 전이
4. **Object Manipulation**: 3D 공간에서의 객체 조작 반영

### 제어 입력
- 3D 트래킹 비디오 (메시 렌더링 결과)
- 렌더 패스 정보: position, normal, depth 맵 등

## 핵심 수치

| 항목 | 내용 |
|------|------|
| 학습 데이터 | < 10,000 비디오 |
| 학습 비용 | 8x H800 GPU, 3일 |
| 기반 모델 | 사전학습 비디오 디퓨전 모델 + 파인튜닝 |
| 데모 | HuggingFace Space 라이브 |

## 아키텍처 요약

```
3D Scene/Mesh
    ↓
3D Tracking Video Rendering (position, normal, depth)
    ↓
Control Signal Encoding
    ↓
Video Diffusion Model (pre-trained + fine-tuned)
    ↓  ← 3D tracking video as conditioning
Photorealistic Video Output
    ↓
Optional: Camera / Motion / Object Control
```

## 실용성 체크

| 항목 | 평가 |
|------|------|
| 프로덕션 적용 가능성 | ★★★★☆ — HF Space 데모 존재, 즉시 테스트 가능 |
| 학습 효율 | ★★★★★ — 10K 미만 비디오, 3일 학습. 매우 효율적 |
| VFX 파이프라인 통합 | ★★★★★ — 3D 메시 → 비디오 변환이 기존 VFX 워크플로우와 직결 |
| 제어 정밀도 | ★★★★☆ — 3D 기반으로 2D 제어 대비 물리적 정확성 우위 |
| 실시간성 | ★★★☆☆ — 디퓨전 기반이므로 추론 비용 존재 |

## 나에게 주는 시사점

### Project-V (영상생성 플랫폼) — 핵심 연관
- **VFX 파이프라인의 게임체인저 후보**: 기존 VFX는 모델링→텍스처→라이팅→렌더링의 순차 과정. DaS는 3D 메시만으로 포토리얼 비디오를 직접 생성하여 중간 과정을 대폭 단축. Project-V의 "빠른 프리비즈→최종 출력" 파이프라인에 이상적.
- **학습 비용의 혁신**: 10K 비디오 + 3일 학습으로 고품질 3D-aware 비디오 생성 달성. Project-V의 도메인 특화 모델 파인튜닝 전략에 직접 적용 가능한 효율성.

### Project-R (Diffusion Renderer/GS)
- **Shader 메타포의 확장**: DaS의 "디퓨전 = 쉐이더" 개념은 Project-R의 DiffusionRenderer 연구와 직접 맥이 닿음. 두 접근법의 비교 분석이 Project-R의 방향 설정에 유용.
- **3D Tracking Video → GS**: DaS의 출력을 3DGS로 역투영하면 비디오 기반 3D 복원의 새 경로가 열림.

### Project-3D (Houdini/LLM)
- **Houdini 메시 → DaS 비디오**: Houdini에서 절차적으로 생성한 3D 메시를 DaS로 즉시 비디오화할 수 있다면, Project-3D의 "코드→3D→영상" 파이프라인이 완성됨.

## 관련 볼트 노트

- [[260403_GenCompositor_Generative_Video_Compositing_DiT_GCMP]] — DiT 기반 비디오 합성, 제어 메커니즘 비교
- [[260402_VideoWorldModels_Efficient_Paradigms_Architectures_VWME]] — 비디오 월드 모델 효율화, DaS의 효율적 학습과 맥락 공유
- [[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation]] — 비디오 디퓨전→3DGS 파이프라인, DaS의 역방향(3D→비디오)과 보완적

## 원본 링크

- arXiv: https://arxiv.org/abs/2501.03847
- HuggingFace Space: https://huggingface.co/spaces/EXCAI/Diffusion-As-Shader
- Papers with Code: https://paperswithcode.com/paper/diffusion-as-shader-3d-aware-video-diffusion

## WebSearch 보강 (2026-04-04)

### 학회 채택
- **SIGGRAPH 2025 accept** 확인 (Conference Papers)
- ACM DOI: https://dl.acm.org/doi/10.1145/3721238.3730607

### 공식 리소스
- **GitHub (공식)**: https://github.com/IGL-HKUST/DiffusionAsShader — IGL-HKUST 소속 공식 리포. 코드, 모델 가중치, 추론 스크립트 공개.
- **프로젝트 페이지**: https://igl-hkust.github.io/das/
- **HuggingFace 모델**: https://huggingface.co/EXCAI/Diffusion-As-Shader
- **HuggingFace Space (데모)**: https://huggingface.co/spaces/EXCAI/Diffusion-As-Shader

### 저자 소속
- HKUST (홍콩과기대), Zhejiang University, HKU, NTU, Wuhan University, Texas A&M 등 다기관 공동 연구

### 후속 연구 동향
- 3D-aware 비디오 제어 패러다임이 SIGGRAPH 2025에서 주요 트렌드로 부상
- DaS의 "쉐이더 메타포"는 VFX 파이프라인 간소화 방향의 대표 사례로 주목

### 보강 요약
- SIGGRAPH 2025 채택으로 peer-review 검증 완료 → **status: mature 승격**
- 공식 GitHub 리포(IGL-HKUST) 확인, HF Space 데모 라이브 유지 중
- source_type을 paper-review로 유지하되 code_url을 공식 GitHub으로 갱신
