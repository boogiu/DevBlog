DeltaTime, Fixed Update, 시스템 동기화까지
## 게임의 시간은 하나가 아니다
### 서론
젠레스 존 제로 모작 프로젝트를 진행하며, 게임의 시간에 대하여 몇 가지 이슈가 존재했고 그에 대한 내용을 단순히 정리하기보다는 내가 생각하기에 이런 방식으로 진행하면 어땠을까. 하는 고민을 적어봅니다.

---
## 1. 타임 매니저는 어떻게 구성하는 것이 좋을까

### TimeManger 구성 첫 번째
기존 타임 매니저는 외부에서 타이머를 등록하고, 해당 타이머를 받아서 엔진에 델타타임을 넣어주는 방식으로 동작했다.
![[Pasted image 20260512165933.png]]

### TimeManger 구성 두 번째
시간 감속 및 가속 등의 연출을 진행해야 하다보니, 게임 내에 타이머 하나만 두는 것으로는 한계가 있었다. 그래서 타이머 등록을 여러개로 하되, 이를 엔진 내부에서 처리하는 방식으로 진행하고 싶었다.
![[Pasted image 20260512170740.png]]

이렇듯 하나의 타이머 객체에서 Scaled Time과 RealTime을 동시에 계산하고, 
게임 객체들과 연관이 있는 시스템에는 Scaled Time을, 로직과 연관이 있는 시스템에는 Real Time을 보내는 방식을 차용했다.

이 과정에서 타이머의 책임을 클라이언트가 아닌 엔진이 가질 수 있도록 했다. 
클라이언트는 엔진 사용자 입장에서 엔진만 돌리면 알아서 필요한 타임들이 배분될 수 있도록 하고자 했던 것.
(물론 아직까지는 타이머를 클라이언트에서 등록하거나 사용할 수 있는 방식을 가지고 있었다.)

### TimeManger 구성 세 번째
두 번재 구성까지는 기존에 해왔던 방식에서 약간의 개선만을 진행했을 뿐.
정확하게 왜 그렇게 구성해야 하는 지를 파고들면 살짝 애매함이 남아있었다.

실제로 클라이언트 단에서 타이머를 직접 등록하거나 제어하는 경우는 많지 않았고, 대부분의 시스템은 엔진이 제공하는 시간 값을 받아 동작하는 형태에 가까웠다.

그렇다면 타이머의 생성과 갱신 책임을 클라이언트에 남겨둘 필요가 있을까?  
오히려 시간은 엔진 루프와 밀접하게 연결되어 있으므로, 엔진이 직접 관리하고 각 시스템에 필요한 시간 값을 일관된 방식으로 제공하는 편이 더 자연스럽다고 판단했다.

그래서 새로운 구조를 설계한다면 다음 기준을 충족하고 싶었다.

- 타이머의 생성, 갱신, 보정은 엔진이 책임진다.
- 엔진은 각 시스템의 성격에 맞는 시간 값을 제공한다.
- 클라이언트는 타이머를 직접 소유하지 않고, 필요한 경우 엔진에서 제공하는 시간 값만 참조한다.
- 쿨타임, 버프 지속 시간, 연출 진행 시간처럼 게임 로직에서 사용하는 시간 기능도 엔진이 제공하는 Time Context를 기반으로 구현할 수 있어야 한다.

이때 주의해야 할 점은, 엔진 내부에 게임 로직이 들어오지 않아야 한다는 것이다.

엔진은 쿨타임이 무엇인지, 버프가 어떤 규칙으로 종료되는지, 스킬이 언제 다시 사용 가능한지를 알 필요가 없다. 엔진의 역할은 각 시스템과 객체가 사용할 수 있는 일관된 시간 값을 제공하는 데 있다.

즉, 엔진은 시간을 계산하고 관리하지만, 그 시간을 어떤 의미로 사용할지는 클라이언트의 책임으로 남겨둔다.


### 상용 엔진의 시스템을 참고
#### 유니티

` Time class has a few properties which provide you with numeric values that allow you to measure time elapsing while your game or app is running.`[^1]

```
TimeManager
├─ GameTime      // deltaTime + timeScale
├─ RealTime      // unscaledDeltaTime
├─ PhysicsTime   // fixedDeltaTime
└─ ClampPolicy   // maximumDeltaTime
```
유니티는 나와 비슷한 형태를 사용하고 있는 것 같다. 다만 타이머 객체를 분리하기 보다는 타임 매니저가 필요한 시간들을 계산해주는 방식인 듯하다. 그리고 API로 클라이언트에 제공하는 방식.

#### 언리얼
`Actors and components are ticked once per frame, unless a minimum ticking interval is specified.Ticking happens according to tick groups, which can be assigned in code or Blueprints.` [^2]

```
Unreal Tick Flow
├─ TG_PrePhysics
│  └─ 물리 시뮬레이션 전에 실행
│
├─ Physics Simulation
│  └─ 물리 계산
│
├─ TG_PostPhysics
│  └─ 물리 결과가 나온 뒤 실행
│
└─ TG_PostUpdateWork
   └─ 카메라, 이펙트, 후처리성 업데이트
```

Unreal은 Unity와 다르게 시간 값 자체보다 **업데이트 시점**이 더 구조적으로 드러나는 방식에 가깝다.  
Actor와 Component는 기본적으로 매 프레임 `Tick`을 통해 갱신되며, 이 Tick은 `Tick Group`에 따라 프레임 내에서 실행되는 시점을 지정할 수 있다.

