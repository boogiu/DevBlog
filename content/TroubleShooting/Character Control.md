# 플레이어 상태 관리, 자료구조를 좀 더 활용해볼걸

#게임클라이언트 #상태관리 #FSM #자료구조

---

## 1. 기존 FSM 방식


![[Pasted image 20260521201708.png]]


기존 FSM을 구현할 때에는 각 상태 안에 종료 조건과, 종료 시 이동할 상태에 대한 로직을 함께 포함시켰다.

다만 이 방식은 상태가 늘어날수록 전이 로직이 여기저기 흩어지는 문제가 생겼다. 이를 막기 위해 모든 상태가 일단 IDLE로 복귀한 뒤, IDLE에서 다음 상태로의 전이 조건을 한곳에서 판단하는 방식을 택했다. 전이 로직을 한 곳에 모을 수 있다는 점에서 관리가 편했다.

하지만 이 구조도 상태가 많아지면 한계가 드러났다. IDLE에 전이 조건이 쌓이기 시작했고, 특정 상태를 수정하면 그 상태의 전이 조건을 참조하던 다른 상태가 영향을 받았다. 상태들이 서로를 암묵적으로 알고 있는 구조였던 것이다.

**장점:** 구조가 명확하고 초기 구현이 쉽다. 
**단점:** 상태가 늘어날수록 전이 조건이 복잡하게 얽히고, 한 상태의 수정이 다른 상태에 예상치 못한 영향을 준다.

---

## 2. HFSM과 LayeredFSM으로의 전환

상태가 늘어나면서 단일 FSM만으로는 한계가 왔다. 전이 조건이 복잡하게 얽히는 문제를 구조적으로 풀기 위해 두 가지 접근을 함께 검토했다.
![[Pasted image 20260521203021.png]]

**HFSM(Hierarchical FSM)** 은 상태를 계층으로 묶어, 상위 상태가 하위 상태를 포함하는 방식이다. **Layered FSM** 은 이동 레이어, 전투 레이어처럼 관심사가 다른 FSM을 레이어 단위로 분리한다. 운영체제의 프로세스와 스레드 관계를 참고했다. 프로세스가 독립적인 실행 단위를 가지듯, 레이어마다 독립적인 상태 흐름을 두고 — 스레드가 프로세스 안에서 동작하듯, 각 레이어 안에서 세부 상태가 동작하는 구조다.

이를 바탕으로 **행위(what to do)와 행동(how to do it)을 분리**하는 방향으로 가닥을 잡았다. 특정 행동을 수행하는 상황에서 취해야 할 세부 행동을 부모→자식 관계로 구성하고, 레이어를 나눠 표정, 애니메이션, 그 외 상태들을 병렬로 관리하려 했다.

카테고라이징이 명확해지면서 상태 간의 우선 관계와 상하 관계 파악은 훨씬 쉬워졌다. 같은 부모 안에서의 자식 전이, 같은 레이어 안에서의 상태 전이는 간단한 조건으로도 깔끔하게 처리됐다.

---
## 3. 그래도 남아있던 한계

계층과 레이어로 _묶는_ 문제는 풀었지만, 상태들 사이를 _가로지르는_ 문제는 여전히 남아 있었다.

가장 큰 원인은 **"이 상태가 끝나면 어디로 돌아가는가"를 각 상태가 직접 알고 있어야 한다**는 점이었다. 공격 도중 피격이 발생하면, 피격 상태는 종료 시 공격 상태로 복귀하는 경로를 명시적으로 알고 있어야 했다. 계층이 깊어질수록 이런 참조가 늘어났고, 수정 시 영향 범위를 파악하기가 1챕터보다 오히려 더 어려운 경우도 생겼다.

새로운 상태가 추가될 때마다 기존 상태들과의 전이 조건을 다시 검토해야 했고, 그럴수록 조건문과 상태 체크는 계속 쌓였다.
### 자료구조의 특성을 활용해보기

문제를 다시 정리하니 두 가지였다.

하나는 **상태 복원 문제**다. 어떤 상태가 끝났을 때 어디로 돌아가야 하는지를, 각 상태가 직접 알고 있어야 했다.

