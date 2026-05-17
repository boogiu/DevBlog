

## 1. 데드락 발생 조건

### 문제

**3번. 데드락 발생 조건에 해당하지 않는 것은?**

A. 상호 배제  
B. 점유와 대기  
C. 선점 가능  
D. 순환 대기

정답: **C. 선점 가능**

---

## 데드락이란?

데드락은 여러 프로세스나 스레드가 서로 필요한 자원을 가진 채, 상대방이 자원을 놓기를 기다리면서 영원히 진행되지 못하는 상태이다.

예를 들어,

```
Thread A: Mutex1을 잡고 Mutex2를 기다림Thread B: Mutex2를 잡고 Mutex1을 기다림
```

이 경우 A와 B는 서로가 가진 락을 기다리기 때문에 둘 다 진행하지 못한다.

---

## 데드락의 4가지 발생 조건

데드락이 발생하려면 보통 다음 4가지 조건이 동시에 만족되어야 한다.

### 1. 상호 배제

하나의 자원을 한 번에 하나의 스레드만 사용할 수 있는 상태이다.

예를 들어 뮤텍스는 한 스레드가 소유하면 다른 스레드는 그 뮤텍스를 동시에 소유할 수 없다.

```
std::mutex resourceMutex;
```

이 뮤텍스를 한 스레드가 잡고 있으면 다른 스레드는 대기해야 한다.

---

### 2. 점유와 대기

이미 어떤 자원을 점유한 상태에서, 다른 자원을 추가로 기다리는 상태이다.

예를 들어,

```
Thread A:- Mutex1 소유 중- Mutex2를 기다림
```

이 상황에서 A는 Mutex1을 놓지 않고 Mutex2를 기다리고 있다.

---

### 3. 비선점

다른 스레드가 가진 자원을 강제로 빼앗을 수 없는 상태이다.

뮤텍스는 보통 소유한 스레드가 직접 unlock 해야 한다.

```
resourceMutex.lock();// 작업resourceMutex.unlock();
```

운영체제가 임의로 “네가 가진 뮤텍스 뺏어서 다른 스레드에게 줄게”라고 하지 않는다.

그래서 데드락 조건은 **선점 가능**이 아니라 **비선점**이다.

---

### 4. 순환 대기

스레드들이 원형 구조로 서로의 자원을 기다리는 상태이다.

```
Thread A -> Thread B의 자원을 기다림Thread B -> Thread C의 자원을 기다림Thread C -> Thread A의 자원을 기다림
```

이런 식으로 대기 관계가 순환하면 데드락이 발생할 수 있다.

---

## 정리

|조건|의미|
|---|---|
|상호 배제|자원을 한 번에 하나만 사용할 수 있음|
|점유와 대기|자원을 가진 채 다른 자원을 기다림|
|비선점|자원을 강제로 빼앗을 수 없음|
|순환 대기|서로의 자원을 원형으로 기다림|

따라서 문제에서 **데드락 발생 조건에 해당하지 않는 것**은 **C. 선점 가능**이다.

---

# 2. 뮤텍스와 세마포어

## 문제

**4번. 뮤텍스와 세마포어에 대한 설명으로 가장 적절한 것은?**

A. 뮤텍스는 여러 스레드가 동시에 소유할 수 있다.  
B. 세마포어는 카운터 값을 이용해 접근 가능한 자원 수를 제어할 수 있다.  
C. 뮤텍스는 프로세스 간 동기화에 절대 사용할 수 없다.  
D. 세마포어는 항상 이진 값만 가진다.

정답: **B. 세마포어는 카운터 값을 이용해 접근 가능한 자원 수를 제어할 수 있다.**

---

## 뮤텍스란?

뮤텍스는 Mutual Exclusion의 줄임말이다.

즉, **상호 배제**를 위한 동기화 도구이다.

한 번에 하나의 스레드만 특정 코드 영역이나 자원에 접근하게 만들 때 사용한다.

```cpp
std::mutex mutex;
void Add()
{    
	mutex.lock();    
	sharedValue++;    
	mutex.unlock();
}
```

위 코드에서 `sharedValue++`는 여러 스레드가 동시에 실행하면 문제가 생길 수 있다.  
그래서 뮤텍스로 감싸서 한 번에 하나의 스레드만 접근하게 한다.

