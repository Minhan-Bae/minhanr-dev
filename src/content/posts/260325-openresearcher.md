---
tags:
- AI_Daily_Trend
- domain/agents
- domain/open-source
- domain/research
- AI_R&D_Paper
source_platform:
- HuggingFace
- ArXiv
- X
- GitHub
status: published
created: 2026-03-25
source_url: ''
slug: 260325-openresearcher
summary: TIGER-Lab이 프로프라이어터리 웹 API 없이 완전 오프라인으로 97K+ 딥리서치 궤적(trajectory)을 합성하는 오픈소스
  파이프라인 OpenResearcher를 공개, BrowseComp-Plus에서 +34pt 향상을 달성했다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260325-openresearcher/cover.png
  alt: 260325 OpenResearcher 오픈소스 딥리서치 파이프라인
date: '2026-03-25'
categories:
  - Research
---
## 한줄 요약

TIGER-Lab이 프로프라이어터리 웹 API 없이 완전 오프라인으로 97K+ 딥리서치 궤적(trajectory)을 합성하는 오픈소스 파이프라인 **OpenResearcher**를 공개, BrowseComp-Plus에서 +34pt 향상을 달성했다.

## 핵심 내용

딥리서치(Deep Research) 에이전트는 검색, 증거 수집, 다단계 추론을 인터리빙하는 장기 궤적(long-horizon trajectory) 데이터가 필요하지만, 기존 파이프라인은 프로프라이어터리 웹 API(Google Search, Bing 등)에 의존하여 대규모 합성이 비용이 높고 재현이 어려웠다.

TIGER-Lab의 **OpenResearcher**는 이 문제를 해결한다. 핵심 아이디어는 "**일회성 코퍼스 부트스트래핑**"과 "**다회전 궤적 합성**"을 분리하고, search-and-browse 루프를 세 가지 명시적 브라우저 프리미티브(`search`, `open`, `find`)로 완전 오프라인 실행하는 것이다.

논문은 HuggingFace에서 457 likes를 기록하며 트렌딩 1위를 차지했고, 모델과 데이터셋 모두 공개되었다.

## 기술적 분석

TIGER-Lab의 OpenResearcher는 프로프라이어터리 웹 API 없이 완전 오프라인으로 대규모 딥리서치 궤적을 합성하는 파이프라인이다. 핵심 설계는 일회성 코퍼스 부트스트래핑과 다회전 궤적 합성을 분리하고, search, open, find 세 가지 브라우저 프리미티브를 명시적으로 구현하여 로컬 오프라인 실행을 가능하게 한다. 소형 MoE 모델 구조로도 효과적인 딥리서치 데이터 합성이 가능하며, 모델과 데이터셋 모두 공개되어 오픈소스 커뮤니티에 기여했다. NVIDIA Nemotron 모델 패밀리에 채택되면서 산업적 검증을 확보했다.

## 시사점 & 액션 아이템

- **왜 중요한가**: 딥리서치 에이전트 훈련의 "데이터 병목"을 오픈소스로 해결한 첫 번째 완전한 파이프라인이다. 프로프라이어터리 API 비용과 비결정성 문제를 근본적으로 해결한다.
- **실무 적용**: 사내 문서나 도메인 특화 코퍼스로 부트스트래핑하면, 조직 맞춤형 딥리서치 에이전트를 구축할 수 있다. 법률, 의료, 금융 등 도메인 특화 연구 에이전트에 큰 잠재력이 있다.
- **MoE 효율성 확인**: 30B 전체 파라미터 중 3B만 활성화하는 MoE 구조로도 딥리서치가 가능하다는 점은, 추론 비용 면에서 매우 고무적이다.
- **NVIDIA 채택**: Nemotron 모델 패밀리에 이미 채택되어, 산업적 검증이 이루어지고 있다.
- **팔로업**: HuggingFace에서 모델([TIGER-Lab/OpenResearcher](https://huggingface.co/collections/TIGER-Lab/openresearcher))과 데이터셋을 다운로드하여 직접 실험해볼 것.

## 출처

| 플랫폼 | 링크 |
|--------|------|
| ArXiv | [2603.20278](https://arxiv.org/abs/2603.20278) |
| GitHub | [TIGER-AI-Lab/OpenResearcher](https://github.com/TIGER-AI-Lab/OpenResearcher) |
| HuggingFace | [TIGER-Lab Collection](https://huggingface.co/collections/TIGER-Lab/openresearcher) |
| X | [Dongfu Jiang 공개 트윗](https://x.com/DongfuJiang/status/2020946549422031040) |

## Related Notes

- 260323_EvoScientist_자기진화_AI_과학자 — AI 연구 자동화의 다른 접근
- 260322_오픈소스_모델의_급부상 — 오픈소스 생태계 확장 트렌드
