---
tags:
- AI_R&D_Paper
- domain/vision
- domain/edge-ai
- tech/instance-segmentation
- tech/video-tracking
- tech/knowledge-distillation
- tech/model-compression
source_url: https://arxiv.org/abs/2511.15833
code_available: true
code_url: https://github.com/SimonZeng7108/efficientsam3
status: published
created: 2026-04-03
web_searched: 2026-04-04
slug: 260403-efficientsam3-progressive-distillation-edgedeploy-esam3
summary: '저자: Simon Zeng 외 발표: arXiv 2511.15833 코드: https://github.com/SimonZeng7108/efficientsam3
  한줄 요약: SAM 3의 Promptable Concept Segmentation(PCS) 능력을 3단계 Progressive Hierarchical
  Distillation(PHD)으로 경량 모...'
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260403-efficientsam3-progressive-distillation-edgedeploy-esam3/cover.png
  alt: 260403 EfficientSAM3 Progressive Distillation EdgeDeploy ESA
date: '2026-04-03'
---

# EfficientSAM3: Progressive Hierarchical Distillation for Video Concept Segmentation

**저자:** Simon Zeng 외
**발표:** arXiv 2511.15833
**코드:** https://github.com/SimonZeng7108/efficientsam3

> **한줄 요약:** SAM 3의 Promptable Concept Segmentation(PCS) 능력을 3단계 Progressive Hierarchical Distillation(PHD)으로 경량 모델에 이전, 파라미터 99.85% 감소로 엣지 디바이스 배포를 가능하게 한다.

## 핵심 문제

SAM 3는 텍스트/예시 프롬프트 기반 **개념 단위 세그멘테이션**이라는 혁신적 능력을 갖추었지만:
- 비전 인코더 461.84M 파라미터 → 모바일/임베디드 배포 불가
- Dense memory bank → 비디오 추적 시 메모리·레이턴시 폭발
- H200 GPU에서 30ms/이미지라도 엣지 디바이스에는 비현실적

EfficientSAM3는 SAM 1→2→3 전체 계보의 지식을 **단계적으로 증류**하여 해결.

## Progressive Hierarchical Distillation (PHD) 아키텍처

### Stage 1: Encoder Distillation (이미지 + 텍스트)

| 구성요소 | Teacher | Student 옵션 |
|----------|---------|-------------|
| Image Encoder | SAM3 Hiera (461.84M) | RepViT-M0.6~M2.3, TinyViT-5M~11M, EfficientViT-B0~B1 |
| Text Encoder | SAM3 내장 | MobileCLIP-S0 (42.72M), S1 (63.56M), 2-L (86.09M) |

- **Prompt-in-the-Loop Training**: SA-1B 데이터셋에서 포인트/박스 프롬프트를 포함한 피처 정렬
- SA-1B의 1%만 사용해도 효과적 증류 달성

### Stage 2: Temporal Memory Distillation

- SAM 3의 dense memory bank → **Perceiver 기반 compact memory module** 교체
- SA-V 비디오 데이터셋에서 시공간 피처 압축·검색 학습
- 프레임 간 객체 일관성 유지하면서 메모리 사용량 대폭 절감

### Stage 3: End-to-End Fine-Tuning

- SAM3 공식 PCS 데이터(SA-Co Gold/Silver)로 전체 파이프라인 정제
- 개념 수준 성능 보존이 목표
- 추가 학습 데이터: Recap-DataComp-1B (텍스트-이미지 쌍)

## 모델 변형 및 성능

### 이미지 인코더 변형 (9종)

| 모델 | 파라미터 | 압축율 |
|------|----------|--------|
| EfficientViT-B0 | 0.68M | **99.85% ↓** |
| TinyViT-5M | 5.02M | 98.9% ↓ |
| TinyViT-11M | 10.55M | 97.7% ↓ |
| RepViT-M0.6 | 5.68M | 98.8% ↓ |
| RepViT-M1.1 | 10.24M | 97.8% ↓ |
| RepViT-M2.3 | 22.40M | 95.2% ↓ |

### 텍스트 인코더 변형 (3종)

| 모델 | 파라미터 | 압축율 |
|------|----------|--------|
| MobileCLIP-S0 | 42.72M | 최경량 |
| MobileCLIP-S1 | 63.56M | 균형 |
| MobileCLIP 2-L | 86.09M | 최대 정확도 |