---

## 뮤텍스의 핵심

뮤텍스는 기본적으로 **소유권** 개념이 있다.

즉, 락을 건 스레드가 unlock 하는 것이 원칙이다.

```cpp
mutex.lock();// 이 스레드가 mutex를 소유함
mutex.unlock();
```

그래서 뮤텍스는 보통 다음과 같은 상황에 사용한다.

```
공유 데이터 보호
공유 컨테이너 보호
임계 영역 보호
```

---

## 세마포어란?

세마포어는 내부에 **카운터 값**을 가지고 있는 동기화 도구이다.
카운터 값은 동시에 접근 가능한 자원의 개수를 의미할 수 있다.

예를 들어, 자원이 3개라면 세마포어의 카운터를 3으로 둘 수 있다.

```cpp
std::counting_semaphore<3> semaphore(3);
```

이 경우 최대 3개의 스레드가 동시에 접근할 수 있다.

---

## 세마포어 예시

```cpp
semaphore.acquire();// 제한된 자원 사용
semaphore.release();
```

`acquire()`는 카운터를 감소시키고,  
`release()`는 카운터를 증가시킨다.

카운터가 0이면 더 이상 접근할 수 없으므로 대기한다.

---

## 뮤텍스와 세마포어 차이

|구분|뮤텍스|세마포어|
|---|---|---|
|목적|하나의 자원 보호|여러 개의 제한된 자원 관리|
|동시 접근 수|보통 1개|카운터 값만큼 가능|
|소유권|있음|일반적으로 뮤텍스보다 소유권 개념이 약함|
|대표 사용처|공유 변수 보호|작업 수 제한, 리소스 풀 제어|

---

## 선택지 해설

### A. 뮤텍스는 여러 스레드가 동시에 소유할 수 있다.

틀렸다.

뮤텍스는 동시에 하나의 스레드만 소유해야 한다.  
여러 스레드가 동시에 소유할 수 있으면 상호 배제의 의미가 사라진다.

---

### B. 세마포어는 카운터 값을 이용해 접근 가능한 자원 수를 제어할 수 있다.

맞다.

세마포어는 카운터 기반으로 동작한다.  
카운터가 3이면 최대 3개의 스레드가 통과할 수 있다.

---

### C. 뮤텍스는 프로세스 간 동기화에 절대 사용할 수 없다.

틀렸다.

일반적인 `std::mutex`는 같은 프로세스 내부 스레드 동기화에 사용하지만, 운영체제에서 제공하는 named mutex 같은 기능은 프로세스 간 동기화에도 사용할 수 있다.

Windows 기준으로는 커널 오브젝트 기반 Mutex를 사용하면 프로세스 간 동기화가 가능하다.

---

### D. 세마포어는 항상 이진 값만 가진다.

틀렸다.

세마포어는 크게 두 가지로 나눌 수 있다.

|종류|설명|
|---|---|
|Binary Semaphore|값이 0 또는 1|
|Counting Semaphore|값이 0 이상 여러 값 가능|

세마포어가 항상 이진 값만 가지는 것은 아니다.

---

# 3. 페이지 폴트

## 문제

**6번. 페이지 폴트가 발생하는 상황으로 가장 적절한 것은?**

A. CPU가 레지스터 값을 읽을 때  
B. 접근한 가상 페이지가 현재 물리 메모리에 없을 때  
C. 함수 호출이 발생할 때마다  
D. 스레드가 종료될 때마다

정답: **B. 접근한 가상 페이지가 현재 물리 메모리에 없을 때**

---

## 페이지 폴트란?

페이지 폴트는 CPU가 어떤 가상 주소에 접근했는데, 해당 가상 페이지가 현재 물리 메모리에 올라와 있지 않을 때 발생하는 예외이다.
즉, 가상 메모리 시스템에서 발생하는 현상이다.

---

## 가상 메모리와 페이지

프로세스는 자신만의 가상 주소 공간을 가진다.

예를 들어 프로세스 입장에서는 다음과 같은 주소를 사용하는 것처럼 보인다.

```
0x00000000 ~ 0xFFFFFFFF
```

하지만 이 주소가 실제 물리 RAM 주소를 그대로 의미하는 것은 아니다.

