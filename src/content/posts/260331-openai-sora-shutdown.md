---
tags:
- AI_Daily_Trend
- domain/video-generation
- tech/T2V
source_url: https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/
code_url: ''
code_available: false
model_available: false
license: unknown
status: published
created: 2026-03-31
slug: 260331-openai-sora-shutdown
summary: 2026년 3월 24일, OpenAI가 Sora 앱 및 API 서비스 종료를 공식 발표했다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260331-openai-sora-shutdown/cover.jpg
  alt: 260331 OpenAI Sora Shutdown
date: '2026-03-31'
---

# OpenAI Sora 서비스 종료 — 영상생성 시장 전환점

## 개요

2026년 3월 24일, OpenAI가 Sora 앱 및 API 서비스 종료를 공식 발표했다. 2단계로 진행: (1) Sora 웹/앱 — 4월 26일 종료, (2) Sora API — 9월 24일 종료. WSJ 조사에 따르면 출시 후 전 세계 사용자 수가 약 100만 명에서 50만 미만으로 급감한 가운데, 하루 약 $100만의 운영 비용이 발생하고 있었다.

종료 배경: (1) 사용자 급감 — 피크 100만→50만 미만, (2) 막대한 비용 — 일 $1M 소모, (3) 경쟁 압력 — Anthropic Claude Code가 엔터프라이즈/개발자 시장 점유, (4) 전략 전환 — 코딩 도구와 엔터프라이즈 고객에 컴퓨트 집중, super app 통합 전략.

Disney와의 $10억 투자 딜(2025.12.11 발표, Sora 2에서 200+ 캐릭터 생성 허용)도 무산. Disney는 종료 발표 1시간 전에야 통보받았다. 3월 19일까지 Sora 내 신규 편집 도구를 배포하다 5일 후 종료 발표한 급작스러운 전환.

후속: "Spud" 코드명으로 월드 모델 기반 엔터프라이즈 애플리케이션 개발 계획. Sora는 연구 프로젝트로만 존속.

## 핵심 수치/벤치마크

| 항목 | 수치 |
|------|------|
| 피크 사용자 | ~1,000,000 |
| 종료 시점 사용자 | <500,000 |
| 일일 운영비 | ~$1,000,000 |
| Disney 투자 규모 (무산) | $1,000,000,000 |
| 앱 종료일 | 2026-04-26 |
| API 종료일 | 2026-09-24 |

## 시장 맥락

동일 주에 Helios(Apache 2.0, 14B), LTX 2.3(22B, 오디오 동기), Wan 2.2(MoE, 오픈소스)가 공개되며 오픈소스 영상생성 모델이 상용 수준에 도달. Sora의 종료는 폐쇄형 영상생성 서비스의 단독 수익화 어려움과 오픈소스의 급성장을 동시에 보여주는 전환점.

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ❌ 비공개 (연구 전환) |
| 모델 | ❌ 비공개 |
| 사용자 데이터 | ⚠ 종료 전 내보내기 필요 |
| 후속 프로젝트 | "Spud" (월드 모델, 엔터프라이즈) |

## 나에게 주는 시사점

multimodal generation project 전략에 중요한 **시장 시그널**.

1. **폐쇄형 영상생성 서비스의 한계 입증**: 일 $1M 운영비, 사용자 반감 → 수익 모델 없이 클로즈드 서비스 유지 불가. Memesis가 오픈소스 모델(Helios, LTX 2.3, daVinci) 기반으로 자체 인프라를 구축하는 전략의 정당성 강화.
2. **오픈소스 영상생성의 골든 타임**: Sora 종료 + 동일 주 Helios/LTX 2.3/Wan 2.2 공개. 오픈소스가 상용 수준에 도달한 시점에 시장 리더가 퇴장하는 전환점. Memesis가 이 기회를 선점해야 함.
3. **"Spud" 월드 모델 전환**: OpenAI도 순수 영상생성에서 월드 모델 기반 엔터프라이즈로 피벗. Memesis도 단순 T2V를 넘어 VFX 워크플로우 통합 플랫폼으로의 방향성 검증.

### 관련 볼트 노트

- 260331_Helios_RT_Long_Video — Sora 대체 후보 #1, Apache 2.0
- 260328_LTX-2.3_4K_오디오싱크_영상생성_LTX23 — Sora 대체 후보 #2, 오디오 동기
- 260331_daVinci_MagiHuman_AV_Gen — Sora 대체 후보 #3, single-stream

## 원본 링크

- [TechCrunch](https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/)
- [Variety](https://variety.com/2026/digital/news/openai-shutting-down-sora-video-disney-1236698277/)
- [OpenAI Help](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation)
- [The Decoder](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/)
