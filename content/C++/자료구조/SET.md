#자료구조 
#연관컨테이너
#set

set은 정렬되어 있음 (unordered_Set이 아니니까.)

set은 순서대로 무언가를 저장하고 번호를 매겨서 관리하고 있던 시퀀스 컨테이너와 달리
그저 '집합'의 형태로 하나의 공간에 마구잡이로 넣어두는 것이라고 보는 것이 더 맞다.

그렇기에 원소를 추가하거나 지우는 작업은 $O(logN)$
iterator역시 BidirectionalIterator 이고, 임의의 위치로 접근하는 것을 불가. 
하나씩 순서대로 찾아가야 한다.

다만, 입력의 순서가 어떻게 되었든 (`mySet.insert(10); mySet.insert(1);`)
출력은 정렬의 순서대로 나온다. (`1 , 10`)

set컨테이너는 해당 원소의 **존재 여부**를 확인할 때 많이 사용된다.

```
set<int> mySet;
//원소가 있다고 가정.

auto iter = mySet.find(20);
if(iter != s.end()) { cout<<"있음";}
else { cout<<"없음";}
```

원소의 접근 또한 $O(logN)$
이유는 정렬된 상태이기에 
내가 1~100 사이에서 40을 찾을 때, 
1. 50이상은 날리고, 
2. 25이하는 날리고 
3. 38 이하는 날리고,
와 같이 이진 트리 형태로 탐색을 하기 때문. 

다만 이런 경우에는 균형잡힌 트리의 형태를 유지해야 한다.
(일직선 형태의 트리는 시퀀스와 다를게 없기 때문)

**또한 셋은 중복을 무시한다!**(멀티셋을 사용하면 중복 가능.)

---
**만약 셋 안에 클래스 객체를 넣고 싶다면?**

예를 들어
```cpp
class ToDo{
	int priority;
	string job_desc;
public:
	ToDo(int priority, string job_desc)
	: priority(priority), job_desc(job_desc){}
}
```
과 같은 객체를 안에 넣어주고 싶다고 해보자,
그렇다면 set은 정렬을 지원하기 때문에 **각자의 비교**를 객체 내에서 할 수 있도록 지원해주어야 하는데 이것이 바로 '<'연산자이다.

즉,
```cpp
bool operator < (const ToDo& t) const{
	if(priority == t.priority){
		return job_desc < t.job_desc;
	}
	return priority > t.priority;
}
```
(셋에서 <연산자는 상수반복자를 호출하기 때문에 상수함수만 호출이 가능함.)

```cpp
if(priority == t.priority){
		return job_desc < t.job_desc;
	}
```
를 만들었던 이유는 셋은 중복을 허용하지 않기 때문에 a<b 도 false a>b도 false로 나오면 중복이라고 판단, 저장하지 않는다.

만약, 라이브러리 혹은 외부 객체를 사용하게 되어 내가 직접 '<' 연산자를 만들어주지 못할 때!
#functor 를 사용하도록 하자.

``` cpp
class ToDo{
	int priority;
	string job_desc;
public:
	ToDo(int priority, string job_desc)
	: priority(priority), job_desc(job_desc){}
	
	friend struct ToDoCompare
}

struct ToDoCompare{
	bool operator()(const ToDo& a,const ToDo& b){
		if(a.priority == b.priority){
			return a.job_desc < b.job_desc;
		}
		return a.priority > b.priority;
	}
}
```

이렇게 구성을 한 후에,
`set<ToDo, ToDoCompare> todos`와 같이 두번쨰 인자로 넘겨주게 되면 알아서 비교를 수행하게 될 것이다.