운영체제와 MMU는 가상 주소를 물리 주소로 변환한다.

이때 메모리는 일정한 크기의 단위로 나뉘는데, 이 단위를 **페이지**라고 한다.

---

## 페이지 폴트 발생 흐름

```
프로그램이 어떤 가상 주소에 접근        
↓
MMU가 페이지 테이블 확인        
↓
해당 페이지가 물리 메모리에 없음        
↓
페이지 폴트 발생       
↓
운영체제가 디스크 또는 백업 저장소에서 페이지를 로드        
↓
페이지 테이블 갱신        
↓
명령어 재시도
```

---

## 페이지 폴트가 항상 오류는 아니다

페이지 폴트라고 해서 무조건 프로그램이 잘못된 것은 아니다.
정상적인 경우에도 페이지 폴트는 발생할 수 있다.

예를 들어,

```
처음 접근하는 메모리
아직 RAM에 올라오지 않은 코드 영역
디스크로 내려간 페이지
지연 로딩된 메모리
```

이런 경우 운영체제가 필요한 페이지를 물리 메모리에 올려주고 실행을 계속할 수 있다.

---

## 하지만 잘못된 접근이면?

다음과 같은 경우에는 처리할 수 없는 페이지 폴트가 발생할 수 있다.

```
nullptr 
접근권한 없는 메모리 접근
해제된 메모리 접근
잘못된 주소 접근
```

예를 들어,

```cpp
int* pointer = nullptr;
*pointer = 10;
```

이 코드는 유효하지 않은 주소에 접근하므로 프로그램이 비정상 종료될 수 있다.

---

# 4. Race Condition

## 문제

**7번. Race Condition이 발생하는 대표적인 상황은?**

A. 여러 스레드가 공유 데이터를 동기화 없이 접근할 때  
B. 단일 스레드가 지역 변수만 사용할 때  
C. 함수가 한 번만 호출될 때  
D. 프로그램이 컴파일될 때

정답: **A. 여러 스레드가 공유 데이터를 동기화 없이 접근할 때**

---

## Race Condition이란?

Race Condition은 여러 실행 흐름이 같은 데이터에 접근하고, 실행 순서에 따라 결과가 달라지는 문제이다.

특히 여러 스레드가 공유 데이터를 동시에 읽고 쓰면서 동기화가 없을 때 자주 발생한다.

---

## 예시

```cpp
int sharedCount = 0;
void Add()
{    
	sharedCount++;
}
```

`sharedCount++`는 한 줄이지만 실제로는 대략 다음 과정으로 나뉜다.

```
1. sharedCount 값을 읽는다.
2. 읽은 값에 1을 더한다.
3. 결과를 sharedCount에 다시 저장한다.
```

만약 두 스레드가 동시에 실행하면 다음과 같은 일이 생길 수 있다.

```
sharedCount = 0
Thread A: sharedCount 읽음 -> 0
Thread B: sharedCount 읽음 -> 0
Thread A: 1을 저장
Thread B: 1을 저장
```

두 번 증가시켰으므로 기대값은 2인데, 실제 결과는 1이 된다.

이것이 Race Condition이다.

---

## 해결 방법

공유 데이터 접근을 동기화해야 한다.

### 방법 1. 뮤텍스 사용

```cpp
std::mutex countMutex;
int sharedCount = 0;
void Add()
{    
	std::lock_guard<std::mutex> lockGuard(countMutex);    
	sharedCount++;
}
```

---

### 방법 2. atomic 사용

```cpp
std::atomic<int> sharedCount = 0;
void Add()
{   
 sharedCount++;
}
```

단순 카운터 증가처럼 원자적 연산으로 충분한 경우에는 `atomic`을 사용할 수 있다.

---

# 5. Critical Section

## 문제

**8번. Critical Section에 대한 설명으로 옳은 것은?**

A. 반드시 커널 모드에서만 실행되는 코드이다.  
B. 공유 자원에 접근하는 코드 영역을 의미한다.  
C. 컴파일러가 자동으로 제거하는 코드이다.  
D. 스택 영역에만 존재하는 메모리이다.

정답: **B. 공유 자원에 접근하는 코드 영역을 의미한다.**

---

## Critical Section이란?

