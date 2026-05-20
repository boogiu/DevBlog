# 게임의 시간은 하나가 아니다

#게임엔진 #시간관리 #FMOD #오디오동기화 #리듬게임

> 젠레스 존 제로 모작 프로젝트를 진행하며, 게임의 시간에 대해 몇 가지 이슈가 있었다. 단순한 정리보다는 "이런 방식으로 진행하면 어땠을까" 하는 고민을 담는다.

---

## 목차

1. [[#1. 타임 매니저는 어떻게 구성하는 것이 좋을까]]
2. [[#2. DeltaTime이 너무 길어진다면 어떻게 처리해야 할까]]
3. [[#3. 시간과 시스템을 어떻게 동기화시키면 좋을까]]
4. [[#4. 시간과 시스템의 업데이트 관계는 어떻게 잡을까]]

---

## 1. 타임 매니저는 어떻게 구성하는 것이 좋을까

### 구성 첫 번째

기존 타임 매니저는 외부에서 타이머를 등록하고, 해당 타이머를 받아서 엔진에 델타타임을 넣어주는 방식으로 동작했다.

![[Pasted image 20260512165933.png]]

### 구성 두 번째

시간 감속 및 가속 등의 연출을 진행해야 하다 보니, 게임 내에 타이머 하나만 두는 것으로는 한계가 있었다. 타이머 등록을 여러 개로 하되, 이를 엔진 내부에서 처리하는 방식으로 진행하고 싶었다.

![[Pasted image 20260512170740.png]]

하나의 타이머 객체에서 Scaled Time과 Real Time을 동시에 계산하고,

- 게임 객체들과 연관 있는 시스템에는 **Scaled Time**을
- 로직과 연관 있는 시스템에는 **Real Time**을

전달하는 방식을 차용했다. 이 과정에서 타이머의 책임을 클라이언트가 아닌 엔진이 가질 수 있도록 했다.

### 구성 세 번째

두 번째 구성까지는 기존 방식에서 약간의 개선만을 진행했을 뿐, 정확하게 왜 그렇게 구성해야 하는지를 파고들면 살짝 애매함이 남아 있었다.

실제로 클라이언트 단에서 타이머를 직접 등록하거나 제어하는 경우는 많지 않았고, 대부분의 시스템은 엔진이 제공하는 시간 값을 받아 동작하는 형태에 가까웠다. 타이머의 생성과 갱신 책임을 클라이언트에 남겨둘 필요가 있을까?

시간은 엔진 루프와 밀접하게 연결되어 있으므로, 엔진이 직접 관리하고 각 시스템에 필요한 시간 값을 일관된 방식으로 제공하는 편이 더 자연스럽다고 판단했다.

> [!info] 새로운 구조의 기준
> 
> - 타이머의 생성, 갱신, 보정은 **엔진이 책임**진다.
> - 엔진은 각 시스템의 성격에 맞는 시간 값을 제공한다.
> - 클라이언트는 타이머를 직접 소유하지 않고, 필요한 경우 엔진에서 제공하는 시간 값만 참조한다.
> - 쿨타임, 버프 지속 시간, 연출 진행 시간처럼 게임 로직에서 사용하는 시간 기능도 엔진이 제공하는 `TimeContext`를 기반으로 구현할 수 있어야 한다.

단, 엔진 내부에 게임 로직이 들어오지 않아야 한다. 엔진은 쿨타임이 무엇인지, 버프가 어떤 규칙으로 종료되는지 알 필요가 없다. **시간을 계산하고 관리**하지만, 그 시간을 어떤 의미로 사용할지는 클라이언트의 책임으로 남겨둔다.

---

### 상용 엔진의 시스템을 참고

#### 유니티
(https://docs.unity.cn/Manual/TimeFrameManagement.html)

> `Time class has a few properties which provide you with numeric values that allow you to measure time elapsing while your game or app is running.`

```
TimeManager
├─ GameTime      // deltaTime + timeScale
├─ RealTime      // unscaledDeltaTime
├─ PhysicsTime   // fixedDeltaTime
└─ ClampPolicy   // maximumDeltaTime
```

타이머 객체를 분리하기보다 `TimeManager`가 필요한 시간들을 직접 계산한 뒤 API로 클라이언트에 제공하는 방식이다.

#### 언리얼
(https://dev.epicgames.com/documentation/unreal-engine/actor-ticking-in-unreal-engine)

> `Actors and components are ticked once per frame, unless a minimum ticking interval is specified. Ticking happens according to tick groups, which can be assigned in code or Blueprints.`

```
Unreal Tick Flow
├─ TG_PrePhysics       // 물리 시뮬레이션 전 실행
├─ Physics Simulation  // 물리 계산
├─ TG_PostPhysics      // 물리 결과 이후 실행
└─ TG_PostUpdateWork   // 카메라, 이펙트, 후처리 업데이트
```

Unreal은 Unity와 달리 시간 값 자체보다 **업데이트 시점**이 더 구조적으로 드러난다. 단순히 `DeltaTime`을 전달하는 데서 끝나지 않고, **그 시간이 어느 업데이트 단계에서 소비되어야 하는가**까지 함께 관리한다.

참고할 점은 `TimeManager` 자체의 형태라기보다, **시간 값과 업데이트 순서를 함께 설계한다는 관점**이다.

---

### TimeContext

> [!info] 핵심 개념 **TimeContext는 시간 정책에 대한 정보 묶음이다.** DirectX 기반 엔진을 구성하고 있기 때문에 이름은 Context로 맞춘다.

기존 업데이트 방식:

```cpp
Update(float deltaTime);
```

새로운 방식:

```cpp
Update(const TimeContext& timeContext);
```

`TimeContext` 구조체:

```cpp
struct TimeContext
{
    float deltaTime = 0.0f;            // 실제로 시스템이 사용할 시간
    float unscaledDeltaTime = 0.0f;    // TimeScale 적용 전 시간
    float totalTime = 0.0f;            // 누적 시간

    float timeScale = 1.0f;            // 시간 배율
    float maxDeltaTime = 1.0f / 15.0f; // 너무 큰 DeltaTime 제한

    bool isPaused = false;             // 이 시간 흐름이 멈춰 있는지
};
```

`maxDeltaTime`이 `TimeContext`에 포함된다는 점이 설계 포인트 중 하나다. 기존에는 엔진 정책 단에서 Clamp를 걸었는데, 각 `TimeContext`에 따른 정책으로 변경하면 더 확장성이 있다고 판단했다.

---

### TimeBinding

`TimeContext`가 결정되었다면, `TimeManager`는 각 `TimeContext`를 갱신하고 시스템이 시간 값을 사용할 수 있도록 제공해야 한다.

여기서 추가로 고려하고 싶은 기능은 **객체 단위의 시간 흐름 변경**이다. `ObjectA`와 `ObjectB`가 같은 `ObjectSystem`에 속해 있고 기본적으로 `GameTimeContext`를 사용한다고 할 때, 연출이나 상태 이상으로 인해 `ObjectB`만 가속되어야 하는 상황이 생길 수 있다.

단순히 클라이언트 로직에서 `DeltaTime`에 별도 배율을 곱하는 방식은 시간 제어 로직이 게임 로직 곳곳에 흩어지는 문제가 있다. 따라서 각 객체가 자신이 사용할 `TimeContext`를 선택할 수 있는 구조를 두고 싶었다.

> [!tip] TimeBinding의 역할 `TimeBinding`은 시간을 계산하는 객체가 아니다. 객체가 어떤 `TimeContext`를 사용할지 **가리키는 연결 정보**에 가깝다.

```cpp
class TimeBinding
{
public:
    void SetContext(TimeContextId newContextId)
    {
        contextId = newContextId;
    }

    TimeContextId GetContextId() const
    {
        return contextId;
    }

private:
    TimeContextId contextId = TimeContextId::Game;
};
```

최상위 오브젝트 클래스에 `TimeBinding`을 넣어준다:

```cpp
class GameObject
{
public:
    TimeBinding& GetTimeBinding()
    {
        return timeBinding;
    }

private:
    TimeBinding timeBinding;
};
```

`ObjectSystem`의 업데이트:

```cpp
void ObjectSystem::Update(TimeManager& timeManager)
{
    for (GameObject* object : objects)
    {
        const TimeContext& timeContext =
            timeManager.GetContext(object->GetTimeBinding().GetContextId());

        object->Update(timeContext);
    }
}
```

> [!warning] 성능 고려 오브젝트를 순회할 때마다 `TimeManager`에서 Context를 조회하면, 오브젝트 수가 많아졌을 때 불필요한 접근 비용이 생길 수 있다.
> 
> - `TimeContext`는 문자열·map 기반 조회가 아닌 **enum id 기반 배열**로 관리
> - `TimeBinding`은 변경 시점에 Context 포인터를 **캐싱**하는 방식까지 고려할 수 있다

---

## 2. DeltaTime이 너무 길어진다면 어떻게 처리해야 할까

게임에서는 대부분의 움직임을 `DeltaTime`을 기준으로 계산한다.

```cpp
position += velocity * deltaTime;
```

이렇게 하면 프레임이 빠르든 느리든 같은 시간이 흘렀을 때 비슷한 거리만큼 이동하게 만들 수 있다. 하지만 실제 개발 중에는 `DeltaTime`이 너무 커지는 상황이 있었다. 디버깅 중 중단점을 걸었다가 다시 실행하거나, 순간적으로 프레임이 크게 저하되면 프레임 사이의 시간이 비정상적으로 길어진다.

**이것이 흔히 말하는 터널링 현상이다.** `DeltaTime`이 커지면 한 프레임에 이동하는 거리도 함께 커지고, 오브젝트가 충돌체 반대편으로 한 프레임 만에 넘어가버릴 수 있다.

---

### 해결 방안 1. Time Clamp

`DeltaTime`의 최댓값을 제한해 일정 값 이상 커지지 않도록 막는 방식이다.

```cpp
deltaTime = std::min(deltaTime, maxDeltaTime);
```

예를 들어 실제 프레임 간 시간이 `0.2초`였더라도, 최대 델타타임을 `0.033초`로 제한하면 게임 로직에는 `0.033초`만 전달된다.

|항목|내용|
|---|---|
|장점|한 프레임의 이동량을 제한할 수 있다|
|효과|터널링 가능성을 어느 정도 줄일 수 있다|
|문제점|실제 경과 시간 일부가 버려진다|
|결과|프레임 저하 시 게임 시간이 느려진다|

실제로는 `0.2초`가 지났는데 게임 로직은 `0.033초`만 지난 것처럼 처리되어, 나머지 시간은 사실상 버려진다. Time Clamp는 `DeltaTime`이 비정상적으로 커지는 것을 막는 **안전장치**로는 사용할 수 있지만, 터널링 문제의 근본적인 해결책으로 보기는 어렵다.

문제의 핵심은 시간이 길게 들어왔다는 것 자체보다, **긴 시간을 한 번의 업데이트로 처리한다는 점**에 있었다.

---

### 해결 방안 2. 논리 업데이트를 여러 번 돌리기

긴 `DeltaTime`을 여러 개의 작은 시간 단위로 나누어 논리 업데이트를 여러 번 실행하는 방식이다.

```cpp
// 실제 프레임 간 시간이 1초라면
UpdateLogic(0.33f);
UpdateLogic(0.33f);
UpdateLogic(0.33f);
UpdateLogic(0.01f);
```

메인 루프에서 제어:

```cpp
float remainingTime = deltaTime;
const float maxLogicDeltaTime = 0.33f;

while (remainingTime > 0.0f)
{
    float stepTime = std::min(remainingTime, maxLogicDeltaTime);
    UpdateLogic(stepTime);
    remainingTime -= stepTime;
}
```

`DeltaTime`을 버리지 않고 실제로 흐른 시간을 최대한 보존하면서, 한 번의 업데이트에서 처리하는 시간 폭은 제한할 수 있다.

하지만 내 엔진에서는 논리 업데이트 과정에서 렌더링 패킷을 함께 생성하고 있었다.

```cpp
void GameObject::Update(float deltaTime)
{
    transform.position += velocity * deltaTime;
    renderer.Submit(renderPacket); // 렌더링 요청 생성
}
```

논리 업데이트를 여러 번 돌리면, 렌더링 패킷도 그 횟수만큼 생성된다.

|문제|내용|
|---|---|
|중간 상태 패킷 생성|논리 업데이트마다 렌더링 패킷이 생성됨|
|불필요한 패킷 증가|실제로 렌더링할 필요 없는 중간 상태까지 렌더 큐에 쌓임|
|패킷 수명 문제|최종 렌더링 시점에 유효하지 않은 패킷이 남음|
|구조적 결합 문제|`Update`와 `Render Submit`이 강하게 묶여 있음|

이 문제를 통해 알게 된 것은, 논리 업데이트를 여러 번 실행하려면 **논리 갱신과 렌더링 요청 생성을 분리해야 한다**는 점이었다.

---

### 해결 방안 3. 엔진 내부에서 논리 업데이트만 분리해 반복하기

클라이언트의 `Update`를 그대로 여러 번 호출하는 방식의 문제는, 그 안에서 렌더링 패킷 생성이나 이벤트 처리까지 함께 반복된다는 것이었다. 따라서 엔진 내부의 업데이트 흐름을 분리하는 방식으로 접근했다.

기존 구조:

```cpp
Update();
Render();
```

새로운 구조:

```cpp
LogicUpdateWithSubStep(); // 논리 업데이트만 반복
GatherRenderPackets();    // 최종 상태에서 한 번만 수집
Render();
```

`GatherRenderPackets`는 모든 논리 업데이트가 끝난 뒤, 최종 상태를 기준으로 한 번만 수집한다:

```cpp
void RenderSystem::GatherRenderPackets()
{
    for (GameObject* object : visibleObjects)
    {
        RenderPacket packet;
        packet.transform = object->GetTransform();
        packet.mesh      = object->GetMesh();
        packet.material  = object->GetMaterial();

        renderQueue.Push(packet);
    }
}
```

이렇게 하면 중간 업데이트 단계에서 만들어진 의미 없는 렌더링 패킷이 렌더러로 전달되지 않는다. 논리 업데이트는 필요한 만큼 세분화해서 처리하고, 렌더러는 해당 프레임의 최종 상태만 바라보게 된다.

---

## 3. 시간과 시스템을 어떻게 동기화시키면 좋을까

게임 로직은 보통 엔진의 `DeltaTime`을 기준으로 갱신된다. 하지만 물리 라이브러리나 사운드 라이브러리처럼 외부 라이브러리를 사용하는 경우, 해당 시스템은 내부적으로 별도의 타이머를 가지고 동작할 수 있다.

특히 FMOD를 사용할 때 이 문제가 크게 느껴졌다. 리듬 게임처럼 박자에 맞춰 판정 영역을 열거나 이펙트를 발생시키고 싶은 상황에서, 단순히 이렇게 처리하는 것은 불안정하다:

```cpp
elapsedTime += deltaTime;
if (elapsedTime >= beatTime)
{
    SpawnEffect();
}
```

프레임이 순간적으로 밀리거나 `DeltaTime`이 보정되면, 실제 사운드가 재생된 시점과 게임 로직이 반응하는 시점이 어긋날 수 있다.

따라서 이 문제는 `DeltaTime`을 더 정밀하게 관리하는 문제가 아니라, **어떤 시간을 기준 시간으로 삼을 것인가**의 문제다.

---

### 해결 방향 1. 엔진 시간을 기준으로 외부 시스템을 맞추기

엔진의 시간을 기준으로 삼고, 외부 시스템을 그 시간에 맞추는 방식이다.

```cpp
engineTime += deltaTime;
audioSystem.SetTimelinePosition(engineTime);
physicsSystem.Step(engineTime);
```

일시정지, 슬로우 모션, 컷신 연출처럼 게임 시간이 의도적으로 변하는 상황에서는 엔진 시간이 중심이 되는 편이 관리하기 쉽다.

하지만 사운드 시스템에는 항상 적합하지 않다. 오디오는 끊김 없이 재생되는 것이 중요하고, 내부적으로 버퍼링과 믹싱 타이밍을 가지고 있기 때문이다. 매 프레임 오디오 재생 위치를 강제로 맞추면 오히려 끊김이나 부자연스러운 보정이 발생할 수 있다.

---

### 해결 방향 2. 오디오 시간을 기준으로 게임 로직을 맞추기

FMOD처럼 사운드 시스템이 내부 재생 시간을 가지고 있다면, 특정 음악 관련 로직은 엔진 시간이 아니라 **오디오 재생 위치**를 기준으로 판단할 수 있다.

```cpp
float musicTime = audioSystem.GetMusicTimelineTime();
if (musicTime >= beatTime)
{
    SpawnEffect();
}
```

이렇게 하면 프레임이 조금 흔들리더라도 기준은 항상 실제 음악의 재생 위치가 된다.

단, `musicTime`을 매 프레임 확인하는 방식은 결국 폴링이므로 `==` 비교는 위험하다. 프레임은 연속적이지 않기 때문에 정확히 같은 시점을 밟지 않을 수 있다.

```cpp
// 위험
if (musicTime == beatTime) { ... }

//이전/현재 프레임 사이 구간 포함 여부 검사
bool passed = prevMusicTime < eventTime && eventTime <= currentMusicTime;
```

---

### 해결 방향 3. 오디오 타임라인 이벤트를 게임 이벤트로 변환하기

FMOD의 콜백을 사용하면 사운드 타임라인에서 직접 이벤트를 받을 수 있어 음악과 맞춰야 하는 로직에 가장 직관적인 방법이다.

하지만 오디오 콜백은 엔진의 메인 업데이트 흐름과 **다른 타이밍**에서 호출될 수 있다. 콜백 안에서 바로 오브젝트를 생성하거나 Transform을 수정하면 스레드 안전성이나 프레임 흐름 문제가 생길 수 있다.

따라서 FMOD 이벤트를 직접 게임 로직으로 실행하기보다, **엔진 이벤트 큐에 전달**하는 편이 안전하다:

```cpp
void OnMusicMarker(const MusicMarker& marker)
{
    engineEventQueue.Push({
        EventType::MusicMarker,
        marker.name,
        marker.timelinePosition
    });
}
```

이벤트 발생 기준은 FMOD의 오디오 타임라인을 따르지만, 실제 게임 로직 처리는 엔진의 안전한 업데이트 구간에서 수행할 수 있다.

---

### 해결 방향 4. 시간 기준을 Context로 분리하기

> [!info] 핵심 아이디어 모든 시스템이 하나의 `EngineTime`만 사용하도록 강제하는 대신, **시스템마다 참조할 시간 기준을 Context로 분리**한다. 나아가, 각 `TimeContext`를 **다형적으로** 설계해 엔진 시간 기반·오디오 시간 기반·커스텀 시간 기반 등을 동일한 인터페이스로 다룰 수 있게 한다.

#### 배경

앞선 방법들은 엔진의 `DeltaTime`을 어떻게 보정할 것인지에 초점이 있었다. 하지만 FMOD와 같은 외부 라이브러리를 사용하다 보니, 모든 시스템이 엔진의 시간만 바라보는 것은 아니라는 문제가 생겼다.

|시스템|시간 기준|
|---|---|
|게임 로직|엔진의 `DeltaTime` 누적|
|FMOD 사운드|FMOD 내부 재생 위치|

**문제**: 음악과 동기화되어야 하는 로직을 엔진 시간 기준으로 처리하면, 프레임 변동에 따라 실제 음악 재생 위치와 게임 로직 사이에 오차가 생긴다.

#### TimeContext 다형성

`TimeContext`를 단순 데이터 구조체로 두는 것에서 한 걸음 더 나아가, **인터페이스로 추상화**하면 시스템마다 다른 시간 기준을 동일한 방식으로 주입할 수 있다.

```cpp
class ITimeContext
{
public:
    virtual ~ITimeContext() = default;

    virtual float GetDeltaTimeSec() const = 0;
    virtual float GetCurrentTimeSec() const = 0;
    virtual bool  HasPassed(float eventTimeSec) const = 0;
    virtual bool  IsPaused() const = 0;
};
```

엔진 시간을 사용하는 기본 구현:

```cpp
class EngineTimeContext : public ITimeContext
{
public:
    void Tick(float rawDeltaTime)
    {
        if (isPaused) return;

        float dt = std::min(rawDeltaTime, maxDeltaTime) * timeScale;

        previousTimeSec = currentTimeSec;
        currentTimeSec += dt;
        deltaTimeSec = dt;
    }

    float GetDeltaTimeSec()   const override { return deltaTimeSec; }
    float GetCurrentTimeSec() const override { return currentTimeSec; }
    bool  IsPaused()          const override { return isPaused; }

    bool HasPassed(float eventTimeSec) const override
    {
        return previousTimeSec < eventTimeSec && eventTimeSec <= currentTimeSec;
    }

    void SetTimeScale(float scale) { timeScale = scale; }
    void SetPaused(bool paused)    { isPaused = paused; }

private:
    float previousTimeSec = 0.0f;
    float currentTimeSec  = 0.0f;
    float deltaTimeSec    = 0.0f;
    float timeScale       = 1.0f;
    float maxDeltaTime    = 1.0f / 15.0f;
    bool  isPaused        = false;
};
```

FMOD의 실제 재생 위치를 기준으로 삼는 구현:

```cpp
class AudioTimeContext : public ITimeContext
{
public:
    void SyncFromFMOD(FMOD::Studio::EventInstance* musicInstance)
    {
        if (musicInstance == nullptr) return;

        int timelinePositionMs = 0;
        FMOD_RESULT result = musicInstance->getTimelinePosition(&timelinePositionMs);
        if (result != FMOD_OK) return;

        previousTimeSec = currentTimeSec;
        currentTimeSec  = timelinePositionMs / 1000.0f;
        deltaTimeSec    = currentTimeSec - previousTimeSec;
    }

    float GetDeltaTimeSec()   const override { return deltaTimeSec; }
    float GetCurrentTimeSec() const override { return currentTimeSec; }
    bool  IsPaused()          const override { return false; }

    bool HasPassed(float eventTimeSec) const override
    {
        return previousTimeSec < eventTimeSec && eventTimeSec <= currentTimeSec;
    }

private:
    float previousTimeSec = 0.0f;
    float currentTimeSec  = 0.0f;
    float deltaTimeSec    = 0.0f;
};
```

> [!tip] 다형성의 이점
> 
> - **동일한 인터페이스**: `MoveComponent`든 `RhythmComponent`든 `ITimeContext&`만 받으면 된다.
> - **주입 가능**: 어떤 시간 기준을 사용할지 외부에서 결정하므로, 테스트 시에 `MockTimeContext`를 주입하거나 커스텀 시간 기준을 쉽게 추가할 수 있다.
> - **확장 가능**: UI 전용 `UITimeContext`, 물리 전용 `PhysicsTimeContext` 등 새로운 정책을 추가해도 기존 코드를 수정하지 않아도 된다.

시스템은 구체 타입이 아닌 인터페이스만 의존한다:

```cpp
void MoveComponent::Update(const ITimeContext& timeContext)
{
    transform.position += velocity * timeContext.GetDeltaTimeSec();
}

void RhythmComponent::Update(const ITimeContext& timeContext)
{
    if (timeContext.HasPassed(nextBeatTimeSec))
    {
        TriggerBeatAction();
        AdvanceNextBeat();
    }
}
```

#### 핵심 차이

```cpp
// X 엔진 시간 기반 누적
audioTime += engineDeltaTime;

// O FMOD 실제 재생 위치 기반
audioTime = fmodTimelinePosition;
```

#### 엔진 Tick 흐름

```cpp
void Engine::Tick()
{
    engineTimeContext.Tick(rawDeltaTime);

    audioSystem.Update();
    audioTimeContext.SyncFromFMOD(audioSystem.GetMainMusicInstance());

    ProcessAudioTimelineEvents();

    logicSystem.UpdateByTimeContext();

    renderSystem.GatherRenderPackets();
    renderSystem.Render();
}
```

####  `==` 비교를 하면 안 된다

```cpp
// ❌ 위험 — 프레임이 해당 시간을 정확히 밟지 않고 지나칠 수 있다
if (timeContext.GetCurrentTimeSec() == beatTimeSec) { ... }
```

예: 이전 프레임 `1.98s` → 현재 프레임 `2.03s` → `2.0s`를 정확히 밟지 않고 지나감.

```cpp
// ✅ 올바른 방법 — 구간 포함 여부로 판단
bool HasPassed(float eventTimeSec) const override
{
    return previousTimeSec < eventTimeSec && eventTimeSec <= currentTimeSec;
}
```

#### FMOD Callback과 함께 쓰기

> [!note] FMOD 문서 `FMOD_STUDIO_INIT_DEFERRED_CALLBACKS`를 사용하면 timeline marker/beat 콜백이 다음 Studio update의 메인 스레드로 지연될 수 있지만, 다른 콜백들은 여전히 비동기적으로 호출될 수 있다.

**해결책**: 콜백에서는 이벤트 큐에 기록만 하고, 메인 Tick에서 처리한다.

```cpp
struct AudioTimelineEvent
{
    enum class Type { Marker, Beat };
    Type type;
    std::string name;
    int timelinePositionMs = 0;
};

class AudioEventQueue
{
public:
    void Push(const AudioTimelineEvent& audioEvent)
    {
        std::scoped_lock lock(mutex);
        events.push(audioEvent);
    }

    bool TryPop(AudioTimelineEvent& outEvent)
    {
        std::scoped_lock lock(mutex);
        if (events.empty()) return false;
        outEvent = events.front();
        events.pop();
        return true;
    }

private:
    std::mutex mutex;
    std::queue<AudioTimelineEvent> events;
};
```

FMOD 콜백 — 큐에 넣기만:

```cpp
FMOD_RESULT F_CALLBACK OnFMODTimelineCallback(
    FMOD_STUDIO_EVENT_CALLBACK_TYPE callbackType,
    FMOD_STUDIO_EVENTINSTANCE* eventInstance,
    void* parameter)
{
    auto* audioEventQueue = GetAudioEventQueueSomehow();

    if (callbackType == FMOD_STUDIO_EVENT_CALLBACK_TIMELINE_MARKER)
    {
        auto* markerProperties =
            static_cast<FMOD_STUDIO_TIMELINE_MARKER_PROPERTIES*>(parameter);

        AudioTimelineEvent audioEvent;
        audioEvent.type               = AudioTimelineEvent::Type::Marker;
        audioEvent.name               = markerProperties->name;
        audioEvent.timelinePositionMs = markerProperties->position;

        audioEventQueue->Push(audioEvent);
    }

    return FMOD_OK;
}
```

메인 Tick에서 처리:

```cpp
void Engine::ProcessAudioTimelineEvents()
{
    AudioTimelineEvent audioEvent;

    while (audioEventQueue.TryPop(audioEvent))
    {
        if (audioEvent.type == AudioTimelineEvent::Type::Marker)
        {
            logicEventSystem.BroadcastMusicMarker(
                audioEvent.name,
                audioEvent.timelinePositionMs / 1000.0f
            );
        }
    }
}
```

#### Context vs Callback — 역할 분담

|방식|역할|
|---|---|
|`EngineTimeContext`|엔진 프레임 기반 시간을 **계속** 제공|
|`AudioTimeContext`|현재 음악 시간이 몇 초인지 **계속** 제공|
|Timeline Marker Callback|특정 지점을 지났다는 **이벤트** 제공|
|Timeline Beat Callback|박자, 마디 단위 **이벤트** 제공|
|Engine Event Queue|FMOD 콜백과 게임 로직 사이를 **안전하게** 연결|

리듬 판정 — `AudioTimeContext` 사용:

```cpp
float timingErrorSec = timeContext.GetCurrentTimeSec() - note.targetTimeSec;

if (std::abs(timingErrorSec) <= perfectWindowSec)
    JudgePerfect();
```

보스 패턴 전환 — Callback 기반 이벤트 사용:

```cpp
void BossPatternSystem::OnMusicMarker(const std::string& markerName)
{
    if (markerName == "Boss_Phase_2")
        StartPhase2Pattern();
}
```

---

## 4. 시간과 시스템의 업데이트 관계는 어떻게 잡을까

> 작성 예정

---