다른 하나는 **상태 선정 문제**다. 지금 어떤 상태가 실행되어야 하는지를, 개발자가 간선을 직접 연결하는 방식으로 지정해주고 있었다.

이 두 문제를 각각 **스택**과 **우선순위 큐**로 접근해보면 어떨까 생각했다. 상태가 "다음에 어디로 가야 하는지"를 아는 대신, 구조 자체가 그것을 결정하도록 책임을 넘기는 방식이다.

---

## 5. 스택으로 상태 복원 관리하기

### 스택 기반 상태 복원

상태 전환이 발생할 때 상태 자체를 스택으로 관리하는 방식이다. 새로운 상태가 들어오면 push, 현재 상태를 빠져나가면 pop.

이 구조가 빛을 발하는 상황이 있다. 공격 자세를 잡고 0.2초 후 공격이 진행되려는 찰나, 피격이 발생했다고 하자. 기존 방식이라면 공격 → 공격 종료 → 아이들 → 피격 → 밀림 순서로 상태를 하나씩 거쳐야 했다. 문제는 이 과정에서 공격 상태 진입 시 설정해둔 애니메이션이나 사운드 값들이 중간에 남아버리는 경우가 생긴다는 것이다. 특히 강제 전환 설정이 걸려 있다면 더욱 골치 아파진다.

스택 방식이라면 중간 상태를 모두 건너뛰고 원하는 상태를 바로 덮어씌울 수 있다. 그리고 해당 상태가 끝나면 pop을 통해 이전 상태로 자연스럽게 복귀된다. 각 상태가 "끝나면 어디로 가야 하는지"를 알 필요가 없다.

==다만 실제 구현을 고민하다보니 생각이 좀 바뀌었다.==

---

### pop 타이밍 문제

pop 타이밍을 해결하기 위해 두 가지를 생각해봤다.

첫 번째는 push되는 상태와 현재 top 상태를 비교해 pop 여부를 판단하는 방식. 두 번째는 각 상태에 자동 소멸 조건을 부여해 스택이 알아서 꺼내는 방식.

첫 번째는 문제를 해결하려다 ==동일한 문제가 반복됐다.== 상태끼리 서로를 알아야 한다는 구조가 다시 생겼다. 두 번째는 되려 더 복잡하고 성능 손해가 생길 것 같았다.

---

### 인터럽트 상태와 노멀 상태의 분리

그래서 방향을 바꿨다. 스택을 활용해 상태를 덮어쓰는 방식 자체는 유효하다. 문제는 ==모든 상태에 적용하려 했다는 것==이었다.

**상태를 방해할 수 있는 상태(Interrupt State)** 와 **방해할 수 없는 상태(Normal State)** 를 구분한다. 스테이트 머신은 두 개의 컨테이너를 가진다. 매 프레임 ==인터럽트 스택을 먼저 확인하고, 비어있으면 노멀 상태를 실행==한다.

pop 타이밍 문제도 이 구조에서는 자연스럽게 풀린다. 인터럽트 상태는 대부분 ==명확한 종료 시점==을 가지고 있기 때문이다. 피격 모션이 끝나면 끝, 경직이 풀리면 끝. 상태가 스스로 완료 신호를 보내고 pop되는 방식이 인터럽트 상태의 성격과 잘 맞아 떨어진다.
![[스크린샷 2026-05-08 212933.png]]
이 구조가 유효한 또 다른 케이스가 있다. 동물의 숲류 게임에서 NPC와의 ==대화 → 선물 건네주기 → 다시 대화 시작== 같은 흐름이다. 기존 방식이라면 대화 종료 후 어디로 돌아가야 하는지를 선물 상태가 직접 알고 있어야 했다. 인터럽트 스택을 쓰면 대화 위에 선물 상태를 push하고, 선물이 끝나면 pop— 자연스럽게 대화로 복귀된다. ==상태가 "돌아갈 곳"을 알 필요가 없다.==

---
#### 구현 예시

cpp

