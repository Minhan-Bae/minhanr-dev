---
tags:
  - AI_Daily_Trend
  - domain/llm
  - domain/agents
source_type: product-launch
source_platform:
  - HuggingFace
  - Reddit
  - X
  - Blog
status: mature
created: 2026-03-24
relevance: 3
related: ["3DAgent"]
source_url: ""
summary: 한줄 요약 중국 AI 스타트업 MiniMax가 공개한 M2.5 모델이 SWE-Bench Verified 80.2%를 달성하며 GPT-5.2 및 Claude Opus 4.6에 근접한 코딩 성능을 입력 토큰당 $0.20이라는 파격적 가격으로 제공한다.
categories:
  - Systems
---
![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260324_MiniMax_M2.5_에이전틱_코딩_모델/fig-1.png)
*Source: [minimax.io](https://www.minimax.io/news/minimax-m25)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260324_MiniMax_M2.5_에이전틱_코딩_모델/fig-2.png)
*Source: [blog.galaxy.ai](https://blog.galaxy.ai/model/minimax-m2-5)*

## 한줄 요약

중국 AI 스타트업 MiniMax가 공개한 M2.5 모델이 SWE-Bench Verified 80.2%를 달성하며 GPT-5.2 및 Claude Opus 4.6에 근접한 코딩 성능을 입력 토큰당 $0.20이라는 파격적 가격으로 제공한다.

## 핵심 내용

MiniMax M2.5는 2026년 2월 12일 공개된 에이전틱 코딩 특화 모델로, "SOTA in Coding and Agent"를 표방한다. 이 모델의 가장 주목할 만한 점은 프론티어급 코딩 성능을 상용 모델 대비 극히 낮은 비용으로 제공한다는 것이다.

코드 생성에 앞서 숙련된 소프트웨어 아키텍트 관점에서 프로젝트의 기능, 구조, UI 설계를 먼저 분해하고 계획하는 "계획 우선(plan-first)" 방식을 채택하고 있다. 이는 단순 코드 완성을 넘어 프로젝트 수준의 에이전틱 작업을 수행할 수 있는 역량이다.

SWE-Bench Verified 평가에서 M2.1 대비 37% 빠른 속도로 태스크를 완료하며, 이는 Claude Opus 4.6의 속도와 동등한 수준이다. 또한 Word, PowerPoint, Excel 등 오피스 태스크 평가에서 주류 모델 대비 59.0% 평균 승률을 기록했다.

이미 M2.7이 공개되어 "자기 진화(self-evolving)" 개념을 도입하며 다음 세대로의 진화를 시사하고 있어, MiniMax의 빠른 모델 반복 속도가 눈에 띈다.

## 기술적 분석

| 항목 | 수치 |
|---|---|
| SWE-Bench Verified | 80.2% |
| 오피스 태스크 승률 | 59.0% |
| 입력 가격 | $0.20/1M 토큰 |
| 완료 속도 | M2.1 대비 +37% |
| 후속 모델 | M2.7 (자기 진화 개념) |

"계획 우선(plan-first)" 방식이 핵심 아키텍처다. 코드 생성 전에 프로젝트의 기능, 구조, UI 설계를 먼저 분해한다. SWE-Bench Verified 80.2%로 GPT-5.2, Claude Opus 4.6에 근접하면서도 입력 $0.20/M이라는 파격적 비용을 실현했다. M2.1 대비 37% 빠른 태스크 완료 속도는 Claude Opus 4.6 수준이다.

MiniMax M2.5는 입력 $0.20/1M 토큰의 극도의 저가로 SWE-Bench Verified 80.2%를 달성했다. 코드 생성에 앞서 프로젝트의 기능, 구조, UI 설계를 먼저 분해하는 "계획 우선" 방식을 채택. SWE-Bench Verified에서 M2.1 대비 37% 더 빠른 속도로 태스크 완료 (Claude Opus 4.6 동등 수준). Word, PowerPoint, Excel 등 오피스 태스크에서 59.0% 평균 승률 기록.

## 시사점 & 액션 아이템

**왜 중요한가:**
- 코딩 에이전트 시장에서 가격 파괴가 진행 중이다. 입력 $0.20/1M 토큰으로 SWE-Bench 80%대를 달성하는 모델이 등장하면서, 코딩 도구의 가격 경쟁이 본격화된다.
- MiniMax의 "plan-first" 접근법은 에이전틱 코딩의 핵심 패러다임이 "코드 생성"에서 "프로젝트 설계 + 실행"으로 전환되고 있음을 보여준다.
- 중국 AI 기업들(DeepSeek, MiniMax, Alibaba)이 코딩·에이전트 영역에서 동시다발적으로 프론티어급 모델을 쏟아내며, 미국 기업 독점 구도가 빠르게 해체되고 있다.
- M2.5 → M2.7의 짧은 반복 주기는 모델 자체가 자기 개선에 참여하는 "self-evolving" 학습 패러다임의 실용화를 시사한다.

**액션 아이템:**
- [ ] M2.5 API(Ollama 또는 공식 API)로 실제 코딩 프로젝트 에이전트 성능 테스트
- [ ] SWE-Bench Verified에서 M2.5 vs Claude Opus 4.6 vs GPT-5.4 동일 조건 비교 실험
- [ ] M2.7의 "self-evolving" 메커니즘 기술 분석 (논문 확인 후)
- [ ] 에이전틱 코딩 도구 비용 최적화 시뮬레이션: M2.5 기반 파이프라인 설계

## 출처

| 플랫폼 | 링크 |
|---|---|
| MiniMax 공식 | [MiniMax M2.5: Built for Real-World Productivity](https://www.minimax.io/news/minimax-m25) |
| Galaxy.ai | [MiniMax M2.5 Model Specs, Costs & Benchmarks](https://blog.galaxy.ai/model/minimax-m2-5) |
| Artificial Analysis | [MiniMax-M2.5 Intelligence & Price Analysis](https://artificialanalysis.ai/models/minimax-m2-5) |
| Kilo.ai | [MiniMax 2.5 vs GLM-5 Coding Benchmark](https://blog.kilo.ai/p/we-tested-glm-5-and-minimax-m25-across) |
| Ollama | [minimax-m2.5 on Ollama](https://ollama.com/library/minimax-m2.5) |

## Related Notes

- [[260323_DeepSeek_V4_1조_파라미터_출시]]
- [[260322_오픈소스_모델의_급부상]]
- [[260322_GPT-5.4_네이티브_Computer_Use]]