→ 조합 가능한 **18가지 모델 구성** 제공

### 지원 프롬프트 모드

- **Point Prompting**: 좌표 기반 세그멘테이션 (SAM 1 호환)
- **Text Prompting**: 자연어 기반 개념 세그멘테이션 (SAM 3 신규)
- 향후 비디오 트래킹 지원 예정 (Stage 2/3 완성 시)

## 기술 스택

- Python ≥ 3.12, PyTorch 2.7.0
- CUDA / MPS / CPU 지원
- 설치: `pip install -e ".[stage1]"`

## 시사점

### segmentation research (SAM 3 PoC) 직접 연관

EfficientSAM3는 **AX지원사업 SAM 3 PoC의 엣지 배포 전략**으로 즉시 활용 가능:

1. **PoC 시나리오**: SAM 3의 개념 세그멘테이션을 실시간으로 시연하되, 클라우드 GPU 의존 없이 노트북/엣지에서 구동
2. **제안서 차별화**: "SAM 3 개념 세그멘테이션 + 엣지 배포"는 현재 타 팀이 다루지 않는 독자 영역
3. **모델 선택 가이드**: PoC용 TinyViT-11M + MobileCLIP-S1 조합 권장 (정확도-속도 균형)

### SAM 에코시스템 전체 흐름

```
SAM 1 (2023) — 포인트/박스 프롬프트 세그멘테이션
  → SAM 2 (2024) — 비디오 확장, 메모리 뱅크
    → SAM 3 (2025-11) — 개념 프롬프트, PCS
      → SAM 3.1 (2026-03) — Object Multiplex, 멀티오브젝트 가속
      → EfficientSAM3 — 엣지 증류, 99.85% 압축
        → SAM 3-I (2026-04) — 인스트럭션 튜닝
```

### 한계

- Stage 2/3 가중치 미공개 (Stage 1만 릴리즈됨)
- 비디오 개념 세그멘테이션 벤치마크(SA-Co) 정량 결과 미공개 (논문에 "Coming Soon — results will be reported in a future revision"으로 명시, 현재 Stage 1 학습 절차만 공개)
- 증류 과정에서 롱테일 개념(rare concept) 성능 저하 가능성

## WebSearch 보강 (2026-04-04)

### 공식 리소스
- **GitHub (공식)**: https://github.com/SimonZeng7108/efficientsam3 — 코드, Stage 1 가중치 공개. 활발히 업데이트 중.
- **프로젝트 페이지**: https://simonzeng7108.github.io/efficientsam3/
- **arXiv**: https://arxiv.org/abs/2511.15833 (v1, 2025-11)

### 저자 정보
- Chengxi Zeng (SimonZeng7108), Yuxuan Jiang, Aaron Zhang

### 가중치 릴리즈 현황 (2026-04 기준)
- **Stage 1 이미지 인코더**: 9종 변형 전체 공개 (RepViT, TinyViT, EfficientViT 시리즈)
- **Stage 1 geometry-prompt ft 가중치**: 2026-01-11 업데이트 — SA-1B 1%로 학습, SA-Co Gold+Silver로 텍스트 인코더 파인튜닝
- **SAM3-LiteText**: 2026-02-18 릴리즈 — 경량 텍스트 인코더 변형
- **Stage 2/3 가중치**: 미공개 (Coming Soon 상태 유지)

### 학회 채택
- CVPR 2026 채택 여부 미확인 — arXiv 프리프린트 상태
- 학회 제출 이력 공개되지 않음

### 커뮤니티 반응
- facebookresearch/sam3 공식 리포에 EfficientSAM3 관련 이슈(#143) 등록 — Meta SAM 팀과의 접점 확인
- 2D Spatial Perceiver 기반 메모리 압축으로 모바일 디바이스에서 22x 속도 향상 보고

### 보강 요약
- Stage 1 가중치 + geometry-prompt ft + SAM3-LiteText까지 공개 완료, Stage 2/3은 미공개
- 학회 peer-review 미완료 상태이나, 실용적 코드 공개와 활발한 업데이트로 growing→mature 유지 타당
- segmentation research (SAM 3 PoC)에서 Stage 1 ft 가중치를 즉시 활용 가능한 상태
