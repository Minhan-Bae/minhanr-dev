---
title: FinDeepForecast — 금융 예측 딥리서치 에이전트 실시간 벤치마크 시스템
tags:
- AI_R&D_Paper
- domain/agents
- domain/finance
- tech/agent
- tech/multi-agent
- financial-forecasting
- benchmark
- deep-research
source_url: https://arxiv.org/abs/2601.05039
arxiv_id: '2601.05039'
status: published
created: 2026-04-12
slug: 260412-fin-deep-forecast-multi-agent-financial
summary: '> Li, Yao, Qi, Zhu, Koa, Ng, Liu, Ni et al. (2026-01-08). 멀티에이전트 기반 금융 예측
  시스템을 실시간으로 평가하는 라이브 벤치마크 플랫폼. 이중 트랙(dual-track) 분류체계로 기업 수준·매크로 수준의 반복적/비반복적 예측
  과제를 지속 생성하며, 딥리서치 에이전트의 금융 예측 성능을 연속적으로 평가한다.'
author: MinHanr
publish_ready: true
cover:
  image: https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2601.05039/gradient.png
  alt: FinDeepForecast — 금융 예측 딥리서치 에이전트 실시간 벤치마크 시스템
date: '2026-04-12'
---


# FinDeepForecast — 금융 예측 딥리서치 에이전트 실시간 벤치마크 시스템

> Li, Yao, Qi, Zhu, Koa, Ng, Liu, Ni et al. (2026-01-08). 멀티에이전트 기반 금융 예측 시스템을 실시간으로 평가하는 라이브 벤치마크 플랫폼. 이중 트랙(dual-track) 분류체계로 기업 수준·매크로 수준의 반복적/비반복적 예측 과제를 지속 생성하며, 딥리서치 에이전트의 금융 예측 성능을 연속적으로 평가한다.

## 핵심 기여

1. **라이브 벤치마크 아키텍처**: 정적 데이터셋이 아닌, 실시간으로 새로운 금융 예측 과제를 생성하는 지속 평가 시스템. 데이터 오염(contamination) 문제를 원천적으로 회피.

2. **이중 트랙 분류체계(Dual-Track Taxonomy)**:
   - **기업 트랙**: 개별 종목의 실적 예측, 가격 변동, 이벤트 반응 등
   - **매크로 트랙**: GDP, 금리, 인플레이션, 정책 변화 등 거시 경제 예측
   - 각 트랙 내에서 **반복적(recurrent)** vs **비반복적(non-recurrent)** 과제로 세분화

3. **멀티에이전트 평가 프레임워크**: 단일 에이전트가 아닌, 딥리서치 능력을 갖춘 복수 에이전트 시스템의 협업 예측 성능을 종합 평가

## 방법론

- **과제 자동 생성**: 실시간 금융 데이터(시장 데이터, 뉴스, SEC 공시, 경제 지표)로부터 예측 과제를 자동 구성
- **에이전트 파이프라인**: 정보 수집 → 분석 → 예측 → 검증의 다단계 워크플로우를 멀티에이전트로 분담
- **연속 평가**: 예측 결과를 실제 시장 결과와 자동 대조하여 성능 지표를 실시간 갱신

## R&D 시사점 — OIKBAS 프로젝트 연결

| 프로젝트 | 시사점 |
|----------|--------|
| **TrinityX** | RT-1(수집)→RT-2(수렴) 파이프라인의 금융 예측 확장 모델. 이중 트랙 분류를 TrinityX 매크로 슬롯에 적용하면 기업/매크로 시그널을 구조적으로 분리 가능 |
| **034_Finance** | Insider Scan + Thales Signal의 예측 정확도를 FinDeepForecast 벤치마크 방식으로 후속 검증 가능 — backtesting 자동화 참조 |
| **FinMCP-Bench** | 260329 수집한 FinMCP-Bench와 상호보완. FinMCP-Bench는 MCP 도구 사용 벤치마크, FinDeepForecast는 예측 성능 벤치마크 |

## 관련 연구

- **AIA Forecaster** (2511.07678): LLM 기반 판단 예측에서 인간 수준 달성. 에이전틱 검색 + 감독 에이전트 + 통계적 교정 조합
- **FinWorld** (2508.02292): 금융 AI 전 주기 오픈소스 플랫폼. DL/RL 알고리즘 + LLM 에이전트 자동화 통합
- **FinRobot** (2411.08804): CoT 기반 멀티에이전트 주식 분석 — Data-CoT, Concept-CoT, Thesis-CoT 3단계 파이프라인
- **FutureX** (2508.11987): 실시간 미래 예측 벤치마크 — 72 upvotes, 데이터 오염 방지 설계

## 한계 및 질문

- 에이전트별 개별 성능 vs 협업 성능 분해 분석이 있는지 확인 필요
- 라이브 벤치마크의 인프라 비용 및 지속 운영 모델 미상
- 한국 시장/KRX 데이터 적용 가능성 미확인

## 상세 배경 (보강)

FinDeepForecast는 "Deep Research(DR) 에이전트의 실전 예측 능력을 어떻게 평가할 것인가"라는 **지속 가능한 벤치마킹 인프라** 문제에 초점을 맞춘다. 최근 LLM 기반 DR 에이전트는 복잡한 리서치 과제 수행 방식을 근본적으로 바꿨지만, high-stakes 도메인(특히 금융)에서의 **실시간·end-to-end 평가**는 아직 체계적으로 정립되지 않았다. 기존 벤치마크는 정적이거나 과거 데이터 기반이라 에이전트가 **진짜 미래를 예측하는지**를 검증하지 못한다는 한계가 있었다.

저자들의 해법은 **live multi-agent 벤치마크 생성 시스템**이다. dual-track taxonomy로 recurrent(주간 보고서, 월간 리뷰)와 non-recurrent(신규 이벤트 기반) 예측 과제를 동적 생성한다. 이 시스템으로 구축된 **FinDeepForecastBench**는 10주간 8개 글로벌 경제권 + 1,314개 상장기업을 커버하는 주간 평가 벤치마크다. 13개의 대표적인 DR 에이전트를 평가한 결과, **baseline 대비 일관된 우위**는 확인됐지만 "진짜 forward-looking 금융 추론"에는 아직 못 미친다는 진단이 나왔다. 즉, DR 에이전트는 현재까지 **"과거 데이터를 잘 정리"**하는 수준에 가깝고, 미래 불확실성을 반영한 판단으로는 발전 여지가 크다는 평가.

## 시사점 (보강)

- **에이전트 벤치마킹 방법론의 진전**: Static dataset 기반 평가가 가진 leakage·stale 문제를 **live generation**으로 우회한 설계는 다른 high-stakes 도메인(의료, 법률 등)으로도 전이 가능한 아키텍처다.
- **DR 에이전트의 현실적 한계**: "baseline을 이기지만 forward-looking reasoning에는 부족"이라는 결론은 후속 연구의 **명확한 개선 좌표**를 제공한다. 단순 정보 집약 → 시나리오 추론, 위험 감지, 대안 가설 평가 능력으로의 확장이 과제.
- **MultiAgent orchestration의 참조 구현**: 본 시스템 자체가 "에이전트로 에이전트를 평가하는" 메타 오케스트레이션 사례로서, 개인용 지식 관리/리서치 자동화(TrinityX류) 설계에 직접 참조 가능한 아키텍처 패턴을 제공한다.
