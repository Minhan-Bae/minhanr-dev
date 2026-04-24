---
tags:
- Trend
- domain/llm
- domain/architecture
- domain/open-source
source_platform:
- Reddit
- X
- HuggingFace
- Blog
created: 2026-03-22
source_url: ''
slug: 260322-nvidia-nemotron-super-moe
summary: '한줄 요약: NVIDIA가 120B 파라미터(12B 활성) 규모의 하이브리드 Mamba-Transformer MoE 모델을 오픈소스로
  공개, 기존 대비 5배 이상의 처리량과 100만 토큰 네이티브 컨텍스트를 실현했다'
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260322-nvidia-nemotron-super-moe/cover.png
  alt: 260322 NVIDIA Nemotron 3 Super 하이브리드 MoE
type: Trend
lifecycle: published
date: '2026-04-24'
status: published
---
# NVIDIA Nemotron 3 Super — 하이브리드 Mamba-Transformer MoE

> **한줄 요약**: NVIDIA가 120B 파라미터(12B 활성) 규모의 하이브리드 Mamba-Transformer MoE 모델을 오픈소스로 공개, 기존 대비 5배 이상의 처리량과 100만 토큰 네이티브 컨텍스트를 실현했다.

---

## 핵심 내용

NVIDIA가 2026년 3월 11일 **Nemotron 3 Super**를 공개했다. 이 모델은 **Mamba-2 + Transformer Attention + Mixture-of-Experts**라는 세 가지 아키텍처를 하나로 결합한 최초의 대규모 하이브리드 모델이다.

핵심 혁신은 **Latent MoE(잠재 전문가 혼합)** 구조로, 토큰을 라우팅 전에 압축하여 동일한 추론 비용으로 4배 더 많은 전문가를 활성화할 수 있다. 또한 **Multi-Token Prediction(MTP)**으로 여러 토큰을 동시에 예측하여 코드·도구 호출 등 구조화된 생성 작업에서 최대 3배의 wall-clock 속도 향상을 달성한다.

모델은 완전한 오픈소스(가중치, 데이터셋, 학습 레시피 공개)로, NVIDIA NIM과 Amazon Bedrock에서 즉시 배포 가능하다. 에이전틱 AI 워크로드에 최적화된 "Super + Nano" 배포 전략을 제안하며, 복잡한 멀티에이전트 추론은 Super가, 단순 개별 태스크는 Nano가 처리한다.

---

## 기술적 분석

| 항목 | 수치 | 특징 |
|------|------|------|
| 총 파라미터 | 120B | Mamba-2 + Transformer + MoE 결합 |
| 활성 파라미터 | 12B | 토큰당 효율성 |
| 컨텍스트 윈도우 | 1M 토큰 | 네이티브 지원 |
| 공개일 | 2026년 3월 11일 | 완전 오픈소스 |
| 배포 | NVIDIA NIM, Amazon Bedrock | 즉시 배포 가능 |
| 라이선스 | 완전 오픈소스 | 가중치, 데이터셋, 학습 레시피 공개 |

NVIDIA가 공개한 Nemotron 3 Super는 Mamba-2 + Transformer Attention + Mixture-of-Experts를 결합한 하이브리드 모델이다. 총 120B 파라미터 중 토큰당 12B만 활성화되며, Latent MoE 구조로 4배 더 많은 전문가를 동일 추론 비용에 활성화할 수 있다. Multi-Token Prediction으로 코드·도구 호출 시 최대 3배 wall-clock 속도 향상을 달성한다. 1M 토큰 네이티브 컨텍스트와 NVFP4 네이티브 학습으로 대규모 문서 처리와 양자화 기반 추론을 지원한다.

---

## 시사점 & 액션 아이템

> [!tip] 왜 중요한가?
> Nemotron 3 Super는 **순수 Transformer 패러다임의 종말**을 예고한다. Mamba의 선형 복잡도 + Transformer의 정밀 추론 + MoE의 효율적 확장이 결합되면, 같은 하드웨어에서 7.5배 더 빠른 추론이 가능해진다. 특히 NVFP4 네이티브 학습은 양자화 손실 없이 4bit 추론을 실현하는 새로운 표준이 될 수 있다. 오픈소스 공개로 누구나 커스터마이징 가능하다는 점에서, 에이전틱 AI 인프라의 기본 백본으로 자리잡을 가능성이 높다.

### 액션 아이템

- [ ] NVIDIA NIM에서 Nemotron 3 Super API 테스트 — 특히 1M 컨텍스트에서의 RAG 성능 확인
- [ ] Mamba-2 레이어 구조 논문 리딩 (State Space Duality 기반)
- [ ] "Super + Nano" 배포 패턴을 기존 에이전트 파이프라인에 적용 검토
- [ ] NVFP4 학습 레시피 분석 — 자체 모델 학습 시 적용 가능성 탐색

---

## 출처

| 플랫폼 | 링크 | 비고 |
|--------|------|------|
| NVIDIA Blog | [공식 기술 블로그](https://developer.nvidia.com/blog/introducing-nemotron-3-super-an-open-hybrid-mamba-transformer-moe-for-agentic-reasoning/) | 아키텍처 상세 |
| NVIDIA Research | [기술 보고서 (PDF)](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf) | 학습 파이프라인 |
| NVIDIA NIM | [모델 카드](https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/modelcard) | API 배포 |
| MarkTechPost | [분석 기사](https://www.marktechpost.com/2026/03/11/nvidia-releases-nemotron-3-super-a-120b-parameter-open-source-hybrid-mamba-attention-moe-model-delivering-5x-higher-throughput-for-agentic-ai/) | 성능 비교 |
| MarketingAgent Blog | [가이드](https://marketingagent.blog/2026/03/18/nvidia-nemotron-3-super-complete-guide-to-hybrid-moe-agentic-ai/) | 실무 활용 |

---

## Related Notes

- 260322_오픈소스_모델의_급부상 — DeepSeek-R1, Qwen 등 오픈소스 생태계와의 경쟁 구도
- 260322_Holotron-12B_컴퓨터사용_에이전트_모델 — Nemotron 기반 파생 모델, 컴퓨터 사용 에이전트 특화
- 260322_GPT-5.4_네이티브_Computer_Use — 클로즈드 모델의 에이전틱 대응
