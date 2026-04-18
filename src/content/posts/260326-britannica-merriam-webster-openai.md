---
tags:
- AI_Daily_Trend
- domain/industry
source_platform:
- X
- Reddit
- Blog
status: published
created: 2026-03-26
source_url: ''
slug: 260326-britannica-merriam-webster-openai
summary: Encyclopedia Britannica와 Merriam-Webster가 OpenAI를 상대로 ~10만 건 저작물 무단 사용, RAG
  기반 콘텐츠 복제, 할루시네이션 허위 귀속에 대한 저작권·상표법 소송을 제기했다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260326-britannica-merriam-webster-openai/cover.jpg
  alt: 260326 Britannica Merriam Webster OpenAI 저작권소송
date: '2026-03-26'
categories:
  - Industry
---
## 한줄 요약

Encyclopedia Britannica와 Merriam-Webster가 OpenAI를 상대로 **~10만 건 저작물 무단 사용**, RAG 기반 콘텐츠 복제, 할루시네이션 허위 귀속에 대한 저작권·상표법 소송을 제기했다.

## 핵심 내용

2026년 3월 16일, 247년 역사의 Encyclopedia Britannica와 미국 대표 사전 Merriam-Webster가 OpenAI를 상대로 뉴욕 연방법원에 소송을 제기했다. 핵심 주장은 OpenAI가 약 **100,000건의 저작권 보호 기사**를 무단으로 LLM 훈련에 사용했다는 것이다.

이 소송이 기존 AI 저작권 소송과 차별화되는 점은 **세 가지 법적 이론을 동시에 제기**한 것이다:

1. **저작권 침해**: LLM 훈련 시 저작물 무단 사용
2. **RAG 기반 실시간 복제**: ChatGPT가 Retrieval-Augmented Generation으로 실시간으로 Britannica 콘텐츠를 검색·재생산
3. **Lanham Act(상표법) 위반**: ChatGPT가 할루시네이션으로 생성한 가짜 정보를 Britannica/MW에 허위 귀속

소송장에는 구체적인 증거가 포함되어 있다:
- "Merriam-Webster에서 'plagiarize'를 어떻게 정의하나요?"라는 질문에 ChatGPT가 MW 사전의 정의를 **그대로 복제**하여 응답
- Hamilton-Burr 결투에 대한 질문에 Britannica 기사의 **편집자가 큐레이션한 인용문 선택과 순서를 동일하게** 재현

Britannica 측은 "ChatGPT가 사용자 쿼리에 대한 응답을 생성하면서 퍼블리셔의 수익을 직접적으로 잠식한다"고 주장하며, **영구적 금지 명령과 부당 이익 환수**를 요청했다.

OpenAI는 "우리 모델은 공개적으로 이용 가능한 데이터로 훈련되며 공정 이용에 기반한다"고 반박했다.

## 기술적 분석

### 법적 쟁점 구조

| 청구 원인 | 핵심 논거 | 기술적 쟁점 |
|-----------|-----------|-------------|
| **저작권 침해 (훈련)** | 10만 기사 무단 사용 | 훈련 데이터의 공정 이용(fair use) 범위 |
| **저작권 침해 (RAG 출력)** | 실시간 검색·복제·대체 | RAG가 "복제"인지 "변환적 사용"인지 |
| **Lanham Act 위반** | 할루시네이션 허위 귀속 | AI 출력물에 대한 상표법 적용 가능성 |

### RAG 관련 쟁점의 기술적 의미

이 소송은 **RAG 아키텍처 자체**에 대한 법적 도전이라는 점에서 업계에 중대한 영향을 미칠 수 있다. RAG는 현재 거의 모든 상업 AI 시스템의 핵심 구성 요소인데, 만약 법원이 "RAG를 통한 콘텐츠 검색·재생산이 저작권 침해"라고 판단하면, 산업 전반의 아키텍처 재검토가 필요해진다.

### 관련 소송 맥락

| 원고 | 피고 | 시기 |
|------|------|------|
| New York Times | OpenAI | 2023 |
| Ziff Davis (CNET, Mashable 등) | OpenAI | 2025 |
| **Britannica + MW** | **OpenAI** | **2026.03** |
| Britannica + MW | Perplexity | 2025.09 |
| 미국·캐나다 12개+ 신문사 | OpenAI | 2024–2025 |

## 시사점 & 액션 아이템

**왜 중요한가:**
- **RAG 아키텍처의 법적 리스크**: RAG가 "요약"이 아니라 "복제"로 판단될 경우, 모든 RAG 기반 서비스(검색 엔진, 챗봇, 리서치 도구)의 법적 기반이 흔들린다.
- **할루시네이션의 법적 책임**: AI가 잘못된 정보를 특정 출판사에 귀속시키는 것이 상표법 위반이 될 수 있다는 논리는 새로운 법적 프레임워크를 제시한다. 이는 "AI 할루시네이션 = 단순 오류"가 아니라 **법적 책임이 따르는 행위**로 전환될 수 있음을 의미한다.
- **$730B 기업가치 vs 저작권**: OpenAI의 기업가치가 $730B에 달하는 상황에서, "공개 데이터 기반 공정 이용" 방어 논리가 법원에서 통할지가 핵심 쟁점이다.

**액션 아이템:**
- [ ] 소송 진행 상황 추적 (특히 RAG 관련 법원 판단)
- [ ] 자체 RAG 파이프라인의 저작권 리스크 점검 (출처 표기, 콘텐츠 필터링 등)
- [ ] 할루시네이션 귀속 문제에 대한 기술적 대응 방안 (출처 검증 레이어 등) 검토

## 출처

| 플랫폼 | 링크 |
|---------|------|
| TechCrunch | [The dictionary sues OpenAI](https://techcrunch.com/2026/03/16/merriam-webster-openai-encyclopedia-brittanica-lawsuit/) |
| Fortune | [Dictionaries suing OpenAI for 'massive' copyright infringement](https://fortune.com/2026/03/18/dictionaries-suing-openai-chatgpt-copyright-infringement/) |
| The Next Web | [Britannica and Merriam-Webster sue OpenAI](https://thenextweb.com/news/britannica-merriam-webster-openai-lawsuit-copyright) |
| Washington Times | [Encyclopedia Britannica, MW sue OpenAI](https://www.washingtontimes.com/news/2026/mar/17/encyclopedia-britannica-merriam-webster-sue-openai-massive-copyright/) |
| The AI Insider | [Britannica and MW File Lawsuit](https://theaiinsider.tech/2026/03/17/britannica-and-merriam-webster-file-lawsuit-against-openai-over-ai-training-and-content-use/) |

## Related Notes

- 260325_OpenAI_120B_펀딩_확대_조직재편 — OpenAI 최신 동향
- 260325_OpenAI_Sora_앱_종료_딥페이크_논란 — OpenAI 제품 관련 이슈
- 260325_Spotify_아티스트_프로필_보호_AI_딥페이크_대응 — AI 저작권/IP 보호 동향
