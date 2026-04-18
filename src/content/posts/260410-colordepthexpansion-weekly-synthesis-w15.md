---
title: ColorDepthExpansion W15 Synthesis — 주파수 도메인 HDR/BDE 수렴
status: published
slug: 260410-colordepthexpansion-weekly-synthesis-w15
summary: '[[260408WMNetWaveletHDRVideoReconstruction|WMNet]]은 Wavelet 도메인 Masked Image
  Modeling으로 LDR→HDR 비디오 복원 SOTA를 달성했다(PSNR 36.23 dB, HDRTV4K-Scene).'
created: 2026-04-10
tags:
- AI_R&D_Paper
- domain/color-depth
- Synthesis
week: W15
date: '2026-04-10'
author: MinHanr
---

# ColorDepthExpansion W15 Synthesis — 주파수 도메인 HDR/BDE 수렴

> W15(04-07~10) 동안 Color Depth 클러스터에 신규 5건(WMNet, SingleHDR, BitNet, FMNet, CSRNet)이 추가되어 총 33건. 사용자가 CDE를 project_weights 1.8로 정식 수용했으며, 이번 주 핵심 키워드는 **주파수 도메인 분리**다.

## 1. 주파수 도메인이 HDR/BDE의 새로운 정석

WMNet은 Wavelet 도메인 Masked Image Modeling으로 LDR→HDR 비디오 복원 SOTA를 달성했다(PSNR 36.23 dB, HDRTV4K-Scene). FMNet은 DCT 도메인 dynamic modulation으로 2nd best(35.51 dB). 두 모델 모두 공간 도메인이 아닌 주파수 분리를 핵심 기법으로 사용하며, W14의 Spectral Decomposition 트렌드가 HDR/BDE에서도 독립적으로 확인되었다.

**CDE 함의**: BDE 파이프라인에 Wavelet 또는 DCT 전처리 레이어를 추가하면 false contour 제거 + 색역 복원을 동시에 개선할 수 있다. WMNet의 "고주파 마스킹 시 색역 축소" 발견은 BDE 학습 데이터 증강 전략으로 직접 전용 가능.

## 2. 물리 기반 분리 vs. 경량 단일 모델 — 설계 트레이드오프 확보

SingleHDR은 카메라 파이프라인을 Clipping→CRF→Quantization 3단계로 명시화하고 각 역변환을 별도 CNN으로 학습한다. 반면 CSRNet은 **37K 파라미터** 극경량 MLP 하나로 SOTA 리터칭을 달성했다. BitNet은 그 사이(Dilated Conv + multi-scale encoder-decoder)에 위치하며 BDE 최고 추론 속도를 제공한다.

**CDE 함의**: SingleHDR의 Dequantization Net은 BDE task와 구조적으로 동일 — 코드/모델 공개 상태이므로 CDE 베이스라인으로 즉시 사용 가능. 경량화가 필요하면 CSRNet의 condition vector 분리 패턴을, 정밀도가 필요하면 물리 분리 패턴을 선택.

## 3. BDE와 HDR ITM의 경계 수렴

SingleHDR의 Dequantization = BDE, WMNet의 SDR→HDR = ITM. 두 task는 입력(low-bit/SDR)과 출력(high-bit/HDR)만 다르고 네트워크 구조는 수렴하고 있다. FMNet/CSRNet도 HDR 리터칭 모델이지만 BDE에 직접 적용 가능한 아키텍처를 갖추고 있다.

**CDE 함의**: 통합 파이프라인(SDR 8-bit → 16-bit BDE → HDR tone mapping)을 단일 모델로 구현하는 것이 다음 연구 방향. Video 시나리오에서는 WMNet의 Temporal MoE가 프레임 간 일관성 해결책.

## 이번 주 액션

1. **BitNet 추론 코드 clone + 테스트 영상 BDE 실행** — CDE PoC 첫 걸음. 추론 속도 벤치마크 확보
2. **WMNet Wavelet 마스킹 전략을 BDE 학습 데이터 증강에 적용** — false contour 감소 효과 실험 설계
3. **SingleHDR Dequantization Net을 CDE 베이스라인으로 세팅** — 코드 공개 상태, 즉시 fork 가능

---