Critical Section은 여러 스레드가 동시에 접근하면 문제가 생길 수 있는 공유 자원 접근 코드 영역을 말한다.

한국어로는 **임계 영역**이라고 부른다.

---

## 예시

```cpp
std::vector<int> sharedVector;
std::mutex vectorMutex;
void PushValue(int value)
{
    std::lock_guard<std::mutex> lockGuard(vectorMutex);   
    sharedVector.push_back(value);
}
```

여기서 임계 영역은 다음 부분이다.

```cpp
sharedVector.push_back(value);
```

왜냐하면 `sharedVector`는 여러 스레드가 동시에 수정하면 내부 상태가 깨질 수 있기 때문이다.

---

## 임계 영역의 핵심

임계 영역 자체가 특별한 메모리 영역을 의미하는 것은 아니다.
즉, 다음과 같은 뜻이 아니다.

```
스택 영역
힙 영역
커널 영역
코드 영역
```

임계 영역은 **개념적인 코드 구간**이다.
**공유 자원에 접근하기 때문에 보호가 필요한 영역**이라고 보면 된다.

---

## 임계 영역 보호 방법

```cpp
mutex.lock();// Critical Section
sharedData++;
mutex.unlock();
```

실제 코드에서는 예외 안정성을 위해 직접 `lock()` / `unlock()`보다 `lock_guard`를 더 자주 사용한다.

```cpp
void Add()
{    
	std::lock_guard<std::mutex> lockGuard(dataMutex);    
	sharedData++;
}
```

---

# 6. condition_variable의 wait와 predicate

## 문제

**9번. condition_variable의 wait에서 predicate를 함께 쓰는 이유로 가장 적절한 것은?**

A. 컴파일 시간을 줄이기 위해서  
B. Spurious Wakeup이나 조건 미충족 상태에서 깨어나는 상황을 방지하기 위해서  
C. 스레드 생성을 막기 위해서  
D. 뮤텍스를 사용하지 않기 위해서

정답: **B. Spurious Wakeup이나 조건 미충족 상태에서 깨어나는 상황을 방지하기 위해서**

---

## condition_variable이란?

`condition_variable`은 어떤 조건이 만족될 때까지 스레드를 대기시키는 동기화 도구이다.
예를 들어 작업 큐가 비어 있으면 워커 스레드는 잠들어 있다가, 작업이 추가되면 깨어나야 한다.

```cpp
std::condition_variable conditionVariable;
std::mutex queueMutex;
std::queue<Job> jobQueue;
```

---

## 기본 흐름

```cpp
std::unique_lock<std::mutex> lock(queueMutex);
conditionVariable.wait(lock);
```

이렇게 하면 현재 스레드는 대기 상태로 들어간다.
다른 스레드가 다음을 호출하면 깨어날 수 있다.

```cpp
conditionVariable.notify_one();
```

또는

```cpp
conditionVariable.notify_all();
```

---

## 문제: 깨어났다고 조건이 만족된 것은 아니다

`wait()`에서 스레드가 깨어났다고 해서 반드시 작업이 있다는 뜻은 아니다.
대표적으로 두 가지 문제가 있다.

---

## 1. Spurious Wakeup

Spurious Wakeup은 명시적인 notify가 없거나, 조건이 만족되지 않았는데도 스레드가 깨어나는 현상이다.

운영체제나 스레드 스케줄링 특성상 발생할 수 있기 때문에 `condition_variable`을 사용할 때 반드시 고려해야 한다.

---

## 2. 다른 스레드가 먼저 가져간 경우

예를 들어 작업 큐에 작업이 하나 들어왔다고 하자.
```cpp
jobQueue.push(job);
conditionVariable.notify_all();
```

여러 워커 스레드가 깨어날 수 있다.

그런데 실제 작업은 하나뿐이다.

```
Thread A: 깨어남 -> 작업 가져감
Thread B: 깨어남 -> 큐를 보니 이미 비어 있음
```

Thread B도 깨어났지만 조건은 더 이상 만족되지 않는다.

---

## 그래서 predicate를 쓴다

```cpp
conditionVariable.wait(lock, [] {    return !jobQueue.empty();});
```

이 형태는 내부적으로 다음과 비슷하게 동작한다.

