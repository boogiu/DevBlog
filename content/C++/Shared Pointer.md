
#shared_ptr
<h3>SHARED_PTR</h3>
유니크 포인터의 개념이 한 객체가 유일하게 소유권을 가지는 것이라면 shared_ptr은 여러명이 그 포인터를 가질 수 있지만! 그 포인터를 가진 사람을 체크하고 있는 것이라고 볼 수 있다.

만약 메모리를 할당하고 해제하게 된다면 
**유니크 포인터라면** : 어차피<span style="color:rgb(222, 104, 99)"> 나만 가지고 있으니</span>, 걱정 없이 해제하고
**셰어드 포인터라면** : 소유권을 지닌<span style="color:rgb(222, 104, 99)"> 마지막 한 사람일 때까지</span> 해제하지 않다가 해제하게 된다.

사용법은 유니크 포인터와 비슷하다.
`std::shared_ptr<myClass> sPtr1 = new MyClass;`

셰어드 포인터는 복사 생성자를 지원한다. 
`std::shared_ptr<myClass> sPtr2 (sPtr1);` 

<span style="color:rgb(187, 226, 187)">make_shared의 활용</span>
`std::shared_ptr<myClass> sPtr1(new MyClass);` 와 같은 방식의 생성은 비효율적이다.
1) 객체 자체의 메모리 할당
2) shared_ptr 자체의 메모리 할당
두 번의 메모리 할당이 연달아 일어나기 때문이다. 

그래서 차라리 `std::shared_ptr<myClass> sPtr1 = std::make_shared<myClass>();`
와 같이 make_shared 함수를 활용하는 것이 더 권장되는 방법이다. 
(이 함수는 <span style="color:rgb(222, 104, 99)">한번에 두개의 크기만큼을 동적할당</span>하게 된다.)

✨잠깐 주의 사항✨
```cpp
myClass a;
std::shared_ptr<myClass> ptr1(a);
std::shared_ptr<myClass> ptr2(a);
```

위와 같이 동일한 객체에 대해 2개의 shared_ptr을 나눠받는 것은 위험하다.
이유는 각자의 shared_ptr이 서로 다른 제어블록을 참조하고 있기 때문에 각자 1개의 객체만이 참조하고 있다고 판단, 메모리를 반환할 수 있기 때문이다.

이런 경우가 언제 발생하냐면, 객체가 스스로의 shared_ptr을 return하게 될 떄 발생할 수 있다.
아래 예시를 확인해보자
```cpp
class A{
public : 
	A(){
		m_data = new int[100];
	}
	~A(){
		delete[] m_data;
	}
	std::shared_ptr<A> GetSpt(){
		return shared_ptr<A>this;
	}
private:
	int * m_data;
}
```

이렇게 나의 내부에서 나를 또 반환하는 경우에 위와 같이 이미 만들어진 제어블록이 아닌 새로운 제어블록을 생성해서 관리할 수도 있다.

<span style="color:rgb(187, 226, 187)">enable_shared_from_this 의 상속</span>
```cpp
class A : public std::enable_shared_from_this<A>
{
public : 
	A(){
		m_data = new int[100];
	}
	~A(){
		delete[] m_data;
	}
	std::shared_ptr<A> GetSpt(){
		return shared_ptr<A>this;
	}
private:
	int * m_data;
}
```

위와 같이 해당 클래스를 상속 받게 되면, shared_from_this 라는 멤버 함수도 함께 상속받고, 이 때에는 이미 정의된 제어블록을 반환하기 때문에 다른 제어블록이 생성되지 않는다.

✨또다른 주의 사항✨
<span style="color:rgb(222, 104, 99)">shared_ptr의 순환 참조</span>

만약 객체 1이 객체 2를 가리키는 shared_ptr 2 를 가지고
만약 객체 2가 객체 1을 가리키는 shared_ptr 1 을 가지고 있다면

객체 1을 지우기 위해서는 객체 2를 파괴하여 shared_ptr 1을 지워야 하는데, 객체 2는 파괴되려면 객체 1을 파괴하여 shared_ptr 2를 지워야 한다.

이러한 순환 관계가 되어 파괴가 되지 않을 수도 있다.

이러한 사항을 해결하기 위해 생겨난 것이 

#weak_ptr
<span style="color:rgb(187, 226, 187)"><b>weak_ptr의 등장</b></span> 

weak_ptr은 shared_ptr처럼 객체를 안전하게 참조할 수 있지만, 참조하고 있는 객체의 개수에 포함하지 않는다. 즉, 위의 상황 중에서 하나를 weak_ptr로 받고 있다면 가리키고 있는 개수로 포함하지 않기에 원활하게 삭제할 수 있는 것이다. 

그렇기에 **weak_ptr은 이 자체로 객체를 참조할 수 없으며 반드시 shared_ptr로 변환하여 사용해야 한다.**(혹은 다른 weak_ptr)