즉 Unreal의 시간 관리는 단순히 `DeltaTime`을 전달하는 데서 끝나지 않는다.  
**어떤 시간 값을 사용할 것인가**뿐 아니라, **그 시간이 어느 업데이트 단계에서 소비되어야 하는가**까지 함께 관리한다.

이를 통해 시스템 간 의존 관계를 명확히 나눌 수 있다.  
예를 들어 물리 이전에 갱신되어야 하는 이동 요청, 물리 이후에 처리되어야 하는 충돌 결과, 모든 이동이 끝난 뒤 따라가야 하는 카메라 갱신은 서로 다른 업데이트 시점에 배치될 수 있다.

따라서 Unreal에서 참고할 점은 `TimeManager` 자체의 형태라기보다, **시간 값과 업데이트 순서를 함께 설계한다는 관점**이다.

#### 내 설계로 이어가게 된다면
이를 바탕으로 내 구조에서는 시간 값과 업데이트 단계를 함께 설계하고자 한다. 단순히 여러 종류의 DeltaTime을 만드는 것이 아니라 게임 월드, UI, 물리, 연출, 애니메이션처럼 서로 다른 시간 정책을 요구하는 시스템들이 각자에게 맞는 시간 값을 사용하도록 분리하기 위함이다.


#### TimeContext
**TimeContext는 시간 정책에 대한 정보 묶음이다!**
DirectX 기반 엔진을 구성하고 있기 때문에 이름은 Context로 맞추려고 한다. (같은 정보 묶음체니까)


기존에 내가 시스템을 업데이트 하는 방식이 아래와 같았다면 
```cpp
Update(float deltaTime);
```

이번에는 다음과 같이 구성하면 어떨까 싶다.
```cpp
Update(const TimeContext& timeContext);
```

TimeContext 구조체 안에는 아래와 같이 채워 넣을 예정
```cpp
struct TimeContext
{
    float deltaTime = 0.0f;           // 실제로 시스템이 사용할 시간
    float unscaledDeltaTime = 0.0f;   // TimeScale 적용 전 시간
    float totalTime = 0.0f;           // 누적 시간

    float timeScale = 1.0f;           // 시간 배율
    float maxDeltaTime = 1.0f / 15.0f; // 너무 큰 DeltaTime 제한

    bool isPaused = false;            // 이 시간 흐름이 멈춰 있는지
};
```

여기서 설계 포인트 중 하나는 maxDeltaTime이 TimeContext에 포함된다는 점.
기존에 중단점을 걸었을 때 Delta가 너무 크게 나와서 터널링 현상이 자주 생겼는데, 엔진 정책 단에서 Clamp를 걸었었다. 그보단 각 TimeContext에 따른 정책으로 변경시키는 것이 더 확장성 있을 것이라고 판단했다.

#### TimeBinding
TimeContext가 결정되었다면, TimeManager는 각 TimeContext를 갱신하고 시스템이 필요한 시간 값을 사용할 수 있도록 제공해야 한다.  
  
여기서 추가로 고려하고 싶은 기능은 객체 단위의 시간 흐름 변경이다.  
  
예를 들어 ObjectA와 ObjectB가 같은 ObjectSystem에 속해 있고, 기본적으로 같은 GameTimeContext를 사용한다고 하자. 이때 연출이나 상태 이상으로 인해 ObjectB만 가속되어야 하는 상황이 발생할 수 있다.  
  
단순한 방식이라면 클라이언트 로직에서 ObjectB의 DeltaTime에 별도의 배율을 곱해 처리할 수 있다. 하지만 이 방식은 시간 제어 로직이 게임 로직 곳곳에 흩어질 수 있고, 어떤 객체가 어떤 시간 기준을 따르는지 추적하기 어려워진다.  
  
따라서 각 객체가 자신이 사용할 TimeContext를 선택할 수 있는 구조를 두고 싶었다. ObjectSystem은 기본적으로 GameTimeContext를 사용하지만, 개별 객체TimeBinding을 통해 다른 TimeContext를 참조할 수 있게 하고 싶다. 

TimeBinding은 시간을 계산하는 객체가 아니다.
객체가 어떤 TimeContext를 사용할지 가리키는 연결 정보에 가깝다.

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

그리고 최상위 오브젝트 클래스에게는 이 타임 바인딩 변수를 넣어준다.
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

오브젝트 매니저에서 업데이트 하는 경우에는
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
다만 이 구조에는 한 가지 고민이 남는다.
오브젝트를 순회할 때마다 TimeManager에서 Context를 조회하면, 오브젝트 수가 많아졌을 때 불필요한 접근 비용이 생길 수 있다.

따라서 TimeContext는 문자열이나 map 기반 조회가 아니라 enum id 기반 배열로 관리하고,
TimeBinding은 변경 시점에 Context 포인터를 캐싱하는 방식까지 고려할 수 있다.

## 2. DeltaTime이 너무 길어진다면 어떻게 처리해야 할까


## 3. 시간과 시스템을 어떻게 동기화시키면 좋을까
## 4. 시간과 시스템의 업데이트 관계는 어떻게 잡을까

[^1]: https://docs.unity.cn/Manual/TimeFrameManagement.html?utm_source=chatgpt.com

[^2]: https://dev.epicgames.com/documentation/unreal-engine/actor-ticking-in-unreal-engine?application_version=5.6&utm_source=chatgpt.com