```cpp
while (!condition)
{    
	conditionVariable.wait(lock);
}
```

즉, 깨어난 뒤에도 조건을 다시 검사한다.
조건이 만족되지 않으면 다시 잠든다.

---

## Thread Pool에서 자주 쓰는 형태

```cpp
conditionVariable.wait(lock, [&] {    
return stopRequested || !jobQueue.empty();
});
```

이 조건은 두 가지 상황에서 깨어날 수 있게 한다.

```
1. 종료 요청이 들어온 경우
2. 작업 큐에 작업이 생긴 경우
```

워커 스레드는 깨어난 뒤 조건을 확인하고 안전하게 동작한다.

---

## wait 중에는 뮤텍스를 계속 잡고 있을까?

중요한 점은 `wait()`가 호출되면 대기하는 동안 뮤텍스를 잠시 풀어준다는 것이다.

```
conditionVariable.wait(lock);
```

이때 내부적으로는 다음 흐름이 일어난다.

```
1. mutex를 잡은 상태에서 wait 호출
2. wait가 mutex를 풀고 스레드를 잠재움
3. notify를 받으면 깨어남
4. 다시 mutex를 획득
5. wait 함수에서 빠져나옴
```

만약 wait 중에 뮤텍스를 계속 잡고 있으면, 다른 스레드가 큐에 작업을 넣을 수 없으므로 데드락처럼 멈출 수 있다.

---

# 7. Thread Pool

## 문제

**10번. Thread Pool을 사용하는 이유로 가장 적절한 것은?**

A. 모든 작업을 반드시 직렬로 처리하기 위해서  
B. 스레드 생성/소멸 비용을 줄이고 작업을 재사용 가능한 워커에 분배하기 위해서  
C. CPU 코어 수를 무시하기 위해서  
D. 메모리 사용량을 무조건 0으로 만들기 위해서

정답: **B. 스레드 생성/소멸 비용을 줄이고 작업을 재사용 가능한 워커에 분배하기 위해서**

---

## Thread Pool이란?

Thread Pool은 미리 여러 개의 워커 스레드를 만들어두고, 작업이 들어올 때마다 기존 스레드에 일을 분배하는 구조이다.

매번 작업마다 스레드를 새로 만들지 않는다.

---

## 왜 필요한가?

스레드는 만드는 비용이 작지 않다.

```
std::thread worker(SomeTask);
worker.join();
```

작업 하나마다 스레드를 만들고 제거하면 다음 비용이 반복된다.

```
스레드 생성 비용
스택 메모리 할당
커널 객체 생성
스케줄링 비용
컨텍스트 스위칭 비용
스레드 종료 정리 비용
```

작업이 많고 자주 발생하는 구조에서는 이 비용이 커진다.

---

## Thread Pool 구조

```
작업 제출   
↓
작업 큐에 저장   
↓
대기 중인 워커 스레드가 깨어남   
↓
작업을 꺼내 실행   
↓
다시 작업 큐 대기
```

---

## 일반적인 구성 요소

|구성 요소|역할|
|---|---|
|Worker Thread|실제 작업을 실행하는 스레드|
|Job Queue|실행할 작업을 저장하는 큐|
|Mutex|작업 큐 동시 접근 보호|
|condition_variable|작업이 들어올 때 워커를 깨움|
|Future|작업 결과를 나중에 받을 수 있게 함|

---

## 간단한 형태

```cpp
std::queue<std::function<void()>> jobQueue;
std::mutex queueMutex;
std::condition_variable conditionVariable;
bool stopRequested = false;
```

워커 스레드는 보통 이런 식으로 동작한다.

```cpp
while (true)
{
    std::function<void()> job;    
    {
            std::unique_lock<std::mutex> lock(queueMutex);     
            
            conditionVariable.wait(lock, [&] {
                        return stopRequested || !jobQueue.empty();
                        });   
                        
            if (stopRequested && jobQueue.empty())
                break;
	        
	        job = std::move(jobQueue.front());
	        jobQueue.pop();
    }
    
    job();
        
}
```

중요한 점은 작업을 실행하는 `job()`은 보통 락 바깥에서 실행한다는 것이다.

```
{    // 큐에서 작업을 꺼내는 동안만 락}job(); // 실제 작업은 락 밖에서 실행
```

