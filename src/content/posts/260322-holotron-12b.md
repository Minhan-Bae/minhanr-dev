---
tags:
- Trend
- domain/agents
- domain/multimodal
- domain/open-source
source_platform:
- HuggingFace
- X
- GitHub
created: 2026-03-22
source_url: ''
slug: 260322-holotron-12b
summary: '한줄 요약: H Company가 NVIDIA와 협력하여 SSM-Attention 하이브리드 아키텍처 기반 12B 멀티모달 모델을
  공개, WebVoyager 80.5%를 달성하며 오픈소스 컴퓨터 사용 에이전트의 새 기준을 세웠다'
author: MinHanr
publish_ready: true
cover:
  image: /api/og?title=260322-holotron-12b&category=Industry
  alt: 260322 Holotron-12B 컴퓨터사용 에이전트 모델
type: Trend
lifecycle: published
date: '2026-04-24'
status: published
---
# Holotron-12B — 고처리량 오픈소스 컴퓨터 사용 에이전트 모델

> **한줄 요약**: H Company가 NVIDIA와 협력하여 SSM-Attention 하이브리드 아키텍처 기반 12B 멀티모달 모델을 공개, WebVoyager 80.5%를 달성하며 오픈소스 컴퓨터 사용 에이전트의 새 기준을 세웠다.

---

## 핵심 내용

H Company가 2026년 3월 17일 GTC에서 **Holotron-12B**를 공개했다. NVIDIA의 **Nemotron-Nano-12B-v2-VL**을 베이스로, H Company 자체 로컬라이제이션 및 내비게이션 데이터로 파인튜닝한 **컴퓨터 사용 특화 에이전트 모델**이다.

핵심 차별점은 **State-Space Model(SSM) + Attention 하이브리드** 아키텍처다. 기존 순수 Transformer 모델은 컨텍스트 길이에 따라 KV 캐시가 이차적으로 증가하지만, SSM은 시퀀스 길이와 무관하게 **상수 크기의 상태만 유지**한다. 이로 인해 다수의 고해상도 스크린샷이 포함된 긴 상호작용 이력에서도 메모리 효율이 극대화된다.

NVIDIA Open Model License로 완전 공개되었으며, vLLM v0.14.1+에서 즉시 배포 가능하다.

---

## 기술적 분석

| 항목 | 수치 |
|------|------|
| 파라미터 | 12B |
| WebVoyager | 80.5% |
| 베이스 모델 | Nemotron-Nano-12B-v2-VL |
| 라이선스 | NVIDIA Open Model License |
| 배포 | vLLM v0.14.1+ |

SSM + Attention 하이브리드 아키텍처가 핵심이다. 순수 Transformer는 컨텍스트 길이에 따라 KV 캐시가 이차적으로 증가하지만, SSM은 시퀀스 길이와 무관하게 상수 크기의 상태만 유지한다. 고해상도 스크린샷이 포함된 긴 상호작용 이력에서 메모리 효율이 극대화되는 구조다.

---

## 시사점 & 액션 아이템

> [!tip] 왜 중요한가?
> Holotron-12B는 **"컴퓨터 사용 에이전트의 오픈소스 민주화"**를 상징한다. GPT-5.4와 Claude가 클로즈드 모델로 컴퓨터 사용을 제공하는 반면, Holotron은 12B라는 관리 가능한 크기에서 80.5%의 WebVoyager 성능을 달성한다. 특히 SSM 하이브리드 아키텍처 덕분에 단일 H100에서 100개 동시 워커를 처리할 수 있어, **대규모 데이터 어노테이션, 온라인 RL, 자동화 파이프라인**에 즉시 투입 가능하다. 이는 에이전트 인프라의 단가를 획기적으로 낮출 수 있는 모델이다.

### 액션 아이템

- [ ] HuggingFace에서 Holotron-12B 다운로드 및 vLLM 배포 테스트
- [ ] WebVoyager 벤치마크 직접 재현 — 실제 업무 시나리오로 확장 테스트
- [ ] GPT-5.4 Computer Use vs Holotron-12B 비용-성능 비교 분석
- [ ] SSM 아키텍처의 KV 캐시 절감 효과 정량 분석 (VRAM 사용량 프로파일링)

---

## 출처

| 플랫폼 | 링크 | 비고 |
|--------|------|------|
| HuggingFace Blog | [기술 딥다이브](https://huggingface.co/blog/Hcompany/holotron-12b) | 아키텍처 + 벤치마크 |
| HuggingFace Hub | [모델 페이지](https://huggingface.co/Hcompany/Holotron-12B) | 다운로드 |
| H Company | [공식 페이지](https://hcompany.ai/holotron-12b) | 제품 소개 |
| X (Twitter) | [@hcompany_ai 공지](https://x.com/hcompany_ai/status/2033851052714320083) | GTC 발표 |

---

## Related Notes

- 260322_NVIDIA_Nemotron_3_Super_하이브리드_MoE — 베이스 모델의 원본 아키텍처
- 260322_GPT-5.4_네이티브_Computer_Use — 클로즈드 모델의 컴퓨터 사용 접근법 비교
- 260322_OpenClaw-RL_범용_에이전트_훈련 — 에이전트 학습 프레임워크
