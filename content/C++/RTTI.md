#RTTI

RTTI는 ==런타임 타입 정보(Run-Time Type Information)==를 뜻하며, 프로그램 실행 중에 객체의 자료형을 확인할 수 있도록 하는 메커니즘.

그러니까 동적으로 자료형의 타입을 확인하는 것이라네.

[MS 공식 안내 문서](https://learn.microsoft.com/ko-kr/cpp/cpp/run-time-type-information?view=msvc-170#see-also)
런타임 형식 정보에는 다음 세 가지 기본 C++ 언어 요소가 있다.

- [dynamic_cast](https://learn.microsoft.com/ko-kr/cpp/cpp/dynamic-cast-operator?view=msvc-170) 연산자입니다.
    다형 형식을 변환하는 데 사용됩니다.
    
- [typeid](https://learn.microsoft.com/ko-kr/cpp/cpp/typeid-operator?view=msvc-170) 연산자입니다.
    개체의 정확한 형식을 식별하는 데 사용됩니다.
    
- type_info [클래스입니다](https://learn.microsoft.com/ko-kr/cpp/cpp/type-info-class?view=msvc-170).
    연산자가 반환한 형식 정보를 보관하는 **`typeid`** 데 사용됩니다.