그래야 다른 워커가 큐에 접근할 수 있고, 작업 하나가 오래 걸려도 전체 큐가 막히지 않는다.

---

# 8. 같이 외우면 좋은 관련 개념

## mutex와 lock_guard

직접 `lock()` / `unlock()`을 쓰면 중간에 예외나 return이 발생했을 때 unlock이 누락될 수 있다.

```cpp
mutex.lock();
if (error)    
	return; // unlock 누락 위험
mutex.unlock();
```

그래서 C++에서는 RAII 기반의 `lock_guard`를 많이 사용한다.

```cpp
{    
	std::lock_guard<std::mutex> lockGuard(mutex);    
	sharedData++;
}
```

스코프를 벗어나면 자동으로 unlock 된다.

---

## unique_lock

`unique_lock`은 `lock_guard`보다 기능이 많다.

특히 `condition_variable::wait()`에는 보통 `unique_lock`이 필요하다.

```cpp
std::unique_lock<std::mutex> lock(queueMutex);
conditionVariable.wait(lock, predicate);
```

`wait()` 내부에서 잠시 unlock 했다가 다시 lock 해야 하기 때문이다.

---

## atomic

`atomic`은 특정 연산을 원자적으로 수행하게 해준다.

```cpp
std::atomic<int> count = 0;
count++;
```

단순 카운터, 플래그, 상태 값에는 뮤텍스보다 가볍게 사용할 수 있다.

하지만 여러 데이터를 함께 보호해야 하는 경우에는 뮤텍스가 더 적합하다.

```cpp
// atomic 하나로는 이런 복합 상태 보호가 어려움
position.x++;
position.y++;
state = Moving;
```

---

## notify_one과 notify_all

|함수|의미|
|---|---|
|notify_one|대기 중인 스레드 하나를 깨움|
|notify_all|대기 중인 모든 스레드를 깨움|

작업 하나가 추가되었으면 보통 `notify_one()`이 적합하다.

```cpp
jobQueue.push(job);
conditionVariable.notify_one();
```

종료 요청처럼 모든 워커가 깨어나야 하는 상황이면 `notify_all()`을 사용한다.

```cpp
stopRequested = true;
conditionVariable.notify_all();
```


---
## 14. False Sharing

### 문제

**14번. False Sharing에 대한 설명으로 가장 적절한 것은?**

A. 서로 다른 스레드가 같은 캐시 라인에 있는 다른 데이터를 수정해 성능 저하가 발생하는 현상이다.  
B. 포인터가 nullptr을 가리키는 현상이다.  
C. 두 프로세스가 같은 가상 주소를 사용하는 현상이다.  
D. 함수 이름이 같은 현상이다.

정답: **A. 서로 다른 스레드가 같은 캐시 라인에 있는 다른 데이터를 수정해 성능 저하가 발생하는 현상이다.**

---

## False Sharing이란?

False Sharing은 **서로 다른 스레드가 서로 다른 변수를 수정하고 있는데도**, 그 변수들이 **같은 캐시 라인에 들어 있어서** 성능 저하가 발생하는 현상이다.

핵심은 이것이다.

```
실제로는 같은 데이터를 공유하지 않음
하지만 CPU 캐시 관점에서는 같은 캐시 라인을 공유함
그래서 서로 영향을 줌
```

---

## 캐시 라인이란?

CPU는 메모리에서 데이터를 가져올 때 변수 하나만 딱 가져오지 않는다.

보통 일정 크기의 묶음 단위로 가져온다.  
이 단위를 **캐시 라인(Cache Line)**이라고 한다.

일반적으로 캐시 라인은 **64바이트**인 경우가 많다.

예를 들어 다음과 같은 변수가 있다고 하자.

```cpp
struct Counter
{    
	int counterA;    
	int counterB;
};
```

`counterA`와 `counterB`는 서로 다른 변수지만, 메모리상에서 붙어 있기 때문에 같은 캐시 라인에 들어갈 가능성이 높다.

---

## False Sharing 발생 예시

```cpp
struct Counter{    
	std::atomic<int> counterA;    
	std::atomic<int> counterB;
};

Counter counter;
```

이 상황에서 두 스레드가 다음처럼 동작한다고 하자.

