---
tags:
- AI_R&D_Paper
- domain/3d
- tech/3DGS
- tech/composition
- tech/lighting
- venue/ICLR2025
source_url: https://arxiv.org/abs/2510.07729
code_available: true
model_available: false
license: unknown
status: published
created: 2026-04-13
summary: 3DGS 씬에 오브젝트를 물리적으로 조화롭게 합성하는 Surface Octahedral Probes(SOPs). SOPs가 조명/차폐
  정보를 저장하여 실시간 그림자 연산 + 2배 빠른 복원. +2dB PSNR, 40% 높은 3D consistency, 26 FPS 실시간, 편집
  36초.
slug: 260413-com-gs-3d-object-scene-composition
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2510.07729/gradient.png
  alt: 260413-com-gs-3d-object-scene-composition
date: '2026-04-13'
---



# ComGS: Efficient 3D Object-Scene Composition via Surface Octahedral Probes

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-com-gs-3d-object-scene-composition/fig-1.png)
*Source: [arXiv 2510.07729 (Fig. 1)](https://arxiv.org/abs/2510.07729)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260413-com-gs-3d-object-scene-composition/fig-2.svg)
*Source: [nju-3dv.github.io](https://nju-3dv.github.io/projects/ComGS/)*

**발표**: ICLR 2025 (arXiv:2510.07729)
**프로젝트**: [nju-3dv.github.io/projects/ComGS](https://nju-3dv.github.io/projects/ComGS/)

## 핵심 요약

3DGS 씬에 오브젝트를 합성할 때 시각적 조화와 물리적으로 타당한 그림자가 핵심 과제. ComGS는 **Surface Octahedral Probes(SOPs)**라는 표면 기반 조명/차폐 저장 구조를 도입하여, 비싼 ray tracing 없이 보간으로 효율적 3D 조명 쿼리를 수행. Reconstruction → Edit → Rendering 3단계 파이프라인.

## 방법론

1. **Surface Octahedral Probes (SOPs)**: 표면 위에 배치된 팔면체 프로브가 조명/차폐 정보 저장
2. **보간 기반 쿼리**: Ray tracing 대신 프로브 간 보간으로 3D 조명 정보 획득 → 실시간
3. **3단계 파이프라인**: (1) Reconstruction (2) Edit (3) Rendering
4. **Object insertion**: 오브젝트 삽입 시 조명/그림자를 자동으로 조화롭게 합성

## 정량 결과

| 메트릭 | 값 |
|--------|---|
| 기존 대비 PSNR 향상 | **+2 dB** |
| 3D Consistency 향상 | **+40%** |
| Harmony 향상 | **+67%** |
| 렌더링 FPS | **~26 FPS** |
| 편집 시간 | **36초** |
| 복원 속도 향상 | **2× faster** (vs ray tracing) |

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ 공개 (프로젝트 페이지) |
| 모델 | ❌ (씬별 최적화) |
| 라이선스 | 미명시 |
| 요구사양 | GPU, 26 FPS 실시간 |

## PathFinder R&D 적용 가능성

- **Phase 2-3 Object Insertion**: PathFinder의 3DGS 씬에 VFX 오브젝트를 물리적으로 조화롭게 합성. DiffusionRenderer의 object insertion과 달리 **3D 네이티브** 합성.
- **SOPs 조명 쿼리**: Ray tracing 없이 실시간 조명 정보 접근은 PathFinder의 120fps 목표에 기여.
- **26 FPS**: GI 포함 실시간 합성이 가능한 수준.
- **ICLR 2025**: 학술 검증 완료.

## 한계점

1. **SOP 해상도**: 프로브 배치 밀도에 따른 디테일 한계
2. **정적 조명**: 동적 조명 변화 미지원

## 관련 노트

- 260413_3DGS_Inverse_Rendering_Approximated_GI_3GIR — Screen-space GI (보완적)
- PathFinder_Master

## 상세 배경 (보강)

ComGS가 정조준하는 문제는 3D Gaussian Splatting 기반 **object-scene composition의 두 가지 고질**이다. 첫째, GS radiance field에 **조명과 그림자 정보가 이미 베이크**되어 있어 다른 씬에 객체를 옮기면 외형이 어긋난다. 둘째, 기존 Gaussian 기반 inverse rendering은 ray tracing 의존도가 높아 실시간성이 떨어지고, learning-based 방법은 단일 이미지 기반이라 viewpoint 민감도가 크다.

저자들은 이를 **Surface Octahedral Probes(SOPs)**라는 자료구조로 돌파한다. SOP는 표면 위 샘플 지점들에 조명·가림 정보를 저장하는 팔면체 프로브로, 3D 쿼리 시 **interpolation만으로 조명을 재구성**할 수 있다. ray tracing을 우회하면서 2배 이상 빠른 복원과 실시간 그림자 계산이 가능해진다. Scene lighting estimation은 **객체 배치 지점의 360° radiance field를 fine-tune한 diffusion으로 완성**하는 방식으로 단순화했다 — 풀-씬 조명 추정 대신 "배치 지점 국소 조명"만 풀면 합성 결과의 80% 이상이 해결된다는 관찰이 핵심.

## 시사점 (보강)

- **28 FPS 실시간 + 36초 편집**이라는 수치는 프로덕션 워크플로우 관점에서 결정적이다. Offline relighting/compositing이 수십 초~수 분 걸리는 것과 비교해 **대화형 편집 루프**가 가능해지는 임계를 넘었다.
- **SOP 자료구조의 범용성**: 팔면체 프로브 발상은 조명 외에도 material, motion 등 다른 surface-attached attribute를 동일한 방식으로 다룰 수 있는 일반화 여지가 있다. 3DGS 파이프라인의 **조명/재질 저장 표준**으로 확장될 가능성이 열려 있다.
- **ICLR 2025 발표**: 채택 자체가 3DGS inverse rendering 커뮤니티에서의 의미 있는 진전을 시사한다. 후속 작업은 SOP density 결정, multi-bounce 간접광 지원 확장 등을 파고들 것으로 보인다.
