---
status: published
slug: 260328-weekly-convergence
summary: '- 총 117건 수집 (2026-03-23 월 ~ 2026-03-28 토, 메타 분석·리포트 파일 제외) - 프로젝트별 분포 (impactto
  + domain 태그 기반): [[MemesisMaster|Memesis]] ~23건, [[PathFinderMaster|PathFinder]]
  ~18건, [[3DAgentMast…'
created: 2026-03-28
tags:
- Convergence_Analysis
- system/auto
period: 2026-03-23 ~ 2026-03-28
total_notes: 117
auto_transitions: 20
new_mature: 0
date: '2026-03-28'
author: MinHanr
---

# 260328 주간 수렴 분석

## 이번 주 수집 요약

- 총 **117건** 수집 (2026-03-23 월 ~ 2026-03-28 토, 메타 분석·리포트 파일 제외)
- 프로젝트별 분포 (impact_to + domain 태그 기반): Memesis **~23건**, PathFinder **~18건**, 3DAgent **~14건**, ColorDepth **~8건**, TaylorDub **~4건**, Retargeting **~1건**, Foley **~2건**, 4DPlex **~2건**, General/Industry **~45건**
- 평균 relevance (판단 레이어 보유 노트 기준): **3.4** / 5.0 (relevance 5: 12건, 4: 15건, 3: ~70건)
- Breakthrough 비율 (novelty=breakthrough): **48%** (12/25 판단 완료 건) — 전체 117건 중 25건만 novelty 필드 보유
- 이번 주 첫 **주간 수렴 분석** 자동 실행. 지난 수렴(260327 R&D Convergence)은 일회성 수동 분석이었으며, 본 노트부터 주기적 수렴 루프가 시작됨.
- **2차 검증(3/28 오후)**: 상태 전환 오류 교정 — 20건의 노트가 seed→mature로 잘못 승격되어 있던 것을 규칙에 맞게 seed→growing으로 교정 완료. LL3M 프로모션 메타데이터 누락 보완.

---

## 핵심 교차점 (이번 주 신규)

### 교차점 1: 3D 프록시 기반 Generative Rendering (PathFinder × Memesis)

- 관련 프로젝트: **PathFinder** × **Memesis**
- 관련 노트: 260328_GO-Renderer_Generative_Object_Rendering_3D_Video_Diffusion, 260328_HDR-NSFF_High_Dynamic_Range_Neural_Scene_Flow_Fields, 260327_ArtiFixer_3D_Reconstruction_Diffusion
- 시너지: GO-Renderer가 명시적 재료/조명 분해 없이 3D 프록시 기하만으로 뷰포인트·리라이팅을 달성한 것은, PathFinder의 AOV 분해 접근과 상보적. PathFinder는 AOV를 분리하여 VFX 제어를 극대화하고, GO-Renderer는 AOV 없이도 시각적 일관성을 유지하는 대안 경로를 제공. HDR-NSFF는 이 둘을 HDR 래디언스 공간에서 연결.
- 액션 포인트: PathFinder PoC에서 GO-Renderer 방식(3D proxy + diffusion)과 기존 AOV 방식의 비교 실험 설계. HDR 동적 범위 복원을 렌더링 파이프라인에 통합 검토.

### 교차점 2: 오디오-비주얼 동시 생성 (Memesis × TaylorDub × Foley)

- 관련 프로젝트: **Memesis** × **TaylorDub** × **Foley**
- 관련 노트: 260328_ByteDance_Seedance2.0_영상생성_SDNC, 260328_Alibaba_FunCineForge_영화더빙_FCF
- 시너지: Seedance 2.0이 텍스트/이미지/비디오/오디오 4모달 네이티브 생성을 달성. FunCineForge가 '시간 모달리티' 개념으로 영화급 멀티캐릭터 립싱크 해결. 이 두 모델이 합쳐지면 Memesis의 영상 생성 + TaylorDub의 더빙 + Foley의 사운드를 하나의 파이프라인에서 처리하는 아키텍처가 가능.
- 액션 포인트: FunCineForge 오픈소스 코드 검토 후 TaylorDub 파이프라인에 통합 PoC. Seedance 2.0의 4모달 아키텍처를 Memesis 멀티모델 라우팅 설계에 반영.

### 교차점 3: 3D 에셋 자동화 파이프라인 (3DAgent × Retargeting)

- 관련 프로젝트: **3DAgent** × **Retargeting**
- 관련 노트: 260328_NVIDIA_TRELLIS_3D블루프린트_TREL, 260328_Utonia_범용3D포인트인코더_UTON, 260328_SceneAssistant_Visual_Feedback_Agent_3D_Scene_Generation
- 시너지: NVIDIA TRELLIS의 텍스트→3D 블루프린트가 3DAgent의 에셋 자동 생성에, Utonia의 범용 포인트 인코더가 이질적 3D 데이터 통합에 기여. SceneAssistant의 VLM 기반 시각 피드백 루프는 SAGE의 Generator-Critic 패턴을 한 단계 발전시킴. Retargeting은 이렇게 생성된 3D 에셋에 캐릭터 모션을 자동 적용하는 다운스트림.
- 액션 포인트: TRELLIS + SceneAssistant + Utonia를 3DAgent 파이프라인의 "생성→검증→인코딩" 3단 구조로 통합 설계.

### 교차점 4: Spectral 분해 + Depth 통합 심화 (ColorDepth × PathFinder)

- 관련 프로젝트: **ColorDepth** × **PathFinder**
- 관련 노트: 260327_Iris_Diffusion_Monocular_Depth_Estimation, 260327_PureCLIP_Depth_CLIP_Embedding_Depth_Estimation, 260327_AnyDepth_DINOv3_Lightweight_Depth_Estimation, 260328_HDR-NSFF_High_Dynamic_Range_Neural_Scene_Flow_Fields
- 시너지: 지난 수렴(260327)에서 식별한 Spectral 분해 패턴이 이번 주에도 강화. Iris(CVPR 2026 SOTA) + PureCLIP(zero-shot 37% 개선) + AnyDepth(85% 경량화)가 depth 추정의 속도-정확도 스펙트럼을 완전히 커버. HDR-NSFF의 HDR 래디언스 모델링이 PathFinder의 리라이팅 파이프라인과 직접 연결.
- 액션 포인트: Iris를 depth backbone으로 확정 후, AnyDepth의 경량화 전략(369K 고품질 데이터)을 자체 fine-tuning에 적용 검토.

### 교차점 5: LLM 코드 생성 기반 3D 제어 확장 (3DAgent × Memesis)

- 관련 프로젝트: **3DAgent** × **Memesis**
- 관련 노트: 260327_LL3M_Large_Language_3D_Modelers_Blender, 260327_World_Craft_Agentic_3D_World_Creation, 260327_SAGE_NVIDIA_Scalable_Agentic_3D_Scene_Generation
- 시너지: 지난 수렴에서 식별한 패턴 지속. LL3M의 plan→retrieve→write→debug→refine 파이프라인이 World Craft의 Multi-agent Guild와 결합하면, 단일 모델이 아닌 전문화된 에이전트 팀이 3D 씬을 구축. SAGE의 Generator-Critic 품질 게이트가 최종 검증 레이어 역할.
- 액션 포인트: LL3M → HoudiniRAG 전환 PoC (지난 수렴과 동일, 이번 주 추가 진전 없음).

---

## 프로젝트별 진전

### Memesis (영상 생성) — 이번 주 수집 15건

이번 주 수집 밀도가 가장 높은 프로젝트. 핵심 발견:

- **4K 초고해상도**: ViBe가 이미지 전용 학습으로 4K 비디오 생성 달성. Memesis SaaS의 해상도 업스케일링 전략에 직접 영향.
- **장시간 안정성**: HiAR(VBench 0.821, 20초+)과 DCARL(키프레임-보간, 32초)이 장시간 영상의 두 가지 경로 제공.
- **멀티모달 네이티브**: Seedance 2.0의 4모달 동시 생성이 Memesis의 "이미지+비디오+오디오 통합 SaaS" 비전과 정확히 일치.
- **시장 시그널**: Sora 완전 종료로 독립형 영상 생성 서비스의 실패 사례 확정. Memesis의 ReactFlow 기반 멀티모델 라우팅 아키텍처가 올바른 설계 방향임을 시장이 실증.

### PathFinder (VFX 렌더링) — 이번 주 수집 8건

- **GO-Renderer** (relevance 5)가 가장 직접적. 3D proxy 기반 리라이팅/뷰합성이 명시적 재료 분해 없이 가능하다는 증명.
- **HDR-NSFF**: HDR 래디언스 모델링 + 씬플로우 + 기하 동시 재구성으로 PathFinder의 리라이팅 정밀도 향상 가능.
- **Foveated Diffusion**: 인간 시각 기반 토큰 효율화로 디퓨전 실시간 렌더링 가능성 확장. 57fps → 120fps 목표와 직결.
- DLSS 5, ArtiFixer, Omni-Effects, PromptVFX 등 지난 수렴 식별 자산 유지.

### 3DAgent (3D 자동화) — 이번 주 수집 8건

- **SceneAssistant** (relevance 5): VLM 기반 시각 피드백 루프. SAGE의 Generator-Critic과 결합하면 3DAgent의 자동 모델링 품질 검증 2단 구조 완성.
- **NVIDIA TRELLIS**: 텍스트→3D 에셋 블루프린트. 3DAgent 파이프라인의 입력단 확장.
- **Utonia**: 이질적 포인트클라우드 통합 인코더. 다양한 소스의 3D 데이터를 단일 표현으로 통합.
- LL3M, SAGE, World Craft, Tripo P1, Wonder 3D 등 지난 수렴 자산 유지.

### ColorDepth (깊이·색 확장) — 이번 주 수집 5건

- 지난 수렴에서 "논문 충분, 구현 미착수"로 진단. 이번 주에도 추가 논문(HDR-NSFF) 유입.
- Iris(CVPR 2026 SOTA) + PureCLIP(37% zero-shot 개선) + AnyDepth(85% 경량화) + HDR-NSFF + Single Image HDR의 5개 논문이 depth-color-HDR 삼각형을 완성.
- **구현 착수가 가장 시급한 프로젝트**. 논문 축적은 포화 상태.

### TaylorDub (AI 더빙) — 이번 주 수집 2건

- **FunCineForge** (relevance 5): 지난 수렴에서 "lip-sync/dubbing AI 수집 0건"으로 경고한 공백이 이번 주 해소. Alibaba가 영화급 멀티캐릭터 더빙을 오픈소스 공개.
- **Seedance 2.0**: 네이티브 오디오-비디오 동시 생성으로 더빙 파이프라인의 패러다임 전환 가능성.
- 건수는 적지만 **질적으로 매우 높은 수집** (평균 relevance 5.0, breakthrough 100%).

### Retargeting (리타게팅) — 이번 주 수집 1건

- **NVIDIA TRELLIS**: 텍스트→3D 에셋 자동 생성에서 리타게팅 대상 에셋 소싱에 간접 기여.
- 여전히 직접적 retargeting/motion transfer 논문 수집 **0건**. 공백 2주 이상 지속 → 경고 수준 상향.

### Foley (비활성) — 이번 주 수집 1건

- **FunCineForge**: 더빙 모델이지만 Foley(사운드 효과) 도메인에도 간접 기여.
- 프로젝트 비활성 상태 유지. 직접적 video-to-audio 논문 수집 없음.

---

## 트렌드 변화 (260327 수렴 대비)

### 새로 등장

- **4모달 네이티브 생성** (Seedance 2.0): 텍스트/이미지/비디오/오디오를 하나의 모델에서 동시 생성. 기존 파이프라인의 직렬 구조(영상 생성→오디오 부착)를 근본적으로 재설계할 가능성.
- **영화급 오픈소스 더빙** (FunCineForge): '시간 모달리티' 개념이 등장. 립싱크 문제를 시간축에서 해결하는 새로운 접근.
- **범용 3D 포인트 인코더** (Utonia): 이질적 포인트클라우드 통합 처리. 3D 데이터 표준화의 새 방향.
- **Foveated(중심와) 생성**: 인간 시각 특성 기반 토큰 효율화. 실시간 디퓨전 생성의 새 패러다임.
- **Sora 완전 종료**: 독립형 AI 영상 생성 서비스의 시장 실패 신호 확정.

### 강화/지속

- **Diffusion 범용 백본**: 여전히 4개 프로젝트 공통 SOTA. GO-Renderer, ViBe, DCARL 모두 디퓨전 기반.
- **Generator-Critic 자기정제**: SceneAssistant가 VLM 기반으로 패턴 확장. 시각 피드백이 텍스트 기반 평가를 보완.
- **에디터 네이티브 통합**: Seedance 2.0 → CapCut 통합이 이 트렌드의 연장선.
- **LLM → 코드 생성 3D 제어**: LL3M, World Craft, SAGE 삼각 구조 유지.
- **Spectral/다층 분해**: Iris, PureCLIP, AnyDepth, HDR-NSFF로 depth-HDR 축 완성.

### 약화/소멸

- **해당 없음**: 이번 주는 첫 주간 수렴이므로 약화 트렌드 식별에 충분한 시계열 없음. 260327 수렴에서 식별한 5대 패턴 모두 유지 또는 강화.

### 방향 요약

디퓨전 모델이 영상·3D·depth 전 영역에서 범용 백본 지위를 굳히는 가운데, **멀티모달 네이티브 생성**(영상+오디오 동시)과 **에이전틱 자기정제**(VLM 피드백 루프)가 이번 주 가장 강한 신규 벡터. AI 영상 서비스의 독립 제품화 실패(Sora 종료)는 플랫폼 통합형 접근(Memesis ReactFlow)의 방향성을 시장이 확인한 신호.

---

## 지식 공백 경고

| 프로젝트 | 공백 영역 | 지속 기간 | 심각도 |
|----------|----------|----------|--------|
| **Retargeting** | Motion retargeting, pose transfer 전용 논문 | 2주+ (3/20 이후 직접 수집 0) | 🔴 |
| **TaylorDub** | Lip-sync 정량 벤치마크 (LRS3, HDTF) | 해소 중 (FunCineForge 유입) | ⚠️ |
| **Foley** | Video-to-Audio 생성, foley synthesis | 프로젝트 비활성이나 FunCineForge 간접 연결 | ⚠️ |
| **ColorDepth** | Depth-conditioned rendering 교차 논문 | 개별 논문 풍부하나 PathFinder 교차 실험 미착수 | ⚠️ |
| **PathFinder** | AOV + depth joint estimation 통합 실험 | 논문은 있으나 구현 교차점 미확인 | ⚠️ |

---

## 자동 상태 전환 로그

총 **20건** seed → growing 전환 실행. (2차 검증으로 상태 교정 완료)

> **⚠️ 2차 검증 교정 사항**: 초기 실행에서 20건의 노트가 seed→**mature**로 잘못 승격됨. `growing→mature` 조건(2주 이상 growing 유지 + 교차점 3개 이상)을 충족하지 못하므로 모두 `growing`으로 교정 완료. LL3M 노트에 누락된 `promoted_date`, `promotion_reason` 필드도 보완.

### March 28 노트 (명시적 판단 레이어 기반, 8건)

| 노트 | 전환 | 근거 | 실행일 |
|------|------|------|--------|
| 260328_Alibaba_FunCineForge_영화더빙_FCF | seed → growing | relevance 5, TaylorDub+Foley 교차, breakthrough | 2026-03-28 |
| 260328_ByteDance_Seedance2.0_영상생성_SDNC | seed → growing | relevance 5, Memesis+TaylorDub 교차, breakthrough | 2026-03-28 |
| 260328_GO-Renderer_Generative_Object_Rendering_3D_Video_Diffusion | seed → growing | relevance 5, PathFinder+Memesis 교차, breakthrough | 2026-03-28 |
| 260328_HDR-NSFF_High_Dynamic_Range_Neural_Scene_Flow_Fields | seed → growing | relevance 4, PathFinder+Memesis 교차, breakthrough | 2026-03-28 |
| 260328_NVIDIA_TRELLIS_3D블루프린트_TREL | seed → growing | relevance 4, 3DAgent+Retargeting 교차 | 2026-03-28 |
| 260328_OpenAI_Sora_서비스종료_SORA | seed → growing | relevance 4, breakthrough — Memesis 아키텍처 실증 | 2026-03-28 |
| 260328_Utonia_범용3D포인트인코더_UTON | seed → growing | relevance 4, 3DAgent+PathFinder 교차, breakthrough | 2026-03-28 |
| 260328_ViBe_Ultra_High_Resolution_Video_Synthesis | seed → growing | relevance 4, breakthrough — Memesis 4K 핵심 참조 | 2026-03-28 |

### March 27 노트 (내용 기반 평가, 10건)

| 노트 | 전환 | 근거 | 실행일 |
|------|------|------|--------|
| 260327_HiAR_Autoregressive_Long_Video_Generation | seed → growing | content-based rel ~5, Memesis 핵심(VBench 0.821), breakthrough | 2026-03-28 |
| 260327_SAGE_NVIDIA_Scalable_Agentic_3D_Scene_Generation | seed → growing | content-based rel ~5, 3DAgent+Memesis 교차, 99.9% 물리안정성 | 2026-03-28 |
| 260327_Iris_Diffusion_Monocular_Depth_Estimation | seed → growing | content-based rel ~5, ColorDepth+PathFinder 교차, CVPR 2026 SOTA | 2026-03-28 |
| 260327_LL3M_Large_Language_3D_Modelers_Blender | seed → growing | content-based rel ~5, 3DAgent 핵심(Blender RAG) | 2026-03-28 |
| 260327_Omni-Effects_Unified_VFX_Generation_LoRA_MoE | seed → growing | content-based rel ~4, PathFinder+Memesis 교차 | 2026-03-28 |
| 260327_ArtiFixer_3D_Reconstruction_Diffusion | seed → growing | content-based rel ~4, PathFinder 핵심(PSNR +3dB) | 2026-03-28 |
| 260327_World_Craft_Agentic_3D_World_Creation | seed → growing | content-based rel ~4, 3DAgent+Memesis 교차 | 2026-03-28 |
| 260327_PromptVFX_Text_Driven_3D_Gaussian_VFX | seed → growing | content-based rel ~4, PathFinder 핵심(30x 속도) | 2026-03-28 |
| 260327_PureCLIP_Depth_CLIP_Embedding_Depth_Estimation | seed → growing | content-based rel ~4, ColorDepth+PathFinder 교차 | 2026-03-28 |
| 260327_AnyDepth_DINOv3_Lightweight_Depth_Estimation | seed → growing | content-based rel ~4, ColorDepth 핵심(85% 경량화) | 2026-03-28 |

### 부록 교정 (2차 패스 노트, 2건)

| 노트 | 전환 | 근거 | 실행일 |
|------|------|------|--------|
| 260328_ShotStream_Streaming_Multi-Shot_Video_Generation_for_Interac | 상태 교정 (mature→growing) | 이미 growing이었으나 mature로 잘못 변경됨. rel 5, Memesis 핵심 | 2026-03-28 |
| 260328_Less_Gaussians_Texture_More_4K_Feed-Forward_Textured_Splatti | 상태 교정 (mature→growing) | 이미 growing이었으나 mature로 잘못 변경됨. rel 5, PathFinder+3DAgent 교차 | 2026-03-28 |

### growing → mature 전환

- **해당 없음**: growing 상태 2주 이상 유지 + 교차점 3개 이상 조건을 충족하는 노트 없음 (첫 growing 전환이 금일 발생). 가장 빠른 mature 후보 시점: **2026-04-11** (3/28 전환 노트가 2주 도달).

---

## 2차 검증에서 추가 발견된 고관련성 노트

> 초기 분석에서 누락되었던 수집 파이프라인 생성 mature 노트 4건. 교차점 분석에 반영.

| 노트 | relevance | novelty | impact_to | 핵심 기여 |
|------|-----------|---------|-----------|----------|
| 260328_LLM_Houdini_Agentic_Procedural_3D | 5 | breakthrough | 3DAgent | Houdini-MCP 통합, SAGE/SceneAssistant 에이전틱 패러다임 직접 참조 |
| 260328_GaussianSplatting_IndustryStandard_glTF_OpenUSD | 5 | breakthrough | PathFinder | glTF+OpenUSD 표준화로 3DGS VFX 파이프라인 산업 호환성 확보 |
| 260328_Wan22_MoE_VideoGeneration_OpenSource | 5 | breakthrough | Memesis | MoE 비디오 디퓨전 SOTA, Apache 2.0 오픈소스 백엔드 후보 |
| 260328_AI_Dubbing_LipSync_Multilingual_2026 | 5 | breakthrough | TaylorDub | 130+ 언어 AI 더빙 시장 현황, FunCineForge 벤치마크 기준 |

**교차점 보강**:
- **교차점 2 (오디오-비주얼) 강화**: Wan2.2의 오픈소스 비디오 백엔드 + FunCineForge 더빙 + Seedance 2.0 네이티브 생성이 Memesis×TaylorDub 파이프라인의 3중 기술 스택을 형성.
- **교차점 3 (3D 자동화) 강화**: LLM_Houdini가 LL3M→HoudiniRAG 전환 PoC의 실현 가능성을 직접 입증. 3DAgent 프로젝트의 다음 마일스톤으로 격상.
- **신규 교차점 6: 3DGS 표준화 × VFX 산업 통합 (PathFinder × Memesis)**: GaussianSplatting 표준화(glTF, OpenUSD, Nuke 17.0)가 PathFinder의 3DGS 기반 실시간 렌더링에 산업 호환성을 부여. Memesis의 ReactFlow 노드에서 표준 포맷 3DGS를 직접 활용하는 경로가 열림.

---

## 발행 파이프라인

| mature 노트 | 발행 적합성 | 추천 포맷 |
|-------------|------------|----------|
| (해당 없음) | 이번 주 새 mature 전환 0건 | — |

**참고**: 지난 수렴(260327)에서 제안한 "AI 영상 기술 5대 수렴 패턴" 블로그 포스트는 여전히 유효한 발행 후보. 이번 주 추가된 교차점(멀티모달 네이티브, Sora 종료 시그널)을 반영하면 더 완성도 높은 글이 될 것.

---

## 다음 주 수집 방향 제안

### 공백 영역 보강 (긴급)

- **Motion retargeting / Pose transfer**: `retargeting`, `motion transfer`, `character animation`, `skeletal retargeting` 키워드 arXiv 검색 추가. Retargeting 프로젝트 2주 공백 해소 필수.
- **Lip-sync 벤치마크**: `lip-sync evaluation`, `LRS3`, `HDTF benchmark` 키워드로 정량 비교 논문 수집. FunCineForge 성능 비교 기준 확보.

### 주목 트렌드 추적

- **4모달 네이티브 생성**: `joint audio-visual generation`, `multimodal native`, `audio-video co-generation` — Seedance 2.0 후속 연구 및 경쟁 모델 모니터링.
- **Foveated / 효율적 디퓨전**: `foveated generation`, `spatially adaptive diffusion`, `efficient video generation` — 실시간 렌더링 목표(PathFinder 120fps)에 직접 기여.
- **3D 포인트 인코딩 표준화**: `universal point encoder`, `point cloud foundation model` — Utonia 후속 및 3DAgent 통합 가능 모델.
- **VLM 기반 에이전틱 피드백**: `visual feedback agent`, `VLM critic`, `agentic scene generation` — SceneAssistant 패턴의 다른 도메인 적용.

### 수집 파이프라인 개선 제안

- 3/22~3/26 노트(40건)에 판단 레이어(relevance, novelty, impact_to, judgment) 부재. **daily-arxiv 스케줄에 판단 레이어 자동 부여를 통합**하면 다음 주 수렴 분석의 정확도가 크게 향상됨.
- Retargeting, Foley 관련 검색 키워드를 daily-arxiv에 추가하여 수집 자체를 보강.

---

## 부록: 판단 레이어 보완 작업 (2차 패스)

> 초기 수렴 분석 후 판단 레이어 미비 노트 20건을 2차 평가하여 보완. 실행일: 2026-03-28.

### 판단 레이어 추가 완료 (4건)

| 노트 | relevance | novelty | impact_to | 비고 |
|------|-----------|---------|-----------|------|
| 260328_ShotStream_Streaming_Multi-Shot_Video_Generation_for_Interac | 5 | breakthrough | Memesis | 이미 growing. 판단 레이어 + promoted 필드 추가 |
| 260328_Less_Gaussians_Texture_More_4K_Feed-Forward_Textured_Splatti | 5 | breakthrough | PathFinder, 3DAgent | 이미 growing. 판단 레이어 + promoted 필드 추가 |
| 260328_MegaFlow_Zero-Shot_Large_Displacement_Optical_Flow | 4 | incremental | PathFinder, Memesis | 이미 growing. 판단 레이어 추가 |
| 260328_RefAlign_Representation_Alignment_for_Reference-to-Video_Gen | 4 | incremental | Memesis | seed 유지 (교차점 1개, incremental) |

### 미분석 노트 분류 (16건)

**R&D 간접 관련 (seed 유지, 관찰 대상):**

| 노트 | 추정 relevance | 관련 프로젝트 |
|------|---------------|-------------|
| DCARL | 4 (기존 판단) | Memesis — 32초 장시간 영상, 전환 미달(교차점 1개) |
| AnyHand | 2 | ColorDepth — 합성 hand pose 데이터셋, 간접 참조 |
| BizGenEval | 2 | Memesis — 상업용 비주얼 벤치마크, 간접 참조 |
| EVA | 2 | TaylorDub — 음성 에이전트 평가 프레임워크, 간접 참조 |
| Holotron-12B | 2 | 3DAgent — 컴퓨터사용 에이전트, 간접 참조 |

**R&D 무관 (seed 유지, 아카이빙 후보):**

| 노트 | 사유 |
|------|------|
| Drive My Way | 자율주행 VLA 모델 — R&D 도메인 외 |
| Vega | 자율주행 언어 명령 — R&D 도메인 외 |
| SoftMimicGen | 로봇 조작 데이터 생성 — R&D 도메인 외 |
| PRX Part 3 | 본문 미채워짐 (seed 유지) |
| Modular Diffusers | 본문 미채워짐 (seed 유지) |
| MoE in Transformers | 범용 아키텍처 — R&D 직접 관련성 낮음 |
| No Hard Negatives | 대조 학습 개선 — PathFinder 간접만 |

**오분류 경고 (태그 수정 필요):**

| 노트 | 현재 태그 | 실제 도메인 |
|------|----------|-----------|
| Krylov-space anatomy | domain/rendering, domain/vfx | 양자물리 (무관) |
| Pseudogap Non-Fermi-liquid | domain/rendering, domain/multimodal | 응집물리 (무관) |
| Critical curve two-matrix | domain/rendering, domain/multimodal | 수학물리 (무관) |

→ 3건은 수집 파이프라인의 도메인 필터 오작동으로 유입된 물리/수학 논문. daily-arxiv 필터 조건 점검 필요.

### 추가 자동 전환: 0건

2차 검증에서 seed → growing 조건을 충족하는 추가 노트 없음. 20건 전환이 최종 확정.

### Seed 노트 잔여 현황 (24건)

- **판단 레이어 부재**: 23건 (relevance, novelty, impact_to 미설정)
- **판단 완료**: 1건 (260327_ATI → relevance 3, Memesis 단독, incremental → 전환 미달)
- **본문 미작성**: 5건 (Modular_Diffusers, PRX_Part_3 등)
- **R&D 무관**: 7건 (자율주행, 로봇 조작, 물리학 논문 등)
- **다음 주 대량 판단 레이어 추가 필요**: daily-arxiv 파이프라인에 자동 판단 레이어 통합 시급

### 오분류 경고 (수집 파이프라인 필터 오작동, 3건)

| 노트 | 현재 태그 | 실제 도메인 |
|------|----------|-----------|
| Krylov-space anatomy | domain/rendering, domain/vfx | 양자물리 (무관) |
| Pseudogap Non-Fermi-liquid | domain/rendering, domain/multimodal | 응집물리 (무관) |
| Critical curve two-matrix | domain/rendering, domain/multimodal | 수학물리 (무관) |

→ arXiv 수집 필터의 도메인 분류 정확도 점검 필요. 물리/수학 논문이 rendering/multimodal로 오분류됨.
## 한계점

- 단일 시점 수집으로 후속 업데이트 미반영 가능성
- 원문 기반 요약으로 실험 재현/검증 미수행
- 교차 검증 소스 부재 시 편향 가능성

## 실용성 체크

| 항목 | 평가 |
|------|------|
| 재현 가능성 | 원문 링크/출처 제공 시 검증 가능 |
| 실무 적용성 | 트렌드 파악 및 의사결정 참고용 |
| 후속 액션 | 관심 주제 심화 리서치 권장 |
