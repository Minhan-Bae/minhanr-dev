---
tags:
- AI_Daily_Trend
- domain/simulation
- domain/video
- AI_R&D_Paper
source_platform:
- ArXiv
- HuggingFace
- GitHub
status: published
created: 2026-03-26
source_url: ''
slug: 260326-seoul-world-model
summary: NAVER AI Lab x KAIST 공동 연구팀이 서울 실제 스트리트뷰 데이터를 기반으로, 수 킬로미터 궤적에 걸친 시공간적으로
  일관된 도시 비디오를 생성하는 도시 규모 월드 모델(Seoul World Model)을 발표했다
author: MinHanr
publish_ready: true
cover:
  image: /images/posts/260326-seoul-world-model/cover.png
  alt: 260326 Seoul World Model 도시규모 월드시뮬레이션
date: '2026-03-26'
categories:
  - Writing
---
## 한줄 요약

NAVER AI Lab x KAIST 공동 연구팀이 서울 실제 스트리트뷰 데이터를 기반으로, 수 킬로미터 궤적에 걸친 시공간적으로 일관된 도시 비디오를 생성하는 **도시 규모 월드 모델(Seoul World Model)**을 발표했다. Busan-City-Bench에서 FID 28.43, FVD 301.76으로 기존 SOTA(HY-World1.5의 49.63/544.04) 대비 압도적 우위.

## 연구 배경 및 동기

비디오 월드 모델(Video World Model)은 주어진 조건(카메라 궤적, 텍스트 프롬프트 등)에 따라 환경의 비디오를 생성하는 모델이다. 자율주행 시뮬레이션, 로보틱스 훈련, 디지털 트윈 등에서 핵심 기술로 부상하고 있다. 그러나 기존 월드 모델들은 크게 두 가지 한계를 가진다:

1. **합성 환경 의존**: 대부분 Unity/Unreal Engine 기반의 합성 도시나 Waymo/nuScenes 같은 제한된 주행 데이터셋으로 학습. 실제 도시의 복잡성(건물 디테일, 간판, 가로수, 보행자 등)을 충분히 반영하지 못한다.
2. **단거리 제한**: 수초~수십 초의 짧은 비디오만 생성 가능. 자기회귀 생성 시 오차가 누적되어 장거리에서 품질이 급격히 저하(visual drift)된다.

Seoul World Model(SWM)은 이 두 한계를 동시에 돌파한다. **실제 도시(서울)**의 120만 파노라마 스트리트뷰 이미지를 기반으로, **수 킬로미터** 궤적에 걸친 일관된 비디오 생성을 달성했다. 핵심 혁신은 **Retrieval-Augmented Generation(RAG)**을 비디오 월드 모델에 적용한 것이다.

## 방법론: RAG 기반 도시 규모 월드 시뮬레이션

### 아키텍처 개요

SWM은 **Cosmos-Predict2.5-2B**를 베이스 모델로 사용한다. 28개 블록, 16개 어텐션 헤드를 가진 2B 파라미터 Diffusion Transformer(DiT)이며, 16채널 잠재 공간에서 3D VAE(4배 시간 압축, 8배 공간 압축)를 통해 동작한다.

![Figure: SWM 모델 아키텍처 개요 — Retrieval-Augmented Conditioning과 생성 파이프라인](https://seoul-world-model.github.io/assets/model.png)

생성 과정은 다음과 같다: 모델은 카메라 궤적, 텍스트 프롬프트, 노이즈 잠재 벡터를 입력으로 받아 비디오 청크를 자기회귀적으로 생성한다. 각 후속 청크는 이전 청크의 마지막 H개 히스토리 잠재 벡터를 조건으로 사용한다.

SWM의 핵심 차별점은 **두 가지 경로의 레퍼런스 컨디셔닝**이다:

**1) 기하학적 경로(Geometric Pathway) — 깊이 기반 순방향 스플래팅**:
- 가장 가까운 스트리트뷰 이미지를 깊이 추정과 함께 타겟 뷰포인트로 재투영
- 수식: $x_{warp,t} = \text{Render}(\text{Unproj}(x_{ref,j}, d_{ref,j}), c_{ref,j \to t})$
- 밀집한 공간 레이아웃 단서를 제공
- 아티팩트 방지를 위해 프레임당 단일 최근접 레퍼런스만 사용

**2) 의미적 경로(Semantic Pathway)**:
- K개의 레퍼런스 이미지를 모두 잠재 시퀀스로 인코딩
- 큰 시간 간격(G=50)으로 주입하여 모든 K개 레퍼런스에 어텐션 가능
- 보완적인 외관 단서(appearance cues) 제공