```cpp
class IState
{
public:
    virtual ~IState() = default;
    virtual void Enter() = 0;
    virtual void Update(float deltaTime) = 0;
    virtual void Exit() = 0;
    virtual bool IsDone() const = 0; // 상태 완료 여부
};

class StateMachine
{
public:
    // 노멀 상태 교체
    void SetNormalState(IState* state)
    {
        if (normalState) normalState->Exit();
        normalState = state;
        if (normalState) normalState->Enter();
    }

    // 인터럽트 상태 push
    void PushInterruptState(IState* state)
    {
        if (!interruptStack.empty())
            interruptStack.top()->Exit();

        interruptStack.push(state);
        state->Enter();
    }

    void Update(float deltaTime)
    {
        // 인터럽트 스택 먼저 확인
        if (!interruptStack.empty())
        {
            IState* top = interruptStack.top();
            top->Update(deltaTime);

            // 완료되면 알아서 pop
            if (top->IsDone())
            {
                top->Exit();
                interruptStack.pop();

                // 아래 인터럽트 상태가 있으면 재진입
                if (!interruptStack.empty())
                    interruptStack.top()->Enter();
            }
            return;
        }

        // 인터럽트 없으면 노멀 상태 실행
        if (normalState)
            normalState->Update(deltaTime);
    }

private:
    IState*                  normalState = nullptr;
    std::stack<IState*>      interruptStack;
};
```


---

## 6. 우선순위 큐로 상태 선정 자동화하기

다음 문제는 **상태 간의 간선을 직접 이어주는 방식**이었다. 개발자가 "A 상태에서 B 상태로"를 일일이 연결해주는 대신, 데이터나 사전 설정에 따라 자연스럽게 흘러가는 구조를 만들고 싶었다.

그 와중에 떠오른 것이 ==윈도우의 메시지 큐== 구조였다. 윈도우가 메시지를 직접 처리하는 대신 큐에 밀어넣고 순서대로 소화하듯, 상태 전환도 요청을 큐에 넣는 방식으로 바꾸면 어떨까.

기존 구조의 문제는 명확했다. ==동일한 조건에서 두 개의 상태가 중복으로 전이 요청을 하면, 영문 모를 행동이 발생하기도 했다.== 각 상태가 서로의 전환을 직접 건드리다 보니 생기는 문제였다.

새로운 구조에서는 ==각 상태는 그저 본인이 원하는 상태로의 전이 요청을 큐에 넣을 뿐==이다. 실제로 어떤 요청을 처리할지는 스테이트 머신이 결정한다. 여기에 우선순위를 부여해, 더 중요한 요청이 먼저 처리되도록 한다.

또한 `PeekMessage`처럼 ==현재 전환이 불가능한 상태라면, 들어오는 요청을 전부 비우는 방식==으로 처리해도 무방하다. 처리할 수 없는 요청이 쌓여 나중에 오작동하는 것을 막을 수 있다.
![[스크린샷 2026-05-08 181027.png]]
이 구조의 장점은 다음과 같다.

- **중복 전이 문제 해소** — 상태를 병렬로 돌려도 요청이 큐를 통해 일원화되므로 중복 처리 확률이 낮아진다.
- **병렬 상태 간 안전한 간섭** — 도구 상태가 "도구를 든 걸음으로 바꿔줘"하고 움직임 상태에 요청하는 것처럼, ==서로 직접 건드리지 않고 요청만 던지는 방식==으로 안전하게 상호작용할 수 있다.
- **외부에서의 상태 전환이 편해진다** — "현재 대화 상대를 대화 상태로 전환시켜줘"처럼 외부 시스템에서 상태 전환을 요청하기가 매우 쉬워진다.