```
Thread A: counter.counterA만 계속 증가
Thread B: counter.counterB만 계속 증가
```

겉보기에는 서로 다른 변수를 수정하고 있다.

```cpp
counterA != counterB
```

그래서 논리적으로는 공유 충돌이 없어 보인다.

하지만 두 변수가 같은 캐시 라인에 들어 있으면 CPU 입장에서는 문제가 생긴다.

---

## 왜 성능이 떨어질까?

멀티코어 환경에서 각 코어는 자기 캐시를 가진다.

```
Core 1 Cache: counterA가 들어 있는 캐시 라인 보유
Core 2 Cache: counterB가 들어 있는 캐시 라인 보유
```

그런데 `counterA`와 `counterB`가 같은 캐시 라인에 있다면, 둘 중 하나만 수정해도 캐시 라인 전체가 수정된 것으로 취급된다.

즉,

```
Thread A가 counterA 수정→ counterA가 들어 있는 캐시 라인이 변경됨→ 다른 코어의 같은 캐시 라인은 무효화될 수 있음
Thread B가 counterB 수정→ 같은 캐시 라인이 또 변경됨→ 다시 다른 코어의 캐시 라인이 무효화될 수 있음
```

결국 두 스레드는 서로 다른 데이터를 건드리고 있는데도 캐시 라인 단위로 계속 충돌한다.

이 때문에 캐시 동기화 비용이 증가하고 성능이 떨어진다.

---

## 이름이 False Sharing인 이유

실제로는 `counterA`와 `counterB`라는 서로 다른 데이터를 사용한다.
하지만 캐시 라인 단위로 보면 같은 영역을 공유하는 것처럼 보인다.
그래서 **진짜 공유는 아니지만, 공유처럼 성능 문제가 생긴다**는 의미에서 False Sharing이라고 부른다.

---

## 해결 방법

### 1. 캐시 라인 패딩 추가

서로 다른 스레드가 자주 수정하는 데이터를 같은 캐시 라인에 두지 않도록 간격을 둔다.

```cpp
struct Counter
{    
	alignas(64) 
	std::atomic<int> counterA;    
	alignas(64) 
	std::atomic<int> counterB;
};
```

또는 명시적으로 패딩을 넣기도 한다.

```cpp
struct PaddedCounter{
    std::atomic<int> value;
    char padding[64 - sizeof(std::atomic<int>)];
};
```

---

### 2. 스레드별 로컬 데이터 사용

공유 카운터를 계속 수정하지 않고, 스레드별로 따로 계산한 뒤 마지막에 합치는 방식도 사용할 수 있다.

```
Thread A: localCountA 증가
Thread B: localCountB 증가
마지막에 total = localCountA + localCountB
```

이 방식은 불필요한 캐시 충돌을 줄일 수 있다.

---

## 선택지 해설

### A. 서로 다른 스레드가 같은 캐시 라인에 있는 다른 데이터를 수정해 성능 저하가 발생하는 현상이다.

맞다.

False Sharing의 정확한 설명이다.

---

### B. 포인터가 nullptr을 가리키는 현상이다.

틀렸다.

이것은 널 포인터 관련 문제이다.  
False Sharing과 관련 없다.

---

### C. 두 프로세스가 같은 가상 주소를 사용하는 현상이다.

틀렸다.

서로 다른 프로세스는 같은 가상 주소 값을 사용할 수 있다.  
하지만 각 프로세스의 가상 주소 공간은 독립적이므로 실제 물리 메모리는 다를 수 있다.

False Sharing은 주로 **CPU 캐시 라인과 멀티스레드 성능**에 관한 문제이다.

---

### D. 함수 이름이 같은 현상이다.

틀렸다.

함수 이름 중복은 오버로딩, 링킹 오류, 네임스페이스 문제 등과 관련될 수 있지만 False Sharing과는 무관하다.

---

# 20. Little Endian

## 문제

**20번. Little Endian에 대한 설명으로 옳은 것은?**

A. 낮은 주소에 데이터의 하위 바이트가 저장된다.  
B. 낮은 주소에 데이터의 상위 바이트가 저장된다.  
C. 바이트 순서가 항상 랜덤하게 정해진다.  
D. 문자열에서만 사용되는 개념이다.

