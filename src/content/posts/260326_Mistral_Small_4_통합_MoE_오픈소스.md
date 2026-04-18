---
tags:
  - AI_Daily_Trend
  - domain/llm
  - domain/open-source
source_type: product-launch
source_platform:
  - Blog
  - Reddit
  - HuggingFace
  - X
status: mature
created: 2026-03-26
relevance: 3
related: ["Memesis"]
source_url: ""
summary: 한줄 요약 Mistral AI가 128개 전문가 중 4개만 활성화하는 119B MoE 아키텍처로, 기존 Magistral(추론)·Pixtral(멀티모달)·Devstral(코딩) 3개 모델을 하나로 통합한 Mistral Small 4를 Apache 2.0으로 공개했다.
categories:
  - Writing
---
## 한줄 요약

Mistral AI가 128개 전문가 중 4개만 활성화하는 **119B MoE 아키텍처**로, 기존 Magistral(추론)·Pixtral(멀티모달)·Devstral(코딩) 3개 모델을 **하나로 통합**한 Mistral Small 4를 Apache 2.0으로 공개했다.

## 핵심 내용

2026년 3월 16일, Mistral AI는 GTC 2026 시즌에 맞춰 **Mistral Small 4**를 출시했다. 이 모델의 핵심 전략은 "하나의 모델로 세 가지 역할을 대체"하는 것이다. 기존에 별도로 운영하던 Magistral(심층 추론), Pixtral(멀티모달 이미지+텍스트), Devstral(에이전틱 코딩) 워크로드를 단일 MoE 모델에 통합했다.

특히 `reasoning_effort` 파라미터를 통해 요청별로 추론 깊이를 조절할 수 있다. `"none"`으로 설정하면 Mistral Small 3.2 수준의 빠른 응답을, `"high"`로 설정하면 Magistral 수준의 단계적 추론을 수행한다. 이는 개발자가 레이턴시와 정확도 사이의 트레이드오프를 API 호출 단위로 제어할 수 있음을 의미한다.

NVIDIA와의 전략적 파트너십도 동시 발표되었으며, **Nemotron Coalition**의 일부로 프론티어 오픈소스 모델을 공동 개발할 예정이다. 출시 첫날부터 NVIDIA NIM 컨테이너로도 제공된다.

## 기술적 분석

### 아키텍처 상세

| 항목 | 사양 |
|------|------|
| 전체 파라미터 | **119B** |
| 활성 파라미터 (토큰당) | **6B** (임베딩/출력 포함 시 8B) |
| 전문가 수 | **128개** (토큰당 4개 활성) |
| 컨텍스트 윈도우 | **256K 토큰** |
| 입력 모달리티 | 텍스트 + 이미지 |
| 출력 모달리티 | 텍스트 |
| 라이선스 | **Apache 2.0** |

### 벤치마크 성능

| 벤치마크 | Mistral Small 4 | GPT-OSS 120B | 비고 |
|----------|-----------------|--------------|------|
| AA LCR | **0.72** (1.6K 출력) | 동등 수준 (5.8-6.1K 출력) | 출력 길이 3.5-4배 효율적 |
| LiveCodeBench | GPT-OSS 120B **상회** | 기준 | 20% 적은 출력으로 달성 |
| AIME 2025 | 경쟁력 있는 점수 | 기준 | 비용 효율성 우위 |

### 성능 개선 (vs Mistral Small 3)

| 지표 | 개선폭 |
|------|--------|
| 엔드투엔드 완료 시간 | **40% 감소** (레이턴시 최적화) |
| 초당 요청 처리량 | **3배 증가** (처리량 최적화) |

### 최소 배포 요건

| 구성 | 하드웨어 |
|------|----------|
| 최소 | 4x NVIDIA HGX H100 / 2x HGX H200 / 1x DGX B200 |
| 권장 | 4x HGX H100 / 4x HGX H200 / 2x DGX B200 |
| 호환 프레임워크 | vLLM, llama.cpp, SGLang, Transformers |

## 시사점 & 액션 아이템

**왜 중요한가:**
- **통합 배포의 경제성**: 기존에 추론/멀티모달/코딩용으로 3개의 모델을 별도 배포하던 환경에서, 단일 모델로 통합하면 인프라 비용과 운영 복잡성이 획기적으로 줄어든다. 토큰당 6B 활성 파라미터로 119B급 성능을 내는 MoE 효율성이 핵심이다.
- **Configurable Reasoning의 실용성**: 요청별 추론 노력 조절은 프로덕션 환경에서 매우 실용적이다. 단순 질의에는 `"none"`, 복잡한 분석에는 `"high"`를 적용해 비용 최적화가 가능하다.
- **오픈소스 MoE 생태계 경쟁 심화**: Qwen 3.5(397B-A17B MoE), DeepSeek, Mistral Small 4가 오픈소스 MoE 시장에서 치열하게 경쟁 중이다. Apache 2.0 라이선스는 상업적 활용에 제약이 없어 기업 채택에 유리하다.

**액션 아이템:**
- [ ] Mistral Small 4 vs Qwen 3.5 MoE vs DeepSeek V4 실사용 비교 테스트 진행
- [ ] `reasoning_effort` 파라미터 활용 패턴 정리 (프로덕션 적용 가이드)
- [ ] llama.cpp 또는 vLLM 기반 로컬 배포 테스트 (H100 4장 환경)
- [ ] NVIDIA Nemotron Coalition 후속 발표 추적

## 출처

| 플랫폼 | 링크 |
|---------|------|
| Mistral AI Blog | [Introducing Mistral Small 4](https://mistral.ai/news/mistral-small-4) |
| MarkTechPost | [Mistral Small 4: 119B MoE Model](https://www.marktechpost.com/2026/03/16/mistral-ai-releases-mistral-small-4-a-119b-parameter-moe-model-that-unifies-instruct-reasoning-and-multimodal-workloads/) |
| VentureBeat | [Four Models Unified in One](https://venturebeat.com/orchestration/mistral-small-4-119b-moe-model/) |
| Simon Willison | [Introducing Mistral Small 4](https://simonwillison.net/2026/Mar/16/mistral-small-4/) |
| Awesome Agents | [128 Experts, 6B Active, Apache 2.0](https://awesomeagents.ai/news/mistral-small-4-moe-apache-configurable-reasoning/) |
| Medium | [Open-Source Model That Does Everything](https://medium.com/@ithinkbot/mistral-small-4-the-open-source-model-that-does-everything-and-costs-you-nothing-to-license-539818925327) |

## Related Notes

- [[260324_MiniMax_M2.5_에이전틱_코딩_모델]] — 에이전틱 코딩 모델 비교
- [[260324_March_2026_AI_Model_출시_러시]] — 2026년 3월 모델 출시 경쟁 맥락
- [[260325_OpenResearcher_오픈소스_딥리서치_파이프라인]] — 오픈소스 AI 생태계 확장
