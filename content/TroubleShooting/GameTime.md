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

게임에서는 대부분의 움직임을 `DeltaTime`을 기준으로 계산한다.  
예를 들어 오브젝트가 초당 10만큼 이동해야 한다면, 매 프레임마다 다음과 같이 이동량을 계산할 수 있다.

```
position += velocity * deltaTime;
```

이렇게 하면 프레임이 빠르든 느리든, 같은 시간이 흘렀을 때 비슷한 거리만큼 이동하게 만들 수 있다.  
즉, `DeltaTime`은 프레임에 의존하지 않는 시간 기반 처리를 위해 사용된다.

하지만 실제 개발 중에는 이 `DeltaTime`이 너무 커지는 상황이 있었다.  
예를 들어 디버깅 중 중단점을 걸었다가 다시 실행하거나, 순간적으로 프레임이 크게 저하되면 프레임 사이의 시간이 비정상적으로 길어진다.

문제는 이 시간이 그대로 이동 계산에 사용된다는 점이다.

```
position += velocity * largeDeltaTime;
```

`DeltaTime`이 커지면 한 프레임에 이동하는 거리도 함께 커진다.  
그 결과 오브젝트가 충돌체와 충돌하기 전에, 한 프레임 만에 충돌체 반대편으로 넘어가버리는 문제가 발생할 수 있다.  
**이것이 흔히 말하는 터널링 현상이다.**

### 해결 방안 1. Time Clamp

가장 먼저 떠올린 방법은 `DeltaTime`의 최댓값을 제한하는 것이었다.  
즉, TimeManager에서 각 시스템에 전달하는 `DeltaTime`이 일정 값 이상 커지지 않도록 막는 방식이다.

```
deltaTime = std::min(deltaTime, maxDeltaTime);
```

예를 들어 실제 프레임 간 시간이 `0.2초`였더라도, 최대 델타타임을 `0.033초`로 제한하면 게임 로직에는 `0.033초`만 전달된다.

이렇게 하면 한 프레임에 이동하는 거리가 제한된다.  
따라서 오브젝트가 충돌체를 한 번에 지나쳐버리는 상황을 어느 정도 줄일 수 있었다.

하지만 이 방식은 곧 다른 문제를 만들었다.

실제로는 `0.2초`가 지났는데, 게임 로직은 `0.033초`만 지난 것처럼 처리된다.  
즉, 나머지 시간은 사실상 버려지는 셈이다.

그 결과 프레임이 크게 떨어지는 상황에서는 게임 시간이 실제 시간보다 느리게 흐르는 현상이 생겼다.  
원래 `DeltaTime`은 프레임 차이에 영향을 덜 받기 위해 사용하는 값인데, 최댓값을 강제로 잘라내면서 오히려 프레임 저하 상황에서 게임 속도가 느려지는 문제가 발생한 것이다.

| 항목  | 내용                       |
| --- | ------------------------ |
| 장점  | 한 프레임의 이동량을 제한할 수 있다     |
| 효과  | 터널링 가능성을 어느 정도 줄일 수 있다   |
| 문제점 | 실제 경과 시간 일부가 버려질 수 있다    |
| 결과  | 프레임 저하 시 게임 시간이 느려질 수 있다 |

결국 Time Clamp는 `DeltaTime`이 비정상적으로 커지는 것을 막는 안전장치로는 사용할 수 있지만, 터널링 문제의 근본적인 해결책으로 보기는 어려웠다.

문제의 핵심은 시간이 길게 들어왔다는 것 자체보다, **긴 시간을 한 번의 업데이트로 처리한다는 점**에 있었다.  
따라서 다음으로는 `DeltaTime`을 단순히 잘라내는 방식이 아니라, 긴 시간을 여러 개의 작은 시간 단위로 나누어 처리하는 방식을 고민하게 되었다.

### 해결 방안 2. 논리 업데이트를 여러 번 돌리기

`DeltaTime`에 Clamp를 걸면 한 프레임에서 처리하는 시간은 제한할 수 있다.  
하지만 실제로 흐른 시간보다 더 작은 시간이 게임 로직에 전달되기 때문에, 프레임이 저하될수록 게임 시간이 느려지는 문제가 있었다.

그래서 다음으로는 시간을 잘라내는 대신, **긴 DeltaTime을 여러 개의 작은 시간 단위로 나누어 논리 업데이트를 여러 번 실행하는 방식**을 생각했다.

예를 들어 한 번의 논리 업데이트에서 처리할 최대 시간을 `0.33초`로 제한한다고 가정해보자.  
이때 실제 프레임 간 시간이 `1초`라면, `1초`를 한 번에 처리하지 않고 다음과 같이 나누어 처리한다.

```cpp
UpdateLogic(0.33f);
UpdateLogic(0.33f);
UpdateLogic(0.33f);
UpdateLogic(0.01f);
```

이 방식은 `DeltaTime`을 단순히 버리지 않는다.  
실제로 흐른 시간은 최대한 보존하면서도, 한 번의 업데이트에서 처리하는 시간 폭은 제한할 수 있다.

처음에는 이 흐름을 메인 루프에서 제어하려고 했다.

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

이렇게 하면 `DeltaTime`이 길어진 상황에서도 한 번의 논리 업데이트가 너무 큰 시간을 처리하지 않는다.  
따라서 이동량이 과도하게 커지는 것을 줄일 수 있고, 터널링 문제도 완화할 수 있을 것이라 생각했다.

하지만 이 방식에도 문제가 있었다.

