---
status: mature
tags:
  - 3DGS
  - few-shot
  - inpainting
  - diffusion-prior
  - novel-view-synthesis
  - ICCV2025
source_type: paper
source_url: https://arxiv.org/abs/2503.10860
code_available: true
code_url: https://github.com/avinashpaliwal/RI3D
created: 2026-04-04
relevance: 4
web_searched: 2026-04-04
related:
  - "[[260402_GaussVideoDreamer_VideoD_InconsistencyAware_3DGS_GVDR]]"
  - "[[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation]]"
  - "[[260403_InverFill_OneStep_Inversion_FewStep_Diffusion_Inpainting_IVFL]]"
summary: "RI3D: Few-Shot Gaussian Splatting With Repair and Inpainting Diffusion Priors ICCV 2025 | Avinash Paliwal et al."
categories:
  - Visual
---

# RI3D: Few-Shot Gaussian Splatting With Repair and Inpainting Diffusion Priors

> **ICCV 2025** | Avinash Paliwal et al. (Texas A&M University)
> arXiv: 2503.10860 | [Project Page](https://people.engr.tamu.edu/nimak/Papers/RI3D/index.html) | [GitHub](https://github.com/avinashpaliwal/RI3D) (코드 공개 예정)

## 개요

RI3D는 극소수(few-shot) 입력 이미지로부터 고품질 3D Gaussian Splatting 복원을 달성하는 새로운 접근법이다. 핵심 아이디어는 뷰 합성 과정을 **가시 영역 복원(Repair)**과 **비가시 영역 생성(Inpainting)**이라는 두 개의 독립적 태스크로 분리하고, 각각에 특화된 맞춤형 디퓨전 모델을 도입하는 것이다. 기존 few-shot NVS 방법들이 단일 모델로 양쪽을 동시에 처리하려 시도한 반면, RI3D는 각 태스크의 성격이 근본적으로 다르다는 점에 착안하여 이원화 전략을 취한다.

## 핵심 방법론

### 2단계 최적화 전략

1. **Stage 1 — Repair Model**: 렌더링된 이미지를 입력으로 받아 대응하는 고품질 이미지를 예측. 이를 pseudo ground truth로 사용하여 GS 최적화를 제약. 가시 영역의 텍스처 디테일과 기하학적 정확도를 우선 확보.

2. **Stage 2 — Inpainting Model**: 관측되지 않은 영역의 디테일을 환각(hallucinate)하면서, Stage 1에서 확보한 가시 영역과의 일관성을 유지하도록 추가 최적화.

### Gaussian 초기화 기법

- 3D-consistent하고 smooth한 depth와 고해상도 relative depth를 결합한 **per-image depth estimation** 기반 초기화
- 기존 SfM 포인트 기반 초기화의 한계를 극복하여 sparse input에서도 안정적 수렴

## 핵심 수치

| 항목 | 내용 |
|------|------|
| 입력 | 극소수 이미지 (3~9장) |
| 백본 | 3D Gaussian Splatting |
| 디퓨전 모델 | 2개 (Repair + Inpainting), 각각 개인화 |
| 학회 | ICCV 2025 (accept) |
| 코드 | GitHub 공개 예정 (2026.04 기준 "coming soon") |

## 아키텍처 요약

```
Input Images (3~9장)
    ↓
Per-image Depth Estimation (3D-consistent + relative depth 결합)
    ↓
Gaussian Initialization
    ↓
Stage 1: Repair Diffusion Model → 가시 영역 pseudo GT 생성 → GS 최적화
    ↓
Stage 2: Inpainting Diffusion Model → 비가시 영역 생성 + 일관성 최적화
    ↓
High-Quality Novel View Synthesis
```

## 실용성 체크

| 항목 | 평가 |
|------|------|
| 프로덕션 적용 가능성 | ★★★☆☆ — 코드 미공개 상태, 공개 후 평가 필요 |
| 데이터 효율성 | ★★★★★ — 3~9장으로 고품질 복원 가능 |
| 기존 파이프라인 통합 | ★★★★☆ — 3DGS 기반이므로 GS 에코시스템과 직접 호환 |
| 실시간성 | ★★★☆☆ — 디퓨전 모델 2회 추론 필요, 오프라인 품질 우선 |

## 나에게 주는 시사점

### Project-R (Diffusion Renderer/GS) — 핵심 연관
- **Few-shot 복원의 새로운 프레임**: Repair/Inpainting 분리 전략은 Project-R의 sparse view reconstruction 모듈에 직접 적용 가능. 특히 실제 촬영 환경에서 카메라 수가 제한적인 경우의 품질 향상에 핵심적.
- **Depth 초기화 전략**: 3D-consistent depth와 relative depth를 결합하는 접근법은 Project-R의 depth prior 파이프라인에 참고할 만한 설계.

### Project-C (Inpainting 캐릭터 교체)
- **Inpainting 디퓨전 모델의 3D 활용**: 2D 인페인팅을 3D 재구성에 활용하는 방식은 Project-C의 캐릭터 교체 파이프라인에서 3D-aware inpainting으로 확장할 수 있는 실마리.

## 관련 볼트 노트

- [[260402_GaussVideoDreamer_VideoD_InconsistencyAware_3DGS_GVDR]] — 비디오 디퓨전 기반 3DGS 생성, 다중뷰 일관성 문제 공유
- [[260401_Lyra_NVIDIA_Video_Diffusion_3DGS_Self_Distillation]] — 비디오 디퓨전→3DGS 자기증류, 유사한 디퓨전→3DGS 파이프라인
- [[260403_InverFill_OneStep_Inversion_FewStep_Diffusion_Inpainting_IVFL]] — 디퓨전 기반 인페인팅 접근법 비교

## 원본 링크

- arXiv: https://arxiv.org/abs/2503.10860
- Project: https://people.engr.tamu.edu/nimak/Papers/RI3D/index.html
- GitHub: https://github.com/avinashpaliwal/RI3D

## WebSearch 보강 (2026-04-04)

### 학회 채택 및 공식 발표
- **ICCV 2025 accept** 확인 — CVF Open Access에 정식 논문 PDF 공개
- 공식 proceedings PDF: https://openaccess.thecvf.com/content/ICCV2025/papers/Paliwal_RI3D_Few-Shot_Gaussian_Splatting_With_Repair_and_Inpainting_Diffusion_Priors_ICCV_2025_paper.pdf

### 코드 공개 상태
- **GitHub 리포 활성**: https://github.com/avinashpaliwal/RI3D — arXiv v2 (2026-01-21) 업데이트와 함께 코드 공개 진행
- 기존 노트의 "coming soon" 상태에서 **코드 공개됨**으로 변경

### 저자 정보
- Avinash Paliwal, Xilong Zhou, Wei Ye, Jinhui Xiong, Rakesh Ranjan, Nima Khademi Kalantari
- Texas A&M University 주도

### 후속/관련 연구
- **GSFix3D** (3DV 2026 accept): "Diffusion-Guided Repair of Novel Views in Gaussian Splatting" — RI3D의 Repair 개념을 확장, 메시+3DGS 양쪽 모두에서 diffusion 기반 repair를 수행. 직접적 후속 연구.
  - GitHub: https://github.com/GSFix3D/GSFix3D
  - 프로젝트: https://gsfix3d.github.io/
- **SE-GS** (ICCV 2025 Oral): "Self-Ensembling Gaussian Splatting for Few-Shot Novel View Synthesis" — 동일 문제(few-shot NVS)에 대한 경쟁 접근법
  - GitHub: https://github.com/sailor-z/SE-GS

### 보강 요약
- ICCV 2025 proceedings 정식 공개 확인 → **status: mature 승격**
- 코드 공개 완료 (2026-01 업데이트)
- GSFix3D(3DV 2026)가 Repair 개념의 직접 후속 연구로 등장 — Project-R에서 함께 트래킹할 가치 있음
