---
author: MinHanr
categories:
  - VFX
date: '2026-03-28'
draft: false
slug: 260328-gaussiansplatting-industrystandard-gltf-openusd
summary: Khronos glTF + OpenUSD 26.03의 Gaussian Splatting 표준화는 our rendering research project의 3DGS 기반
  실시간 렌더링 파이프라인에 산업 표준 호환성을 부여. Nuke 17.0 공식 지원으로 VFX 프로덕션 워크플로 직접 통합 경로 확보.
tags:
- AI_Trend
title: Gaussian Splatting 산업 표준화 — glTF 확장, OpenUSD 26.03, Nuke 17.0 공식 지원
---

# Gaussian Splatting 산업 표준화 — glTF 확장, OpenUSD 26.03, Nuke 17.0 공식 지원

> 2026년 초, 3D Gaussian Splatting(3DGS)이 연구 단계를 넘어 산업 표준으로 진입하는 결정적 전환점에 도달했다. Khronos Group의 glTF 2.0 확장, OpenUSD 26.03의 네이티브 스키마, Foundry Nuke 17.0의 공식 지원이 동시다발적으로 발표되며, 3DGS의 프로덕션 파이프라인 통합이 현실화되었다.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260328-gaussiansplatting-industrystandard-gltf-openusd/fig-2.jpg)
*Source: [radiancefields.substack.com](https://radiancefields.substack.com/p/gaussian-splatting-in-february-2026)*

## 개요

2023년 INRIA의 원 논문 발표 이후 3D Gaussian Splatting은 NeRF를 대체하는 실시간 렌더링 기술로 급부상했으나, 산업 표준 부재로 프로덕션 도입에 제약이 있었다. 2026년 1분기, 3대 표준화 기관/도구가 동시에 3DGS 지원을 공식화하면서 이 장벽이 제거되고 있다. 이는 단순한 기술 트렌드가 아니라, VFX/시각화/게임 전 산업에 걸친 인프라 전환을 의미한다.

## 핵심 내용

### 1. Khronos Group — KHR_gaussian_splatting glTF 2.0 확장

Khronos Group은 3DGS를 glTF 2.0에 저장하기 위한 KHR_gaussian_splatting 베이스라인 확장의 릴리스 후보(Release Candidate)를 발표했다. glTF는 "3D의 JPEG"로 불리는 가장 널리 채택된 3D 자산 전달 포맷이다.

핵심 의미:
- **호환성**: glTF를 지원하는 모든 뷰어, 엔진, 도구에서 3DGS 자산을 읽고 쓸 수 있는 표준 경로 확보
- **웹 네이티브**: WebGL/WebGPU 기반 브라우저 렌더링에서 3DGS를 직접 로드 가능
- **생태계 규모**: glTF를 지원하는 수백 개의 기존 도구가 잠재적 3DGS 호환 도구로 전환

### 2. OpenUSD 26.03 — 네이티브 Gaussian Splat 스키마

Alliance for OpenUSD(AOUSD)가 발표한 OpenUSD v26.03에서 3D Gaussian Splat을 위한 새로운 스키마가 추가되었다. OpenUSD는 Pixar가 개발하고 NVIDIA, Apple, Adobe, Autodesk 등이 지원하는 VFX/영화 산업의 사실상 표준 씬 기술 포맷이다.

핵심 의미:
- **프로덕션 파이프라인 통합**: Houdini, Maya, Blender 등 OpenUSD를 지원하는 모든 DCC 도구에서 3DGS 자산을 씬 그래프에 통합 가능
- **합성 워크플로**: CG 자산과 3DGS 캡처 자산을 동일 씬에서 합성하는 하이브리드 렌더링 가능
- **산업 합의**: NVIDIA, Apple, Pixar가 공동으로 3DGS의 프로덕션 유효성을 인정한 신호

### 3. Foundry Nuke 17.0 — VFX 합성 공식 지원

VFX 합성의 산업 표준인 Foundry Nuke가 버전 17.0에서 Gaussian Splatting 지원을 공식 추가했다. 이는 VFX 프로덕션에서 3DGS의 실용적 도입을 가능하게 하는 결정적 이정표이다.

### 4. OctaneRender 2026 — 스플랫 풀 패스 트레이싱

OTOY의 OctaneRender 2026 업데이트에서 스플랫의 풀 패스 트레이싱이 구현되었다. 이는 3DGS 자산에 물리 기반 조명(PBR)을 적용하여 포토리얼리스틱 렌더링이 가능해졌음을 의미한다.

### 5. 모바일/엣지 디바이스 확장 — Mobile-GS (ICLR 2026)

ICLR 2026에서 발표된 Mobile-GS는 모바일 디바이스에서의 실시간 Gaussian Splatting을 위한 최적화 기법을 제안했다. 높은 연산 비용과 대용량 저장 문제를 해결하여 엣지 디바이스에서의 효율적 추론을 가능하게 한다.

### 6. 실시간 성능 현황

데스크톱 GPU 기준 현재 3DGS의 실시간 성능:
- **렌더링 속도**: 1080p에서 100~200+ FPS
- **정렬 알고리즘**: GPU 가속 Radix Sort로 16x16 픽셀 타일 분할, 깊이 기준 정렬
- **합성 방식**: 전면→후면(front-to-back) 알파 컴포지팅

### 7. 실전 적용 사례

- **Zillow SkyTours**: 최초의 대규모 상용 3DGS 서비스 (부동산 3D 투어)
- **Apartments.com + Matterport**: 외부 3DGS 캡처 지원
- **2026 밀라노 올림픽**: 스키, 하키, 피겨 스케이팅 중계에 3DGS 적용
- **Proof Inc.**: 《쥬라기 월드》 프리비주얼라이제이션에 3DGS 활용

## 출처

- [Khronos Group glTF Gaussian Splatting Extension 발표](https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release)
- [OpenUSD v26.03 릴리스 노트 — AOUSD](https://aousd.org/blog/openusd-v26-03/)
- [Gaussian Splatting in February 2026 — Radiance Fields](https://radiancefields.substack.com/p/gaussian-splatting-in-february-2026)
- [Mobile-GS: Real-time Gaussian Splatting for Mobile Devices — ICLR 2026](https://iclr.cc/virtual/2026/poster/10006810)
- [3D Gaussian Splatting Guide 2026 — Utsubo](https://www.utsubo.com/blog/gaussian-splatting-guide)
- [Gaussian Splatting Student Guide 2026 — Medium](https://medium.com/@Jamesroha/gaussian-splatting-a-complete-student-guide-to-3d-capture-in-2026-1195a6265870)