정답: **A. 낮은 주소에 데이터의 하위 바이트가 저장된다.**

---

## Endian이란?

Endian은 여러 바이트로 이루어진 데이터를 메모리에 저장할 때, **바이트를 어떤 순서로 배치할 것인가**를 의미한다.

예를 들어 `int` 값은 보통 4바이트이다.

```
int value = 0x12345678;
```

이 값은 1바이트씩 나누면 다음과 같다.

```
0x12  0x34  0x56  0x78
```

여기서 `0x12`는 상위 바이트이고, `0x78`은 하위 바이트이다.

---

## Little Endian

Little Endian은 **낮은 주소에 하위 바이트를 먼저 저장하는 방식**이다.

```
value = 0x12345678
```

메모리에 저장되면 다음과 같다.

|주소|저장 값|
|---|---|
|낮은 주소|0x78|
|+1|0x56|
|+2|0x34|
|높은 주소|0x12|

즉, 사람이 숫자를 읽는 순서와 메모리에 저장되는 순서가 반대로 보일 수 있다.

```
값 자체:       0x12 34 56 78
메모리 순서:   0x78 56 34 12
```

---

## Big Endian

반대로 Big Endian은 **낮은 주소에 상위 바이트를 먼저 저장하는 방식**이다.

```
value = 0x12345678
```

|주소|저장 값|
|---|---|
|낮은 주소|0x12|
|+1|0x34|
|+2|0x56|
|높은 주소|0x78|

즉, 사람이 숫자를 읽는 순서와 메모리 저장 순서가 같다.

---

## 하위 바이트와 상위 바이트

`0x12345678`에서 각 바이트의 의미를 보면 다음과 같다.

```
0x12 34 56 78
```

|바이트|의미|
|---|---|
|0x12|상위 바이트|
|0x78|하위 바이트|

하위 바이트는 숫자의 낮은 자리 쪽이다.

10진수로 비유하면 다음과 비슷하다.

```
1234에서 4가 낮은 자리1234에서 1이 높은 자리
```

16진수 `0x12345678`에서는 `0x78`이 가장 낮은 자리 쪽 바이트이다.

---

## C++에서 확인하는 예시

```cpp
#include <iostream>
using namespace std;

int main(){
    int value = 0x12345678;
    unsigned char* bytePointer = reinterpret_cast<unsigned char*>(&value);   
     
    for (int index = 0; index < sizeof(value); ++index)    
    {        
	    cout << hex << static_cast<int>(bytePointer[index]) << '\n';    
    }    
    return 0;
}
```

Little Endian 환경이라면 대략 다음 순서로 출력된다.

```
78563412
```

낮은 주소부터 읽었을 때 하위 바이트가 먼저 나오기 때문이다.

---

## 왜 중요할까?

Endian은 다음 상황에서 중요하다.

```
네트워크 통신
파일 바이너리 저장
패킷 파싱
엔진 리소스 바이너리 포맷
서로 다른 플랫폼 간 데이터 교환
```

예를 들어 한 시스템은 Little Endian으로 저장했는데, 다른 시스템은 Big Endian으로 해석하면 값이 완전히 달라질 수 있다.

```
저장한 값: 0x12345678
잘못 해석한 값: 0x78563412
```

그래서 바이너리 파일이나 네트워크 패킷을 다룰 때는 바이트 순서를 명확히 정해야 한다.

---

## 선택지 해설

### A. 낮은 주소에 데이터의 하위 바이트가 저장된다.

맞다.

Little Endian의 정의이다.

---

### B. 낮은 주소에 데이터의 상위 바이트가 저장된다.

틀렸다.

이것은 Big Endian에 해당한다.

---

### C. 바이트 순서가 항상 랜덤하게 정해진다.

틀렸다.

Endian은 CPU 아키텍처나 데이터 포맷 규칙에 따라 정해지는 바이트 순서이다.  
랜덤하지 않다.

---

### D. 문자열에서만 사용되는 개념이다.

틀렸다.

Endian은 문자열 전용 개념이 아니다.  
주로 정수, 실수, 구조체, 바이너리 데이터, 네트워크 패킷 등 여러 바이트로 표현되는 데이터에서 중요하다.
