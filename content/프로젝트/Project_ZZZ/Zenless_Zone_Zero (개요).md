---
tags:
  - project
  - 젠레스_존_제로
  - 모작
summary: 전투 시스템과 렌더링 구조 정리
date: 2026-03-19
title: Zenless-Zone-Zero (개요)
banner: "/Assets/ZZZlogo.png"
banner_x: "100%"
banner_y: 0.08
banner_height: "280px"
---

 <div class="project-hero">
  <a
  class="video-card"
  href="https://youtu.be/dLrBe25qEa4?si=ag2STpmcWPwwOvOl"
  target="_blank"
  rel="noopener noreferrer"
>
  <div class="video-card-media">
    <img
      class="video-card-image"
      src="https://i.ytimg.com/vi/dLrBe25qEa4/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgZShlMA8=&amp;rs=AOn4CLDAagpx5CSJXU1etx1B6xOlo98rXQ"
      alt="ZZZ 포트폴리오 최종 영상 - 젠레스 존제로 썸네일"
    />
  </div>
  <div class="video-card-body">
    <div class="video-card-host">
      <img
        class="video-card-favicon"
        src="https://www.youtube.com/s/desktop/c376667c/img/favicon_32x32.png"
        alt="YouTube"
      />
      <span>youtu.be</span>
    </div>
    <div class="video-card-title-row">
      <span class="video-card-title">ZZZ 클라이언트 프로그래머 포트폴리오</span>
      <span class="video-card-tag">모작</span>
    </div>
    <div class="video-card-desc">
       DirectX 11 기반 커스텀 엔진으로 제작한 게임 플레이 영상
    </div>
    <p class="project-text">
      HOYOPlay 사의 Zenless-Zone-Zero를 모작한 팀 프로젝트 영상입니다.<br/>
      해당 프로젝트에서 프레임워크 / 보스 / 연출 및 최적화를 담당했습니다.
    </p>
  </div>
</a>
  <section class="project-summary-card">
    <div class="project-summary-header">
      <div class="project-summary-kicker">대표 프로젝트</div>      
      <h2 class="project-summary-title">Zenless Zone Zero 모작 프로젝트</h2>
    </div>
    <div class="project-meta-grid">
      <div class="project-meta-item">
        <span class="project-meta-label">기간</span>
        <span class="project-meta-value">2025.12.09 ~ 2026.02.10</span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">인원</span>
        <span class="project-meta-value">팀 8인</span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">주요 담당</span>
        <span class="project-meta-value">
        엔진(프레임워크) / 보스 </span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">개발 환경</span>
        <span class="project-meta-value">VisualStudio 2022</span>
      </div>
    </div>
    <div class="project-stack">
      <div class="project-section-title">기술 스택</div>
      <div class="stack-list">
        <span class="stack-tag">C++</span>
        <span class="stack-tag">DirectX 11</span>
        <span class="stack-tag">WinAPI</span>
        <span class="stack-tag">HLSL</span>
        <span class="stack-tag">PhysX</span>
        <span class="stack-tag">FMOD</span>
        <span class="stack-tag">ImGui</span>
      </div>
    </div>
    <div class="project-contribution">
      <div class="project-section-title">기여도</div>
      <div class="contribution-row">
        <div class="contribution-head">
          <span>프레임워크</span>
          <span>90%</span>
        </div>
        <div class="contribution-bar">
          <div class="contribution-fill" style="--ratio: 90%"></div>
        </div>
      </div>
      <div class="contribution-row">
        <div class="contribution-head">
          <span>렌더링 최적화</span>
          <span>80%</span>
        </div>
        <div class="contribution-bar">
          <div class="contribution-fill" style="--ratio: 80%"></div>
        </div>
      </div>
      <div class="contribution-row">
        <div class="contribution-head">
          <span>전투 컨텐츠</span>
          <span>20%</span>
        </div>
        <div class="contribution-bar">
          <div class="contribution-fill" style="--ratio: 30%"></div>
        </div>
      </div>
      <div class="contribution-row">
        <div class="contribution-head">
          <span>서브 컨텐츠(필드)</span>
          <span>20%</span>
        </div>
        <div class="contribution-bar">
          <div class="contribution-fill" style="--ratio:30%"></div>
        </div>
      </div>
        <div class="contribution-row">
        <div class="contribution-head">
          <span>디버그 / 툴링</span>
          <span>30%</span>
        </div>
        <div class="contribution-bar">
          <div class="contribution-fill" style="--ratio:30%"></div>
        </div>
      </div>
  </section>
</div>


--- 
## 프레임워크
- [[#사용 디자인 패턴]]
- [[#셰이더 리소스 추상화]]
- [[#렌더링 시스템 설계]]
- [[#렌더링 최적화]]
- [[#오브젝트 구조 설계]]

### 사용 디자인 패턴 ([[디자인 패턴|자세히 보기]])
- 컴포넌트 패턴
- 싱글톤 패턴
- 서비스 패턴
- 프로토타입 패턴
- 빌더 패턴
- 옵저버 패턴
- 커맨드 패턴

### 셰이더 리소스 추상화
- 리소스 간 관계 설계
- 셰이더 추상화
- 머티리얼 추상화
- 메쉬 추상화
- 메쉬 스키닝
- 모델 파싱 툴

### 렌더링 시스템 설계
- 렌더링 패킷
- 렌더 패스
- 엔진 렌더 타겟 구조
- 커스텀 렌더 타겟 구조
- 최적화

### 오브젝트 구조 설계
- GameObject / UIObject
- 오브젝터 빌더
- 오브젝트 부모-자식 계층 관계

### 오디오 시스템 설계
### 비디오 디코딩 설계
### 이벤트 시스템 설계

## 스테이지 / Room
## qhtm
