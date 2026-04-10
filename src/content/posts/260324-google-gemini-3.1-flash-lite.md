---
tags:
- AI_Daily_Trend
- domain/llm
- domain/optimization
source_platform:
- Blog
- X
- Reddit
status: published
created: 2026-03-24
source_url: ''
slug: 260324-google-gemini-3.1-flash-lite
summary: Google이 Gemini 3.1 Flash-Lite를 공개하며, 입력 백만 토큰당 $0.25의 초저가에 GPQA Diamond 86.9%,
  출력 속도 382 tok/s를 달성해 고빈도 추론 태스크의 경제성 기준을 새로 세웠다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260324-google-gemini-3.1-flash-lite/cover.png
  alt: 260324 Google Gemini 3.1 Flash Lite 출시
date: '2026-03-24'
---
## 한줄 요약

Google이 Gemini 3.1 Flash-Lite를 공개하며, 입력 백만 토큰당 $0.25의 초저가에 GPQA Diamond 86.9%, 출력 속도 382 tok/s를 달성해 고빈도 추론 태스크의 경제성 기준을 새로 세웠다.

## 핵심 내용

Gemini 3.1 Flash-Lite는 Google이 2026년 3월 3일 프리뷰로 공개한 경량 고속 추론 모델이다. Gemini 2.5 Flash 대비 첫 토큰 생성까지의 시간(TTFT)이 2.5배 빠르고, 출력 속도는 45% 향상되었으면서도 품질 저하가 거의 없는 것이 핵심 특징이다.

이 모델은 텍스트, 이미지, 오디오, 비디오를 모두 처리할 수 있는 멀티모달 모델로, 최대 1M 토큰의 컨텍스트 윈도우와 64K 토큰의 출력을 지원한다. 특히 "thinking budget" 개념을 도입하여 minimal, low, medium, high 네 단계로 추론 깊이를 조절할 수 있어, 태스크 복잡도에 따라 비용과 지연 시간을 유연하게 최적화할 수 있다.

Google AI Studio와 Vertex AI를 통해 개발자에게 즉시 제공되며, 번역, 콘텐츠 모더레이션, 분류, 대량 텍스트 생성 등 고빈도·저지연 태스크를 주 타깃으로 한다. Google은 이를 "가장 비용 효율적인 AI 모델"이라 포지셔닝하고 있다.

## 기술적 분석

| 항목 | 수치 | 특징 |
|---|---|---|
| 출시일 | 2026년 3월 3일 | 프리뷰 |
| GPQA Diamond | 86.9% | 성능 지표 |
| TTFT (First Token Time) | 2.5배 빠름 | Gemini 2.5 Flash 대비 |
| 출력 속도 | 45% 향상 | 처리량 개선 |
| 입력 가격 | $0.25/1M 토큰 | Pro 대비 1/8 |
| 멀티모달 | Text, Image, Audio, Video | 네이티브 |
| 컨텍스트 윈도우 | 1M 토큰, 64K 출력 | — |
| Thinking Budget | minimal, low, medium, high | 추론 깊이 조절 가능 |

Google이 2026년 3월 3일 프리뷰로 공개한 경량 고속 추론 모델. Gemini 2.5 Flash 대비 TTFT 2.5배 빠르고 출력 속도 45% 향상. 입력 $0.25/1M 토큰으로 GPQA Diamond 86.9% 달성. Thinking Budget 기능으로 추론 깊이를 4단계로 조절 가능하여 태스크별 비용-성능 최적화 가능.

## 시사점 & 액션 아이템

**왜 중요한가:**
- 추론 비용의 하한선이 다시 한번 하락했다. 입력 $0.25/1M 토큰이라는 가격은 대규모 배치 처리와 실시간 서비스 양쪽 모두에서 경제성 계산을 근본적으로 바꾼다.
- Thinking Budget 기능은 "모든 쿼리에 동일 비용"이라는 고정비 모델에서 "태스크 복잡도에 비례하는 과금"이라는 가변비 모델로의 전환을 의미한다. 이는 에이전트 아키텍처에서 각 스텝별 최적 추론 강도를 할당하는 데 유용하다.
- Arena.ai Elo 1432는 경량 모델치고 매우 높은 수준으로, "싼 모델 = 낮은 품질"이라는 편견을 깨뜨린다.

**액션 아이템:**
- [ ] Google AI Studio에서 Thinking Budget 단계별 품질/속도 트레이드오프 직접 테스트
- [ ] 기존 번역·분류 파이프라인의 Flash-Lite 대체 비용 시뮬레이션 수행
- [ ] DeepSeek V4 Lite vs Gemini 3.1 Flash-Lite 동일 태스크 벤치마크 비교 실험 설계
- [ ] Vertex AI 프리뷰 접근 신청 및 엔터프라이즈 환경 통합 가능성 검토

## 출처

| 플랫폼 | 링크 |
|---|---|
| Google Blog | [Gemini 3.1 Flash Lite: Our most cost-effective AI model yet](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/) |
| Google DeepMind | [Gemini 3.1 Flash-Lite Model Card](https://deepmind.google/models/model-cards/gemini-3-1-flash-lite/) |
| VentureBeat | [Google releases Gemini 3.1 Flash Lite at 1/8th the cost of Pro](https://venturebeat.com/technology/google-releases-gemini-3-1-flash-lite-at-1-8th-the-cost-of-pro/) |
| SiliconANGLE | [Google launches speedy Gemini 3.1 Flash-Lite model in preview](https://siliconangle.com/2026/03/03/google-launches-speedy-gemini-3-1-flash-lite-model-preview/) |
| Artificial Analysis | [Gemini 3.1 Flash-Lite Preview Analysis](https://artificialanalysis.ai/models/gemini-3-1-flash-lite-preview) |

## Related Notes

- 260322_오픈소스_모델의_급부상
- 260323_DeepSeek_V4_1조_파라미터_출시
- 260322_NVIDIA_Nemotron_3_Super_하이브리드_MoE