### Cross-Temporal Pairing (교차 시간 정합)

SWM의 가장 중요한 설계 결정 중 하나이다. 학습 시 레퍼런스 이미지와 타겟 시퀀스는 반드시 **다른 시점(timestamp)**에 촬영된 것을 사용한다.

![Figure: Cross-Temporal Pairing의 어텐션 시각화 — 시간이 다른 레퍼런스와 타겟 간의 정합](https://seoul-world-model.github.io/assets/vis_attn.png)

이 설계의 근거는 명확하다: 같은 시점의 레퍼런스를 사용하면 모델이 **과도한(transient) 객체**(주차된 차량, 보행자 등)를 그대로 복사하는 지름길을 학습한다. 실제 추론 시에는 레퍼런스가 과거에 촬영된 것이므로, 이런 일시적 요소는 이미 사라져 있다. 교차 시간 정합은 모델이 **시간에 불변하는 영구적 공간 구조**(건물, 도로, 지형)에만 의존하도록 강제한다.

Ablation 결과: 교차 시간 정합을 제거하면 FID가 28.43 → 44.74로 **57.3% 악화**, TransErr가 0.015 → 0.123으로 **8.2배 증가**한다.

### View Interpolation Pipeline (뷰 보간 파이프라인)

스트리트뷰 이미지는 5~20m 간격으로 촬영되어 매우 희소(sparse)하다. 이를 연속적인 학습용 비디오로 변환하기 위해 **Intermittent Freeze-Frame** 전략을 사용한다.

![Figure: 스트리트뷰 보간 모델 — 희소 이미지로부터 연속 비디오 합성](https://seoul-world-model.github.io/assets/interp_only.png)

기존 채널 연결(channel concatenation) 방식 대비, Intermittent Freeze-Frame은 3D VAE의 시간 stride에 맞추어 동작하여 PSNR 22.52 → 25.03, LPIPS 0.245 → 0.162로 크게 개선되었다.

### Virtual Lookahead (VL) Sink

장거리 자기회귀 생성에서 가장 심각한 문제는 **오차 누적**이다. 기존 방법들은 첫 프레임을 어텐션 싱크(attention sink)로 고정하지만, 카메라가 수백 미터 이동하면 첫 프레임의 안내 효과가 급격히 약화된다.

![Figure: Virtual Lookahead Sink 메커니즘 — 미래 위치의 레퍼런스 이미지로 지속적 재정박](https://seoul-world-model.github.io/assets/sink.png)

VL Sink는 이 문제를 **동적 미래 앵커링**으로 해결한다:
- 각 생성 청크의 궤적 끝점에서 가장 가까운 스트리트뷰 이미지를 검색
- 이를 "가상 미래 목적지(virtual future destination)"로 설정
- RoPE 시간 위치 임베딩에서 현재 생성 윈도우를 넘어선 위치($\Delta_{VL} = 5$)에 배치
- 학습 시에는 랜덤 오프셋의 미래 실제 프레임을 사용하여 가변 lookahead 거리를 학습

이 메커니즘은 각 청크를 깨끗한(error-free) 미래 앵커에 지속적으로 재정박(re-grounding)하여, 수백 미터 이상의 궤적에서도 비디오 품질을 안정적으로 유지한다.

**1,460프레임 장거리 평가**:

| 싱크 타입 | FID↓ | FVD↓ | TransErr↓ | mPSNR↑ |
|-----------|------|------|-----------|--------|
| 싱크 없음 | 37.37 | 550.81 | 0.041 | 12.94 |
| 첫 프레임 싱크 | 30.85 | 440.65 | 0.044 | 13.08 |
| 첫 위치 싱크 | 28.57 | 439.69 | 0.021 | 13.34 |
| **VL Sink (Full)** | **25.13** | **394.58** | **0.029** | **13.70** |

VL Sink는 싱크 없음 대비 FID **32.7% 개선**, FVD **28.4% 개선**을 달성했다.

## 학습 데이터 구성

![Figure: 데이터 구성 개요 — 실제 스트리트뷰와 합성 데이터셋](https://seoul-world-model.github.io/assets/data.png)

| 데이터 소스 | 규모 | 비율 |
|------------|------|------|
| **서울 스트리트뷰** (NAVER Map) | 120만 파노라마 → 44만장 정제 | 40% |
| **합성 데이터** (CARLA) | 12.7K 비디오, 6개 도시 맵, 431,500m2 | 40% |
| **Waymo 주행 데이터** | 다양한 주행 시나리오 | 20% |

서울 스트리트뷰의 커버리지는 동서 약 44.8km, 남북 약 31.0km에 달하는 서울 전역이다.

### 학습 설정

| 항목 | Teacher-Forcing (TF) | Self-Forcing (SF) |
|------|----------------------|-------------------|
| 청크 길이 | 77 프레임 | 12 프레임 |
| 히스토리 잠재 벡터 (H) | 5 | 3 (KV cache) |
| 레퍼런스 수 (K) | 5 | 1 |
| 시간 간격 (G) | 50 | - |
| 옵티마이저 | AdamW, LR 4.8e-5 | AdamW |
| 학습 반복 | 10K iterations | ODE 초기화 1K쌍 6K스텝 + 10K fine-tuning |
| GPU | 24x H100 (총 배치 48) | - |
| 추론 속도 (SF) | - | 15.2 fps (단일 H100) |

## 정량적 결과: 도시별 벤치마크

### Busan-City-Bench / Ann-Arbor-City-Bench

| 방법 | FID↓ (부산/AA) | FVD↓ (부산/AA) | TransErr↓ (부산/AA) | mPSNR↑ (부산/AA) |
|------|---------------|---------------|---------------------|-----------------|
| Aether | 141.24/132.77 | 1096.50/1214.84 | 0.083/0.192 | 11.10/13.03 |
| DeepVerse | 130.32/182.95 | 892.63/1524.97 | 0.103/0.469 | 12.20/13.43 |
| FantasyWorld | 83.51/67.72 | 783.11/917.57 | 0.141/0.302 | 10.01/11.97 |
| LingBot | 62.14/57.99 | 717.44/1039.50 | 0.073/0.239 | 10.48/12.51 |
| Yume1.5 | 54.82/85.62 | 425.24/993.62 | 0.104/0.271 | 12.09/14.15 |
| HY-World1.5 | 49.63/67.02 | 544.04/864.76 | 0.079/0.221 | 11.87/14.26 |
| **SWM (TF)** | **28.43/56.61** | **301.76/640.17** | **0.015/0.154** | **14.56/15.18** |

SWM은 부산에서 차선 방법(HY-World1.5) 대비 FID **42.8% 개선**(49.63 → 28.43), FVD **44.5% 개선**(544.04 → 301.76)을 달성했다. 특히 TransErr(카메라 궤적 준수도)에서 0.015로 HY-World1.5(0.079) 대비 **81% 개선**을 보여 공간적 충실도가 탁월하다.

Ann Arbor(미국)에서도 FID 56.61, FVD 640.17로 다른 모든 방법을 앞서, **한국 데이터로 학습한 모델이 미국 도시에서도 일반화**에 성공했음을 입증한다.

### 컴포넌트별 Ablation (Busan-City-Bench)

| 설정 | FID↓ | FVD↓ | TransErr↓ | mPSNR↑ |
|------|------|------|-----------|--------|
| **Full Model** | **28.43** | **301.76** | **0.015** | **14.56** |
| w/o Cross-Temporal Pairing | 44.74 | 487.87 | 0.123 | 12.54 |
| w/o Synthetic Data | 27.74 | 365.24 | 0.020 | 13.52 |
| w/o Geometric Referencing | 33.01 | 398.74 | 0.051 | 12.33 |
| w/o Semantic Referencing | 30.27 | 326.18 | 0.022 | 14.08 |
| w/o Any Attention Sink | 33.06 | 342.81 | 0.016 | 14.16 |
| w/ First-Frame Sink | 32.71 | 378.92 | 0.018 | 14.25 |

이 ablation에서 가장 중요한 발견은 **Cross-Temporal Pairing의 결정적 역할**이다. 이를 제거하면 FID가 57.3% 악화되며, 이는 다른 어떤 컴포넌트 제거보다 큰 성능 저하이다. Geometric Referencing과 Semantic Referencing은 상보적으로 동작하며, 둘 중 하나만 제거해도 성능이 저하되지만 Cross-Temporal Pairing만큼 치명적이지는 않다.

## 한계점 및 향후 연구 방향

1. **데이터 의존성**: 대규모 스트리트뷰 데이터(NAVER Map)에 강하게 의존. 스트리트뷰 커버리지가 낮은 지역(골목, 비도시 지역)에서는 성능 저하가 예상된다.
2. **동적 객체의 한계**: Cross-Temporal Pairing이 일시적 객체를 의도적으로 무시하도록 학습하므로, 교통 상황이나 보행자 흐름 같은 동적 요소의 현실감이 부족할 수 있다.
3. **시간적 변화 미반영**: 현재 모델은 특정 시점의 도시 모습을 생성하며, 계절/시간대 변화에 따른 동적 렌더링(야간 조명, 눈 내리는 풍경 등)은 텍스트 프롬프트에 의존한다.
4. **추론 비용**: Teacher-Forcing 모드에서는 24x H100 학습이 필요하며, Self-Forcing 모드에서도 단일 H100에서 15.2fps로 실시간에는 미달한다.
5. **레퍼런스 밀도 민감도**: K=5 → K=1로 줄이면 mPSNR이 저하되어, 레퍼런스 이미지 밀도가 낮은 지역에서 품질 저하가 우려된다.

## 시사점 & 액션 아이템

### 왜 중요한가

**자율주행 시뮬레이션 혁신**: 실제 도시 데이터 기반 월드 모델은 자율주행 테스트에서 합성 환경의 한계를 극복할 수 있다. 실제 도로 조건, 건물 배치, 교통 상황을 반영한 시뮬레이션이 가능해진다. Google Street View, Apple Maps, NAVER Map 등 대규모 스트리트뷰 데이터를 보유한 기업들이 유사한 월드 모델을 구축할 수 있는 로드맵을 제시한다.

**디지털 트윈의 새 접근**: GIS/3D 스캔 기반의 기존 디지털 트윈과 달리, 2D 이미지만으로 도시 규모 시뮬레이션을 생성하는 것은 비용과 접근성 측면에서 혁신적이다. LiDAR/포토그래메트리 없이도 도시 규모 시뮬레이션이 가능해진다.

**한국 AI 연구의 글로벌 임팩트**: NAVER AI Lab과 KAIST의 산학 협력이 ArXiv/HuggingFace에서 주목받고 있으며, NAVER Map이라는 독자적 데이터 자산이 연구 경쟁력으로 이어진 사례다.

### real-time VFX rendering pipeline 프로젝트 연관성

real-time VFX rendering pipeline 프로젝트의 시뮬레이션/렌더링 요구에 직접 관련된다:

1. **도시 규모 시뮬레이션 백엔드**: PathFinder의 네비게이션/경로 시뮬레이션에서 실제 도시 환경의 비디오를 생성하는 백엔드로 SWM을 활용 가능. RAG 기반 아키텍처는 검색 DB만 교체하면 다른 도시에도 적용 가능하다.

2. **Virtual Lookahead Sink**: 이 메커니즘은 PathFinder에서 장거리 경로 시뮬레이션의 일관성 유지에 직접 차용 가능. 경로의 미래 지점 이미지를 앵커로 사용하는 패턴이다.

3. **Retrieval-Augmented Conditioning**: PathFinder의 실시간 렌더링에서 기존 스트리트뷰 이미지를 검색하여 생성 품질을 높이는 전략으로 활용 가능.

### 액션 아이템

- [ ] 프로젝트 페이지 데모 영상 확인 → [seoul-world-model.github.io](https://seoul-world-model.github.io/)
- [ ] Virtual Lookahead Sink 메커니즘의 real-time VFX rendering pipeline 적용 아키텍처 설계
- [ ] NAVER Map API 활용 가능성 및 유사 프로젝트 적용 아이디어 탐색
- [ ] AMI Labs 월드 모델과의 접근 방식 차이 비교
- [ ] CARLA 합성 데이터 생성 파이프라인 재현 및 커스텀 데이터 생성 테스트
- [ ] Self-Forcing 모드의 15.2fps 성능이 real-time VFX rendering pipeline 실시간 요구에 충분한지 프로파일링

## 출처

| 플랫폼 | 링크 |
|---------|------|
| Project Page | [seoul-world-model.github.io](https://seoul-world-model.github.io/) |
| ArXiv | [2603.15583](https://arxiv.org/abs/2603.15583) |
| ArXiv HTML | [전문 보기](https://arxiv.org/html/2603.15583) |
| GitHub | [naver-ai/seoul-world-model](https://github.com/naver-ai/seoul-world-model) |
| HuggingFace | [Paper page](https://huggingface.co/papers/2603.15583) |

## Related Notes

- 260323_AMI_Labs_World_Model_10억달러_시드 — 월드 모델 스타트업 대규모 투자
- 260324_LTX_2.3_Helios_비디오_생성_모델 — 비디오 생성 모델
- 260324_SAMA_Instruction_Guided_Video_Editing — 비디오 편집 기술
