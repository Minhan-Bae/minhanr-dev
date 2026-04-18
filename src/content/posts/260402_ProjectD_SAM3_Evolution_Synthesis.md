---
title: "Project-D: SAM 3 Evolution — Concept → Instruction → Object Multiplex"
tags: [Weekly, Insight, Project-D, SAM, Segmentation, DepthEstimation]
source_type: synthesis
status: mature
created: 2026-04-02
period: "2026-W13~W14"
related:
  - "[[260401_ColorDepthExpansion_Weekly_Synthesis]]"
  - "[[260401_CharacterShift_Weekly_Synthesis]]"
  - "[[260402_SAM31_Object_Multiplex_SharedMemory_MultiObject_Tracking]]"
  - "[[260401_SAM3-I_Segment_Anything_Instructions]]"
  - "[[260330_SAM3_Segment_Anything_Concept]]"
  - "[[260331_asyncmde_async_depth_estimation]]"
  - "[[260327_PureCLIP_Depth_CLIP_Embedding_Depth]]"
summary: "Project-D: SAM 3 Evolution Synthesis 9건 growing 노트 통합. AX지원사업 SAM 3 PoC + 제안서 직결. 핵심 테제 SAM 3 패밀리가 3개월 만에 Concept Segmentation → Instruction-Guided →…"
categories:
  - Writing
---

# Project-D: SAM 3 Evolution Synthesis

> 9건 growing 노트 통합. AX지원사업 SAM 3 PoC + 제안서 직결.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260402_ProjectD_SAM3_Evolution_Synthesis/fig-1.png)
*Source: [arXiv 2511.16719 (Fig. 1)](https://arxiv.org/abs/2511.16719)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260402_ProjectD_SAM3_Evolution_Synthesis/fig-2.png)
*Source: [arXiv 2512.04585 (Fig. 1)](https://arxiv.org/abs/2512.04585)*

## 핵심 테제

SAM 3 패밀리가 3개월 만에 **Concept Segmentation → Instruction-Guided → Multi-Object Shared Memory**로 급속 진화했다. 이 3단계 스택이 AX지원사업 PoC의 기술적 근간이 된다.

## SAM 3 진화 타임라인

```
SAM 3 (2025-11)    → SAM3-I (2025-12)     → SAM 3.1 (2026-03)
Concept Prompts       3-Level Instructions    Object Multiplex
848M params           +Cascaded Adapter       Shared Memory Pool
4M+ concepts          L1/L2/L3 쿼리          N 메모리→1 풀
PCS 패러다임          복합 질의 지원          VRAM 절감 + 병렬 추론
```

### SAM 3 (Base) — Promptable Concept Segmentation
- 848M 파라미터, DETR 디텍터 + 밀집 메모리 비디오 트래커 공유 백본
- 텍스트/이미지 컨셉 프롬프트 → 모든 매칭 인스턴스 마스크 (고유 ID)
- Presence Head: 인식과 로컬라이제이션 분리. 2x 정확도 향상
- SAM 3 Agent: MLLM 기반 반복적 리파인먼트 루프 추가

### SAM3-I — Instruction-Aware
- 3레벨 인스트럭션 계층: L1 Concept("red car"), L2 Simple(속성+공간), L3 Complex(기능/추론)
- Instruction-Aware Cascaded Adapter로 SAM 3 원본 PCS 성능 유지
- "빨간 옷 입은 사람" 같은 복합 쿼리를 단일 추론 패스로 처리

### SAM 3.1 — Object Multiplex + Shared Memory
- N개 독립 메모리 뱅크 → 1개 공유 풀: VRAM 절감 + 병렬 Joint Attention
- 오클루전 처리 향상, 다중 캐릭터 동시 세그멘테이션
- `facebook/sam3.1` 체크포인트, PyTorch 2.7+ / CUDA 12.6+ 필요

## 보완 기술: Depth + HDR

| 기술 | 핵심 | 역할 |
|------|------|------|
| AsyncMDE | 듀얼트랙(중량 기반 + 경량 매프레임), 시간적 일관성 | 실시간 깊이 추정 |
| PureCLIP-Depth | CLIP 임베딩 공간에서 직접 깊이 추정, AbsRel 37% 개선 | 시맨틱+깊이 통합 |
| Iris Spectral-Gated | 스펙트럼 도메인 분해, 소량 데이터로 깊이 SOTA | HDR 색 확장 적용 가능 |

## CharacterShift 4단계 파이프라인

SAM 3 계열은 다운스트림 캐릭터 교체 파이프라인의 Stage 1:
1. **SAM 3.1** — 컨셉 세그멘테이션 (마스크 생성)
2. **I2P/FireRed** — 아이덴티티 추출
3. **HiFi-Inpaint** — 고해상도 인페인팅 (CVPR 2026)
4. **daVinci-MagiHuman** — 비디오 출력

## AX지원사업 PoC 액션 아이템

1. **SAM 3.1 Object Multiplex 즉시 재테스트**: facebook/sam3.1 체크포인트로 다중 캐릭터 동시 세그멘테이션 벤치마크. 포인트 프롬프트 대신 컨셉 프롬프트 우선 테스트.
2. **SAM3-I L2/L3 쿼리 데모**: "빨간 옷 입은 사람" 등 복합 쿼리 기반 세그멘테이션 데모 구축. AX 제안서 "사용자 의도 기반 세그멘테이션" 딜리버러블 직접 증명.
3. **Depth + Segmentation 통합**: PureCLIP-Depth의 CLIP 공유 임베딩 공간 활용, SAM 3의 시맨틱 이해와 깊이 추정을 단일 파이프라인으로 통합. AX 제안서 차별화 포인트.

## 소스

- SAM 3: arXiv 2511.16719 | SAM3-I: arXiv 2512.04585
- AsyncMDE: arXiv 2603.10438 | PureCLIP-Depth: arXiv 2603.16238
- HiFi-Inpaint (CVPR 2026), FireRed 1.1 (Apache-2.0)
