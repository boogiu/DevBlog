
`class` 와 `static` **1**

```
class Cobj{
public :
	Cobj();
	
private : 
	int m_iA;
	static int m_iB; //이대로 하게 되면 (컴파일 에러) -> 참조할 수 없는 외부 변수
}
```
클래스 안에 생긴 static은 **멤버 변수**가 아니다. 
클래스 안에 생긴 static은 **클래스 변수**다.

멤버 변수는 객체가 소유하는 변수.
클래스 변수는 접근권한을 namespace (여기선 CLASS)에만 할당된 변수.

외부 기호이기에, 클래스 외부에서 초기화 해주는 것.
```
int CObj:: m_iB = 100; //class 바깥에서
```

static은 객체를 생성하지 않고도 접근할 수 있다.
```
CObj::m_iA = 200; 
```

static은 메모리를 공유할 수 있다는 장점이 있따.
같은 타입의 다른 객체가 값을 공유할 수 있다.

`class` 와 `static` **2**

```
class Cobj{
public :
	Cobj();
	
private : 
	static void Draw();
}
```
멤버 함수가 아닌 클래스 함수.
클래스 함수는 멤버 변수 읽기 쓰기가 불가하다. - 클래스 변수 제외
(객체 생성을 하지 않고도 호출이 가능하기 때문에)

보통 스태틱 함수는, 다른 객체와 객체를 이어줄 때 사용하는 경우가 많다.
(예를 들어 충돌처리)

여기서 싱글톤이 파생될 수 있다.
```
class singleton{
private:
	singleton();
	~singleton();
public: 
	static singleton GetInstance(){
		static singleton* A;
		if(A == nullptr){
			singleton= new Singleton; //객체가 생성이 되어 있지 않다면;
		}
		return A; //객체가 생성되어 있다면
	}
}
```

싱글톤의 경우 static으로 데이터 영역에 메모리가 할당되기 때문에 new 를 통해서 힙에 할당시키는 것은 잘못된 문법.
또한, 위 코드에서 반환 타입을 확인할 것
또한, static은 굳이 if문으로 돌 필요가 없다.
또한 복사 생성자/대입 연산자도 private 혹은 =delete로 숨겨(삭제)야함.

**static은 한번만 초기화된다!**
