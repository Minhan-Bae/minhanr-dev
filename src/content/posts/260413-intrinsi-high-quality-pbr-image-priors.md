---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/PBR
- tech/T2I
- tech/diffusion
source_url: https://arxiv.org/abs/2504.01008
code_url: https://github.com/Peter-Kocsis/IntrinsiX
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: 텍스트 설명에서 baked-in lighting 없는 고품질 PBR 맵(albedo, roughness, metallic, normal)을
  생성. Cross-Intrinsic Attention으로 채널 간 정렬, 방 스케일 PBR 텍스처 생성까지 지원. 사용자 선호도 67.36%로
  RGBX/IID 압도.
slug: 260413-intrinsi-high-quality-pbr-image-priors
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2504.01008/gradient.png
  alt: 260413-intrinsi-high-quality-pbr-image-priors
date: '2026-04-13'
---


# IntrinsiX: High-Quality PBR Generation using Image Priors

**저자**: Peter Kocsis, Lukas Höllein, Matthias Nießner
**발표**: arXiv:2504.01008 (2025-03-31, v2 2025-11-27)
**프로젝트**: [peter-kocsis.github.io/IntrinsiX](https://peter-kocsis.github.io/IntrinsiX/)

## 핵심 요약

기존 text-to-image 모델은 scene lighting이 baked-in 되어 PBR 재질로 직접 활용이 불가능하다. IntrinsiX는 **이미지 프라이어를 활용하여 albedo, roughness, metallic, normal PBR 맵을 텍스트로부터 생성**한다. 각 PBR 채널에 대해 개별 모델을 사전학습한 뒤, **Cross-Intrinsic Attention (CIA)**으로 채널 간 일관성을 확보. 방 스케일 3D 장면의 PBR 텍스처 생성까지 지원하며, 게임/VR 콘텐츠 제작에 직접 활용 가능.

## 방법론

1. **Per-channel pre-training**: albedo, roughness, metallic, normal 각각에 대해 LoRA 기반 별도 모델 학습
2. **Cross-Intrinsic Attention (CIA)**: Key/Value 피처를 채널 간 연결(concatenate)하여 일관된 PBR 맵 생성
3. **CIA-Dropout**: 학습 시 일부 채널을 무작위 드롭 → 추론 시 누락 채널에 대한 robustness 확보
4. **Rendering Loss**: 생성된 PBR 맵을 differentiable renderer로 렌더링한 결과와 RGB 이미지의 일관성 손실
5. **Room-scale generation**: 텍스트 프롬프트로 방 전체의 PBR 텍스처 생성

## 정량 결과

### Baseline 비교

| 메트릭 | IntrinsiX | RGBX | IID | ColorfulShading |
|--------|-----------|------|-----|-----------------|
| A-OOD-FID↓ | **71.39** | 90.12 | 98.77 | 86.48 |
| A-PQ (사용자 선호)↑ | **67.36%** | 15.63% | 14.24% | 2.77% |
| Rendering Quality↑ | **3.93±0.88** | 2.96±0.98 | 2.95±1.03 | — |
| Specularity Quality↑ | **3.62±0.96** | 2.57±1.07 | 2.82±1.13 | — |

### Ablation

| 설정 | A-OOD-FID↓ | R-PQ↑ | S-PQ↑ |
|------|-----------|-------|-------|
| w/o Rendering Loss | 72.23 | 3.42 | 2.73 |
| w/o CIA-Dropout | 75.54 | 3.68 | 3.21 |
| **Full Method** | **71.39** | **3.93** | **3.62** |

### LoRA Rank 최적화

최적 rank: 64 (A-OOD-FID 67.25)

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [Peter-Kocsis/IntrinsiX](https://github.com/Peter-Kocsis/IntrinsiX) |
| 모델 | ✅ 체크포인트 공개 |
| 라이선스 | 미명시 |
| 요구사양 | A100 GPU, 학습 26시간, 추론 12초/이미지 |

## PathFinder R&D 적용 가능성

- **Phase 2 재질 생성**: VideoMatGen(비디오 기반)과 상호보완 — IntrinsiX는 **텍스트 기반 PBR 생성**으로 3DGS 씬에 재질을 입히는 대안 경로.
- **Room-scale PBR**: 방 전체 텍스처 생성은 PathFinder의 실내 VFX 장면 구축에 직접 활용.
- **CIA 아키텍처**: Cross-Intrinsic Attention은 DiffusionRenderer의 채널 간 일관성 문제 해결에 참조할 수 있는 범용 기법.
- **LoRA 기반**: 기존 T2I 모델에 LoRA 적용으로 경량 파인튜닝 → PathFinder 커스텀 도메인 적응에 유리.

## 한계점

1. **실내 편향**: Roughness/metallic이 실내 씬에 과적합 (정렬 단계 없이)
2. **학습 시간**: 단일 A100에서 26시간
3. **추론 속도**: 12초/이미지로 실시간 불가

## 관련 노트

- 260330_VideoMatGen_PBR_Materials_Video_Diffusion_VMTG — NVIDIA 비디오 기반 PBR 재질 생성
- 260413_Materialist_SingleImage_Inverse_Rendering_MTRL — 단일 이미지 역렌더링 + 물리 기반 편집
- PathFinder_Master — PathFinder 프로젝트 허브
