---
tags:
  - AI_Daily_Trend
  - domain/llm
  - AI_R&D_Paper
source_type: paper-review
source_platform:
  - ArXiv
  - HuggingFace
  - Reddit
  - X
status: mature
created: 2026-03-25
relevance: 3
related: ["Memesis"]
source_url: ""
---
## 한줄 요약

Moonshot AI(Kimi) 팀이 10년간 고정되어 온 Transformer의 잔차 연결(Residual Connection)을 깊이 방향 어텐션으로 대체하는 **Attention Residuals**를 발표, GPQA-Diamond에서 +7.5pt 향상을 달성했다.

## 핵심 내용

Transformer 아키텍처의 가장 기본적인 구성 요소인 잔차 연결(Residual Connection)은 2015년 ResNet 이후 사실상 변경 없이 사용되어 왔다. Moonshot AI의 Kimi 팀은 이 고정 가중치(=1) 잔차 연결이 깊은 모델에서 **신호 희석(Signal Dilution)** 문제를 일으킨다는 점을 지적하며, 이를 학습 가능한 어텐션 메커니즘으로 대체하는 **Attention Residuals (AttnRes)**를 제안했다.

기존 PreNorm Transformer에서는 각 레이어의 출력이 동일한 가중치(1)로 누적되어, 모델이 깊어질수록 개별 레이어의 기여가 희석되고 히든 스테이트의 크기가 무한히 증가하는 문제가 있었다. AttnRes는 이를 소프트맥스 어텐션으로 대체하여, 각 레이어가 이전 모든 레이어 출력에 대해 **입력 의존적(input-dependent)** 가중치를 학습하도록 한다.

논문은 arXiv:2603.15031로 공개되었으며, GitHub에서 코드도 함께 제공된다.

## 기술적 분석

Moonshot AI의 Kimi 팀이 발표한 Attention Residuals(arXiv:2603.15031)는 10년간 고정되어 온 Transformer의 잔차 연결을 학습 가능한 어텐션 메커니즘으로 대체한 혁신 기법이다. 기존 PreNorm Transformer는 고정 가중치로 각 레이어 출력을 동일하게 누적하여 깊은 모델에서 신호 희석 문제가 발생하지만, Attention Residuals는 각 레이어가 이전 모든 레이어 출력에 대해 소프트맥스 어텐션을 통해 입력 의존적 가중치를 학습한다. Block Attention Residuals는 레이어를 블록 단위로 그룹화하여 메모리 오버헤드를 최소화하면서 성능 향상을 달성한다. 이는 Drop-in replacement로 기존 훈련 파이프라인에 바로 적용 가능하며, 추가 컴퓨트 없이 순수 아키텍처 개선만으로 성능 향상을 가능하게 한다.

## 시사점 & 액션 아이템

- **왜 중요한가**: 10년간 고정되어 온 Transformer의 가장 기본적인 구성 요소를 재검토함으로써, 추가 컴퓨트 없이 모델 성능을 끌어올릴 수 있음을 보여준다. 이는 "아키텍처 개선의 여지가 아직 많다"는 신호이다.
- **실무 적용**: Drop-in replacement이므로, 기존 훈련 파이프라인이나 추론 인프라 수정 없이 바로 적용 가능하다. 커스텀 모델을 사전학습하는 팀이라면 즉시 실험해볼 가치가 있다.
- **오픈소스 모델에의 파급**: Qwen, Llama 등 오픈소스 모델의 차기 버전에서 이 기법을 채택할 가능성이 높다. 향후 모델 아키텍처 비교 시 잔차 연결 방식을 확인할 필요가 있다.
- **연구 방향**: PreNorm 외에도 PostNorm, RMSNorm 등 다양한 정규화 방식과의 조합 실험이 후속 연구로 기대된다.

## 출처

| 플랫폼 | 링크 |
|--------|------|
| ArXiv | [2603.15031](https://arxiv.org/abs/2603.15031) |
| GitHub | [MoonshotAI/Attention-Residuals](https://github.com/MoonshotAI/Attention-Residuals) |
| HuggingFace | [Papers - Attention Residuals](https://huggingface.co/papers/2603.15031) |
| MarkTechPost | [Moonshot AI Releases Attention Residuals](https://www.marktechpost.com/2026/03/15/moonshot-ai-releases-%F0%9D%91%A8%F0%9D%92%95%F0%9D%92%95%F0%9D%92%86%F0%9D%92%8F%F0%9D%92%95%F0%9D%92%8A%F0%9D%92%90%F0%9D%92%8F-%F0%9D%91%B9%F0%9D%92%86%F0%9D%92%94%F0%9D%92%8A%F0%9D%92%85/) |
| ToKnow.ai | [Attention Residuals: Drop-In Fix](https://toknow.ai/posts/attention-residuals-moonshot-ai-kimi-drop-in-fix-prenorm-dilution/) |
| DataCamp | [Attention Residuals Explained](https://www.datacamp.com/blog/attention-residuals-explained) |

## Related Notes

- [[260322_NVIDIA_Nemotron_3_Super_하이브리드_MoE]] — MoE와 함께 아키텍처 혁신의 또 다른 축
- [[260323_DeepSeek_V4_1조_파라미터_출시]] — 대형 모델에서의 아키텍처 최적화 필요성
