#자료구조 
#연관컨테이너 
#map

 - [I] map의 특성
	 1.  레드-블랙 트리 기반으로 구성된 컨테이너. (노드 기반 트리 구조)
	 2.  각 원소들이 Key와 Value로 한쌍을 이루고 있다.
	 3.  각 원소들을 삽입 key값에 따라 자동 정렬이 된다. (삽입 / 삭제가 불리함)
	 4.  반복자를 통한 탐색이 가능함
	 5.  탐색에 있어 시간 복잡도가 $logN$ 임
	 6.  대괄호 연산자가 오버로딩 되어 있음, `[key]`로 사용
	 7. 중복 Key값은 허용하지 않음(Value는 가능)

 - [I] multi_map의 특성
	1. map 과 동일하지만, 임의 접근이 불가능함.
	2. 중복 Key값을 허용함

 - [I] set의 특성
	1.  하나의 Key만 가지고 있음.
	2. 삽입 시에 Key값 기준으로 정렬이 일어남.
	3. 중복 Key값은 허용하지 않음.

맵은 셋과 비슷한 자료 구조이다.
다만 맵은 key와 value를 함께 저장하는 형태의 컨테이너.

```cpp
map<string,double> list;
list.insert(pair<string,double>("이름",0.4));
list["이름2"] = 0.2; //insert와 동일
```

맵은 pair객체를 전달받는다.
```cpp
template<typename T1, typename T2>
struct pair{
	T1 first;
	T2 second;
}
```


원래라면은 pair객체는 사용할 떄마다 `list.insert(pair<string,double>("이름",0.4))`와 같이 초기화를 해주어야 하는데 `make_pair`를 이용하여
`list.insert(make_pair("이름",0.4))`와 같이 인자를 삽입할 수 있다.

`list["이름2"] = 0.2;` 같은 경우에는 해당 키가 없다면, 삽입. 있다면, 대체하게 된다.

#range_for 또한 당연히 가능 (대신 pair가 들어가야겠지)
```cpp
for(const auto& m : list) //이때 auto는 pair가 됨.
```

`list["이름"]` 과 같이 `[]` 연산자를 통해서 접근을 할 수 있지만 
*만약 키가 없는데 `[]` 를 이용하면 0이 리턴된다*
그래서 find로 먼저 있는지 찾아보고, 활용하는 것이 최고.

#set 과 비슷하게 find()함수는 해당 키가 있다면 그 iterator를 반환하고, 없다면 end()를 반환한다. 또한 중복을 허락하지 않기 때문에 같은 키값의 insert가 들어오면 무시하게 된다.
(멀티맵으로 해결이 가능)

---
**MultiMap**

`map<int,string> m`이 아닌, `multimap<int,string>`으로 선언하면 중복을 허락하게 됨.
다만 이 경우에는 `[]` 연산자를 사용할 수 없다. find를 사용하는 경우에는 **중복된 것 중 무엇이 나올지 모른다.**

그렇기에 무언가 중복된 값을 가져오고 싶다면
```cpp
auto range = m.equal_range();
for(auto iter = range.first; iter != range.second; ++iter){
	cout<< iter->first;
	cout << iter->second; 
}
```
형태로 사용해야 한다. 
즉 `equal_range`는 pair의 형태로 중복 원소의 begin 반복자와 end반복자를 집어넣어 리턴한다. {중복 시작, 중복 끝} 형태로 진행되기에 그 pair를 가지고 반복문을 순회하는 것.

---

**unordered map**
#unordered_map

정렬되지 않은 맵. 
원소들이 들어갈 때 정렬되지 않고, 반복자로 호출될 때에도 랜덤한 순서되로 나오게 된다.
다만 이것을 사용하는 이유는
insert / erase / find 모두 $O(1)$의 시간복잡도로 작동이 된다는 것!
(그냥 map/set의 경우에는 $O(logn)$의 시간 복잡도)

여기서 나오는 개념이 #해시함수
<span style="color:rgb(216, 214, 146)">해시함수란, 임의의 크기의 데이터를 고정된 크기의 데이터로 대응시켜주는 함수.</span>
즉, 새로운 원소가 insert될 때 해시함수가 어떤 공간에 저장할 지 결정을 해주는 것이다. 
그렇기에 find할 때에도 너무 쉽게 그 위치를 알 수 있는 것 
(같은 원소를 넣으면 같은 공간이 나오게 되니까)

해시함수는 해시값 계산을 상수 시간 안에 처리하기 때문에 unordered가 상수시간에 움직이게 되는 것이다.

다만 간혹 다른 원소임에도 같은 해시값을 가지게 되는 경우가 발생하게 될 수 있는데 이를 해시충돌이라고 한다. 

> 그렇기에 미리 해당 공간에 있는 원소가 동일한지 확인을 해보기도 하는데, 
> 이렇게 되면 <span style="color:rgb(222, 104, 99)">최악의 경우</span>  $O(n)$ <span style="color:rgb(222, 104, 99)">의 시간 복잡도</span>가 발생하기도 함

> [!tip]  내가 만든 클래스가 unordered map에 들어가려면?

조금 어렵다. unordered는 앞서 말한 것 처럼 해시함수를 거치기 때문에 
<span style="color:rgb(222, 104, 99)">내 클래스에도 해시를 만들어줘야 한다.</span> 
<span style="color:rgb(92, 92, 92)">(==연산자도 만들어줘야 함. 위에 말한 해시충돌 때문에)</span>

`unordered_set/map`은 기본 해시 함수 객체를 제공하기 때문에 이를 활용하다.

`hash<string> hash_fn` -> 자료형을 정하고 객체를 생성 : 이것도 #functor 다
`size_t hash_val = hash_fn("무언가");`

```cpp
namespace std{
	temeplate<>
	struct hash<myClass>{
		size_t operator()(const myClass& t) const{
			//hash
			hash<string> hash_func;
			return  hash_func(t.name);
		}
	}
}
```

여기서 namespace를 한번 감싸주어야 한다. 
위에 `using namespace std;`를 했다고 하더라도!
>잊지 말고 == operator도 만들어주기