---
```cpp
enum class StatePriority
{
    Low      = 0,
    Medium   = 1,
    High     = 2,
    Critical = 3
};

enum class StateType
{
    Normal,
    Interrupt
};

struct StateRequest
{
    std::string   stateId;
    StateType     type;
    StatePriority priority;

    bool operator<(const StateRequest& other) const
    {
        return priority < other.priority;
    }
};

class IState
{
public:
    virtual ~IState() = default;
    virtual void Enter() = 0;
    virtual void Update(float deltaTime) = 0;
    virtual void Exit() = 0;
    virtual bool IsDone() const = 0;
    virtual bool CanTransition() const = 0; // 전환 가능 여부
};

class StateMachine
{
public:
    void RegisterState(const std::string& id, std::unique_ptr<IState> state)
    {
        stateRegistry[id] = std::move(state);
    }

    // 외부에서 요청 밀어넣기
    void RequestState(const std::string& stateId,
                      StateType type,
                      StatePriority priority = StatePriority::Medium)
    {
        requestQueue.push({ stateId, type, priority });
    }

    void Update(float deltaTime)
    {
        ProcessRequests();
        ExecuteCurrentState(deltaTime);
    }

private:
    void ProcessRequests()
    {
        while (!requestQueue.empty())
        {
            StateRequest request = requestQueue.top();
            requestQueue.pop();

            IState* current = GetCurrentState();

            // PeekMessage식 flush — 전환 불가 상태면 요청 전부 버림
            if (current && !current->CanTransition())
            {
                while (!requestQueue.empty()) requestQueue.pop();
                return;
            }

            if (request.type == StateType::Interrupt)
                PushInterrupt(request.stateId);
            else
                SetNormal(request.stateId);
        }
    }

    void ExecuteCurrentState(float deltaTime)
    {
        // 인터럽트 스택 먼저 확인
        if (!interruptStack.empty())
        {
            IState* top = interruptStack.top();
            top->Update(deltaTime);

            if (top->IsDone())
            {
                top->Exit();
                interruptStack.pop();

                if (!interruptStack.empty())
                    interruptStack.top()->Enter();
            }
            return;
        }

        // 비어있으면 노멀 상태 실행
        if (normalState)
            normalState->Update(deltaTime);
    }

    void SetNormal(const std::string& stateId)
    {
        IState* next = stateRegistry[stateId].get();
        if (!next) return;

        if (normalState) normalState->Exit();
        normalState = next;
        normalState->Enter();
    }

    void PushInterrupt(const std::string& stateId)
    {
        IState* next = stateRegistry[stateId].get();
        if (!next) return;

        if (!interruptStack.empty())
            interruptStack.top()->Exit();

        interruptStack.push(next);
        next->Enter();
    }

    IState* GetCurrentState()
    {
        if (!interruptStack.empty()) return interruptStack.top();
        return normalState;
    }

    std::priority_queue<StateRequest>                          requestQueue;
    std::stack<IState*>                                        interruptStack;
    IState*                                                    normalState = nullptr;
	    std::unordered_map<std::string, std::unique_ptr<IState>>   stateRegistry;
};
```

```cpp
// 대화 시작
stateMachine.RequestState("Dialogue", StateType::Normal, StatePriority::Medium);

// 선물 건네주기 — 대화 위에 push
stateMachine.RequestState("Gift", StateType::Interrupt, StatePriority::Medium);

// Gift IsDone() → pop → 대화로 자동 복귀
```

---

#### 고려해야 할 문제들
##### 1. 우선순위 설정은 어떻게 할 것인가
우선순위를 동적으로 넘기는 방식은 유연하지만, ==요청하는 쪽이 우선순위를 알아야 한다==는 부담이 생긴다. 도구 상태가 움직임 상태에 요청할 때, 도구 상태가 움직임 상태의 우선순위 체계까지 알고 있어야 한다는 건 어색하다.

그렇다고 정적으로 고정하면 상황에 따라 유연하게 대응하기 어렵다.

현실적인 방향은 ==설계 시점에 우선순위 규칙을 명시적으로 정의==해두는 것이다. 예를 들어 상태 ID와 우선순위를 매핑한 테이블을 별도로 관리하고, 요청하는 쪽은 우선순위를 직접 알 필요 없이 상태 ID만 넘기면 스테이트 머신이 테이블을 보고 우선순위를 결정하는 방식이다. 요청자의 부담을 줄이면서도 동적으로 관리할 수 있는 여지를 남길 수 있다.