내 엔진에서는 논리 업데이트 과정에서 렌더링 패킷을 생성하고 있었다.  
즉, 오브젝트가 `Update`를 수행하면서 자신의 렌더링 정보를 렌더러에 전달하는 구조였다.

```cpp
void GameObject::Update(float deltaTime)
{    
	// 위치, 상태 갱신    
	transform.position += velocity * deltaTime;    
	// 렌더링 요청 생성    
	renderer.Submit(renderPacket);
}
```

문제는 논리 업데이트를 여러 번 돌리면, 렌더링 패킷도 그 횟수만큼 생성된다는 점이었다.

```cpp
UpdateLogic(0.33f); // 렌더링 패킷 생성
UpdateLogic(0.33f); // 렌더링 패킷 생성
UpdateLogic(0.33f); // 렌더링 패킷 생성
UpdateLogic(0.01f); // 렌더링 패킷 생성
```

하지만 실제 화면에 그려야 하는 것은 중간 상태들이 아니라, **모든 논리 업데이트가 끝난 뒤의 최종 상태**다.  

중간 업데이트에서 만들어진 렌더링 패킷은 이미 지나간 상태를 기준으로 만들어진 정보이기 때문에, 최종 렌더링 시점에서는 의미가 없어진다.

더 큰 문제는 렌더링 패킷의 수명과 초기화 타이밍이었다.  
렌더링 패킷 버퍼가 프레임 단위로 정리가 되었기에, 여러 번의 논리 업데이트 과정에서 이전 패킷이 덮어씌워지거나 비워질 수 있다.  
그 결과 최종 렌더링 단계에서 유효한 패킷이 남아 있지 않아, 화면에 아무것도 그려지지 않는 순간이 발생하기도 했었다.

| 문제          |                                  |
| ----------- | -------------------------------- |
| 중간 상태 패킷 생성 | 논리 업데이트마다 렌더링 패킷이 생성됨            |
| 불필요한 패킷 증가  | 실제로 렌더링할 필요 없는 중간 상태까지 렌더 큐에 쌓임  |
| 패킷 수명 문제    | 최종 렌더링 시점에 유효하지 않은 패킷이 남음        |
| 구조적 결합 문제   | Update와 Render Submit이 강하게 묶여 있음 |

결국 이 문제를 통해 알게 된 것은, 논리 업데이트를 여러 번 실행하려면 **논리 갱신과 렌더링 요청 생성을 분리해야 한다**는 점이었다.

논리 업데이트는 여러 번 수행될 수 있다.  
하지만 렌더링 패킷 생성은 매 논리 업데이트마다 수행되는 것이 아니라, 해당 프레임의 논리 업데이트가 모두 끝난 뒤 한 번만 수행되어야 한다.

### 해결 방안 3. 엔진 내부에서 논리 업데이트만 분리해 반복하기

논리 업데이트를 여러 번 실행하는 방식 자체는 `DeltaTime`을 버리지 않으면서도 한 번의 이동량을 제한할 수 있다는 장점이 있었다.  
하지만 클라이언트의 `Update`를 그대로 여러 번 호출하면, 그 안에서 렌더링 패킷 생성이나 이벤트 처리까지 함께 반복될 수 있다는 문제가 있었다.

따라서 이 문제는 클라이언트 레벨에서 해결하기보다, 엔진 내부의 업데이트 흐름을 분리하는 방식으로 접근하는 것이 더 적절하다고 판단했다.

기존 구조에서는 업데이트 과정에서 렌더링 패킷이 함께 생성되었다. (엔진에서 처리해주는 업데이트)

```cpp
Update();
Render();
```

하지만 `DeltaTime`이 길어졌을 때 `Update`를 여러 번 호출하면, 중간 상태의 렌더링 패킷까지 생성된다.  
실제로 화면에 필요한 것은 중간 상태가 아니라, 모든 논리 업데이트가 끝난 뒤의 최종 상태다.

그래서 엔진의 프레임 흐름을 다음과 같이 나누는 방향을 생각했다.

```cpp
LogicUpdateWithSubStep();
GatherRenderPackets(); //렌더링 수집 루프 추가!!
Render();
```

이 구조에서는 긴 `DeltaTime`이 들어오더라도, 반복되는 것은 논리 업데이트뿐이다.
`UpdateWithSubStep`은 전달받은 `DeltaTime`을 작은 시간 단위로 나누어 논리 업데이트만 반복한다.
그리고 렌더링 패킷은 모든 논리 업데이트가 끝난 뒤, 최종 상태를 기준으로 한 번만 수집한다.

```cpp
void RenderSystem::GatherRenderPackets()
{
    for (GameObject* object : visibleObjects)
    {
        RenderPacket packet;
        packet.transform = object->GetTransform();
        packet.mesh = object->GetMesh();
        packet.material = object->GetMaterial();

        renderQueue.Push(packet);
    }
}
```

이렇게 하면 중간 업데이트 단계에서 만들어진 의미 없는 렌더링 패킷이 렌더러로 전달되지 않는다.  
렌더러는 해당 프레임의 최종 상태만 바라보게 되고, 논리 업데이트는 필요한 만큼 세분화해서 처리할 수 있다.

## 3. 시간과 시스템을 어떻게 동기화시키면 좋을까

## 4. 시간과 시스템의 업데이트 관계는 어떻게 잡을까

[^1]: https://docs.unity.cn/Manual/TimeFrameManagement.html?utm_source=chatgpt.com

[^2]: https://dev.epicgames.com/documentation/unreal-engine/actor-ticking-in-unreal-engine?application_version=5.6&utm_source=chatgpt.com
