#보편참조

## 정의

C++11에서 도입된 개념으로, `T&&` 형태로 선언된 타입 매개변수가 **lvalue 또는 rvalue 둘 다를 바인딩할 수 있는** 참조를 말한다. Scott Meyers가 명명했으며, C++17 표준에서는 **Forwarding Reference(전달 참조)** 라는 공식 명칭으로 정립되었다.

일반적인 rvalue 참조(`int&&`)와 형태는 동일하지만, **타입 추론이 수반될 때에만** Universal Reference로 동작한다.

---

## 일반 rvalue 참조와의 차이

|구분|선언 형태|타입 추론 여부|바인딩 가능 대상|
|---|---|---|---|
|rvalue 참조|`int&&`|없음|rvalue 만|
|Universal Reference|`T&&`|있음 (템플릿 또는 auto)|lvalue, rvalue 모두|

Universal Reference가 되려면 두 조건을 동시에 만족해야 한다.

1. `T&&` 형태 (cv 한정자 없이 정확히 `&&`)
2. `T`가 타입 추론 대상일 것 (함수 템플릿 매개변수 또는 `auto`)

```cpp
template<typename T>
void f(T&& param);   // Universal Reference: T가 추론됨

template<typename T>
void g(const T&& param);  // rvalue 참조: const가 붙으면 Universal Reference 아님

template<typename T>
class Widget {
    void h(T&& param);   // rvalue 참조: T는 클래스 인스턴스화 시 이미 확정됨
};
```

---

## 참조 축약 (Reference Collapsing)

Universal Reference가 동작하는 핵심 메커니즘이다. C++에서는 원칙적으로 참조의 참조(`T& &`)가 존재할 수 없지만, 템플릿 인스턴스화 과정에서 내부적으로 발생한다. 컴파일러는 이를 다음 규칙으로 하나의 참조로 축약한다.

### 축약 규칙

|내부 조합|결과|
|---|---|
|`T& &`|`T&`|
|`T& &&`|`T&`|
|`T&& &`|`T&`|
|`T&& &&`|`T&&`|

**규칙 요약:** `&&`끼리 만날 때만 `&&`가 유지되고, 나머지는 모두 `&`로 축약된다.

### 타입 추론과 축약 연계

`T&&`에 lvalue가 전달되면 `T`는 `T&`로 추론되고, 참조 축약이 적용된다.

```cpp
template<typename T>
void f(T&& param);

int x = 10;
f(x);          // lvalue 전달 -> T = int& 추론 -> int& && -> int& (lvalue 참조)
f(10);         // rvalue 전달 -> T = int  추론 -> int&&    -> int&&  (rvalue 참조)
f(std::move(x)); // rvalue 전달 -> T = int 추론 -> int&&
```

---

## 활용 예시

### 1. std::forward를 이용한 완벽한 전달 (Perfect Forwarding)

Universal Reference의 핵심 용도다. 함수가 받은 인자의 값 카테고리(lvalue/rvalue)를 그대로 보존하여 다른 함수에 전달한다.

```cpp
template<typename T>
void wrapper(T&& arg) {
    target(std::forward<T>(arg));
    // arg가 lvalue였으면 lvalue로, rvalue였으면 rvalue로 전달
}
```

`std::forward<T>(arg)`는 내부적으로 참조 축약을 활용하여 원래 값 카테고리를 복원한다.

### 2. 팩토리 함수

```cpp
template<typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

// 호출 예
auto w1 = make<Widget>(lvalArg);       // lvalue 그대로 전달
auto w2 = make<Widget>(std::move(rv)); // rvalue 그대로 전달
```

### 3. auto&& (범용 참조)

`auto&&`도 타입 추론을 수반하므로 Universal Reference로 동작한다. 범위 기반 for문에서 원소의 값 카테고리를 보존할 때 유용하다.

```cpp
auto&& val = someFunction();  // 반환값이 lvalue든 rvalue든 바인딩 가능

for (auto&& elem : container) {
    process(std::forward<decltype(elem)>(elem));
}
```

### 4. 오버로딩 대신 Universal Reference 사용

```cpp
// 기존 방식: lvalue / rvalue 별도 오버로딩
void log(const std::string& msg);
void log(std::string&& msg);

// Universal Reference 방식: 하나로 통합
template<typename T>
void log(T&& msg) {
    storage.push_back(std::forward<T>(msg));
}
```

---

## std::forward 구현 원리

`std::forward`는 참조 축약과 조건부 캐스팅으로 구현된다.

```cpp
template<typename T>
T&& forward(std::remove_reference_t<T>& param) noexcept {
    return static_cast<T&&>(param);
}
```

- `T`가 `int&` 이면 반환 타입 `T&&` -> 참조 축약 -> `int&` (lvalue 유지)
- `T`가 `int` 이면 반환 타입 `T&&` -> `int&&` (rvalue 복원)

---

## 주의 사항

- Universal Reference를 받는 함수를 오버로딩하면 거의 항상 Universal Reference 버전이 우선 선택되어 의도치 않은 동작이 발생할 수 있다.
- `const T&&`는 Universal Reference가 아니라 rvalue 참조다.
- 클래스 템플릿 멤버 함수의 `T&&`는 클래스 인스턴스화 시 `T`가 이미 확정되므로 Universal Reference가 아니다.
- Universal Reference로 받은 값을 두 번 이상 `std::forward`하면 안 된다. move 후 접근이 될 수 있다.

---
#이동생성자 #perfect_forwarding #move_sementic 