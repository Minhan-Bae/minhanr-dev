---
tags:
- AI_Daily_Trend
- domain/multimodal
- domain/video
- domain/audio
- tech/MoE
- tech/attention
source_url: https://huggingface.co/meituan-longcat/LongCat-Next
code_url: https://github.com/meituan-longcat/LongCat-Next
license: MIT
code_available: true
model_available: true
status: published
created: 2026-03-29
slug: 260329-meituan-longcat-next-lcnx
summary: Meituan이 LongCat-Next를 오픈소스 공개 (March 25, 2026)
author: MinHanr
publish_ready: true
cover:
  image: https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260329-meituan-longcat-next-lcnx/cover.png
  alt: 260329 Meituan LongCat-Next 네이티브 멀티모달 LCNX
date: '2026-03-29'
categories:
  - Writing
---

# Meituan LongCat-Next — 네이티브 디스크리트 Any-to-Any 멀티모달 모델

> Meituan이 LongCat-Next를 오픈소스 공개 (March 25, 2026). 텍스트·비전·오디오를 단일 오토리그레시브 토큰 예측 프레임워크로 통합한 네이티브 멀티모달 모델. 68.5B 총 파라미터, 3B 활성 (MoE A3B), MIT 라이선스.

![Figure 1](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260329-meituan-longcat-next-lcnx/fig-1.png)
*Source: [arXiv 2509.01322 (Fig. 1)](https://arxiv.org/abs/2509.01322)*

![Figure 2](https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/260329-meituan-longcat-next-lcnx/fig-2.png)
*Source: [arXiv 2510.22200 (Fig. 1)](https://arxiv.org/abs/2510.22200)*

## 핵심 내용

### 아키텍처: DiNA + dNaViT

LongCat-Next는 **DiNA (Discrete Native Autoregression)** 패러다임을 제안한다. 기존 멀티모달 모델이 비전 인코더를 언어 모델에 볼트-온(bolt-on) 방식으로 붙이는 것과 달리, DiNA는 비전과 오디오를 언어의 내재적 확장으로 취급하여 모든 모달리티를 **공유 디스크리트 토큰 공간**에서 단일 Next Token Prediction 목표로 학습한다.

핵심 구성 요소:
- **DiNA 프레임워크**: 하나의 오토리그레시브 백본이 멀티모달 이해(understanding)와 생성(generation)을 동시에 수행. 이해와 생성을 하나의 대칭적 토큰 예측 문제로 통합 최적화.
- **dNaViT (Discrete Native Any-Resolution Vision Transformer)**: 임의 해상도의 비주얼 토크나이저. **SAE (Semantic-and-Aligned Encoders)** + **8-layer RVQ (Residual Vector Quantization)** 압축으로 시맨틱 추상화와 세밀한 비주얼 디테일을 동시에 보존하며 28× 압축 비율을 달성.
- **MoE A3B 백본**: LongCat-Flash-Lite MoE 기반, 총 68.5~74B 파라미터 중 3B만 활성화하여 효율적 추론. weights 총량 약 161GB.

### 성능 및 벤치마크

- 디스크리트 비전 모델링의 **이해 태스크 성능 한계(performance ceiling)를 최초로 돌파**했다고 주장. 기존 디스크리트 토큰 방식은 연속형(continuous) 모델 대비 이해 벤치마크에서 열위였으나, LongCat-Next는 전문 이해 모델(specialized understanding models)과 경쟁력 있는 성능을 달성.
- 28× 압축에서도 텍스트 렌더링 등 세밀한 생성 품질을 유지.
- 텍스트 생성, 코드, 도구 호출(tool calling), 음성 이해, 저지연 음성 대화, 음성 클로닝 지원.

### 지원 모달리티

| 모달리티 | 이해 | 생성 |
|----------|------|------|
| 텍스트 | ✅ | ✅ |
| 이미지 | ✅ | ✅ |
| 오디오 | ✅ | ✅ (음성 합성, 클로닝) |
| 비디오 | ✅ (추론) | — (LongCat-Video 별도) |

### LongCat 에코시스템

LongCat-Next는 Meituan의 더 넓은 LongCat 에코시스템의 일부:
- **LongCat-Flash-Omni** (560B, 27B 활성): 실시간 오디오-비주얼 인터랙션
- **LongCat-Flash-Prover** (560B MoE): Lean4 기반 형식적 추론
- **LongCat-Video** (13.6B): T2V, I2V, Video-Continuation 전문
- **LongCat-Image**: 이미지 생성 전문

## 실용성 체크

| 항목 | 상태 |
|------|------|
| 코드 | ✅ [github.com/meituan-longcat/LongCat-Next](https://github.com/meituan-longcat/LongCat-Next) (MIT) |
| 모델 | ✅ [HF에 공개](https://huggingface.co/meituan-longcat/LongCat-Next) |
| 데이터 | ❌ 학습 데이터 비공개 |
| 라이선스 | MIT — 상용 가능 |
| 요구사양 | H100/A100 80GB × 3장 이상 (추론 최소) |
| 배포 | SGLang 통합 지원 (meituan-longcat/LongCat-Next-inference) |

**주의점**: 3×80GB GPU 최소 요구는 개인 연구자에게 높은 진입장벽. 양자화(GGUF) 버전 미확인. 전용 arXiv 논문 미공개 — 재현성 검증 어려울 수 있음.

## 나에게 주는 시사점

1. **네이티브 멀티모달의 새로운 방향**: DiNA는 "비전/오디오를 언어의 확장으로 내재화"하는 접근으로, bolt-on 방식(Qwen-VL, LLaVA 등)과 근본적으로 다르다. 디스크리트 토큰 기반 통합이 이해+생성을 하나의 모델로 수렴시키는 트렌드를 확인.

2. **multimodal generation project 프로젝트 시사점**: LongCat-Video(13.6B)가 T2V/I2V를 담당하고, LongCat-Next가 멀티모달 이해+오디오를 담당하는 에코시스템 구조는 Memesis의 멀티모델 라우팅 아키텍처와 유사한 설계 철학. 특히 dNaViT의 28× 압축 기법은 영상 생성 워크플로에서 비주얼 토큰 비용 절감에 참고 가능.

3. **MoE A3B 트렌드 재확인**: 68.5B 중 3B 활성화라는 극단적 스파스 MoE는 Qwen3.5-35B-A3B, DeepSeek-V4 등과 함께 2026년 효율적 추론의 메인 트렌드. 동일 활성 파라미터 대비 더 높은 용량이 멀티모달 태스크에서 유효함을 시사.

4. **오픈소스 생태계 경쟁**: Meituan이 MIT 라이선스로 풀 에코시스템을 공개한 것은 Qwen, DeepSeek에 이은 중국 기업의 공격적 오픈소스 전략. 연구 활용도 측면에서 매우 유리. MIT 라이선스로 파인튜닝/배포 제한 없음.

5. **character animation pipeline 관점**: 이산 비전 토크나이저(dNaViT)가 이미지 이해+생성을 통합한다면, 캐릭터 일관성 유지에도 활용 가능.

**주의점**: 약 161GB의 모델 크기로 H100 80GB x2~3 이상 필요. 양자화(GGUF) 버전 미확인. 전용 arXiv 논문 미공개로 재현성 검증 어려울 수 있음. 로컬 실험에는 상당한 GPU 리소스 필요하며 클라우드 추론으로 테스트하는 것이 현실적.

## 출처

| 플랫폼 | 링크 |
|--------|------|
| HuggingFace | [meituan-longcat/LongCat-Next](https://huggingface.co/meituan-longcat/LongCat-Next) |
| GitHub | [meituan-longcat/LongCat-Next](https://github.com/meituan-longcat/LongCat-Next) |
| 공식 사이트 | [longcatai.org](https://www.longcatai.org/) |
| LongCat-Flash 논문 | [arXiv:2509.01322](https://arxiv.org/abs/2509.01322) |
| LongCat-Video 논문 | [arXiv:2510.22200](https://arxiv.org/abs/2510.22200) |

---

## Related Notes
- multimodal generation project — 영상 생성 SaaS 프로젝트
- 260328_ByteDance_Seedance2.0_영상생성_SDNC — 경쟁 멀티모달 비디오 생성
- 260328_LTX-2.3_4K_오디오싱크_영상생성_LTX23 — 오디오-비디오 동시 생성 경쟁