다만 이 규칙 테이블 자체를 ==누가 어떻게 관리하느냐==는 여전히 설계 시점에 명확히 정해야 할 숙제로 남는다.

---

##### 2. 동시 요청인가? 대기 요청인가?

전투처럼 즉각 반응이 필요한 케이스와, AI처럼 한 프레임 딜레이가 괜찮은 케이스가 공존한다. 이걸 하나의 방식으로 통일하면 어느 한쪽이 손해를 본다.

그래서 ==요청을 큐에 넣을 때 대기열 여부를 함께 보내는 방식==을 생각해봤다.

- **동시 진행 요청** — 전환 불가 상태에서 flush 대상이 된다. 지금 처리할 수 없으면 버린다.
- **대기열 요청** — flush하지 않고 큐에 남겨둔다. 전환 가능한 상태가 되었을 때 처리된다.

이렇게 하면 ==요청의 성격에 따라 생존 여부가 결정==된다. 피격처럼 지금 당장 반응해야 하는 요청은 동시 진행으로, 퀘스트 완료 후 대화 시작처럼 조건이 갖춰지면 처리해도 되는 요청은 대기열로 보내는 것이다.

cpp

```cpp
enum class RequestMode
{
    Immediate, // 전환 불가 시 flush
    Queued     // 전환 가능할 때까지 대기
};

struct StateRequest
{
    std::string   stateId;
    StateType     type;
    StatePriority priority;
    RequestMode   mode = RequestMode::Immediate;

    bool operator<(const StateRequest& other) const
    {
        return priority < other.priority;
    }
};
```

flush 처리:
```cpp
void ProcessRequests()
{
    while (!requestQueue.empty())
    {
        StateRequest request = requestQueue.top();
        requestQueue.pop();

        IState* current = GetCurrentState();

        if (current && !current->CanTransition())
        {
            // Immediate 요청만 버리고, Queued는 다시 넣어둠
            if (request.mode == RequestMode::Immediate)
                continue;
            else
            {
                pendingQueue.push(request);
                continue;
            }
        }

        if (request.type == StateType::Interrupt)
            PushInterrupt(request.stateId);
        else
            SetNormal(request.stateId);
    }

    // 전환 가능해진 시점에 대기 중인 요청 복구
    while (!pendingQueue.empty())
    {
        requestQueue.push(pendingQueue.top());
        pendingQueue.pop();
    }
}
```

**사용 예시:**
```cpp
// 피격 — 지금 당장 처리, 안되면 버림
stateMachine.RequestState("Hit", StateType::Interrupt,
    StatePriority::High, RequestMode::Immediate);

// 퀘스트 완료 후 대화 — 조건 갖춰지면 처리
stateMachine.RequestState("QuestDialogue", StateType::Normal,
    StatePriority::Low, RequestMode::Queued);
```

---
---

### 결론

플레이어 한정 구조로 보면, 지금 설계는 충분히 실용적이다.

다만 솔직히 ==Queued 요청의 수명과 유효성 관리==, 그리고 ==우선순위 규칙을 누가 어떻게 정의하느냐==는 걱정거리로 남아있다. 구조가 커질수록 이 두 가지가 다시 복잡도를 끌어올릴 가능성이 있다.

그럼에도 이 구조가 흥미로운 이유가 있다. 상태 전환을 ==요청 기반==으로 추상화해뒀기 때문에, 요청을 만들어내는 주체를 바꾸는 것만으로 전혀 다른 가능성이 열린다.

요즘 핫한 AI가 런타임 중에 각 상태에 대한 가중치만을 판단해서 요청을 밀어넣는다면 어떨까. 개발자가 간선을 직접 긋거나 조건을 수동으로 튜닝하는 대신, ==AI가 상황을 읽고 알아서 적절한 상태를 요청==하는 구조가 된다. 스테이트 머신은 그 요청을 받아 처리할 뿐이고.

설계자의 개입은 줄고, 캐릭터는 더 생동감 있게 움직일 수 있다. 지금 구조가 그 가능성을 열어두고 있다는 것만으로도, 충분히 의미 있는 설계라고 생각한다.