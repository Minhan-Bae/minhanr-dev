---
tags:
- AI_R&D_Paper
- domain/rendering
- tech/lighting-normalization
- tech/transformer
- venue/CVPRW2025
source_url: https://openaccess.thecvf.com/content/CVPR2025W/NTIRE/html/Serrano-Lozano_PromptNorm_Image_Geometry_Guides_Ambient_Light_Normalization_CVPRW_2025_paper.html
code_url: https://github.com/davidserra9/promptnorm
code_available: true
model_available: true
license: unknown
status: published
created: 2026-04-13
summary: NTIRE 2025 Ambient Lighting Normalization Challenge 참가작. Monocular depth
  estimator로 추출한 surface normal을 transformer의 Query로 인코딩하여 조명 정규화를 기하학적으로 가이드. 강한
  그림자/극단 색 왜곡에서 기존 SOTA 초과 성능.
slug: 260413-prompt-norm-geometry-ambient-light-normalization
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260413-prompt-norm-geometry-ambient-light-normalization&category=Research
  alt: 260413-prompt-norm-geometry-ambient-light-normalization
date: '2026-04-13'
---


# PromptNorm: Image Geometry Guides Ambient Light Normalization

**저자**: David Serrano-Lozano, Francisco A. Molina-Bakhos 외
**발표**: CVPR 2025 Workshop (NTIRE) — Ambient Lighting Normalization Challenge

## 핵심 요약

Ambient lighting normalization은 이미지 전체의 그림자를 제거하고 조명을 표준화하는 태스크로, 강한 그림자와 극단적 색 왜곡에서 기존 방법이 한계를 보인다. PromptNorm은 **단안 depth estimator**로 surface normal을 추출하고, 이를 transformer 블록의 **Query 입력으로 인코딩**하여 attention map을 기하학적으로 동적 가중한다. 저수준 geometric representation이 조명 정규화를 물리적으로 가이드하는 새로운 접근.

## 방법론

1. **Monocular depth estimation**: SOTA depth estimator로 입력 이미지에서 depth map 추출
2. **Surface normal 변환**: Depth map → surface normal 변환
3. **Geometric encoding**: Surface normal을 저수준 geometric representation으로 인코딩
4. **Transformer Query 주입**: 인코딩된 기하 정보를 transformer 블록의 Query로 사용 → attention map이 표면 방향에 따라 동적으로 가중
5. **조명 정규화 출력**: 기하 정보로 가이드된 정규화 이미지 생성

## 정량 결과

- NTIRE 2025 Ambient Lighting Normalization Challenge에서 **기존 SOTA 초과** 성능
- PSNR, SSIM, LPIPS, ΔE 메트릭에서 포괄적 우위 (구체적 수치는 논문 본문 참조)
- 특히 강한 그림자와 극단적 색 왜곡 시나리오에서 두드러진 개선

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [davidserra9/promptnorm](https://github.com/davidserra9/promptnorm) |
| 모델 | ✅ 체크포인트 공개 |
| 라이선스 | 미명시 |
| 요구사양 | Transformer 기반 (GPU 필요) |

## PathFinder R&D 적용 가능성

- **De-lighting 전처리**: PathFinder의 역렌더링 파이프라인 전 단계에서 ambient light normalization을 적용하면 G-buffer 추출 정확도 향상 가능.
- **Geometry-guided attention**: Surface normal → Query 인코딩 패턴은 G-buffer 조건부 렌더링에서 기하 정보 활용의 참고 사례.
- **NTIRE 벤치마크**: PathFinder의 de-lighting 모듈 성능 평가에 NTIRE 데이터셋/메트릭 활용 가능.

## 한계점

1. **전처리 의존**: Monocular depth estimator의 정확도에 바운드
2. **NTIRE 특화**: Challenge 데이터셋에 최적화되어 범용 성능은 추가 검증 필요
3. **Workshop paper**: 본 학회 대비 제한된 페이지/실험

## 관련 노트

- 260413_DNF_Intrinsic_NoiseFree_Indoor_Inverse_Rendering_DNFI — 실내 역렌더링 (조명 정규화와 보완적)
- 260413_Neural_LightRig_MultiLight_Diffusion_Normal_Material_NLRG — Multi-light 기반 조명 분리
- PathFinder_Master — PathFinder 프로젝트 허브
