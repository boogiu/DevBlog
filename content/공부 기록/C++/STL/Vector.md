#자료구조
#시퀀스컨테이너
#vector

벡터 컨테이너의 구체적인 설명으로 접근

`#include<vector>`
`using namespace std;`

`vector<int> vecInt`
실질적으로 단항 템플릿은 아님.
Allocater라는 인자가 있음 -> 알아서 배열을 생성하고 삭제하는 역할.

**✨벡터에 원소를 추가하는 법.**
`vecInt.push_back(10);`
맨 뒤에 원소를 삽입

**✨벡터의 원소를 삭제하는 법.**
`vecInt.pop_back();`
맨뒤에 있는 원소를 제거

**✨벡터의 원소 개수를 확인하는 법**
`vecInt.size();` 
컨테이너 안의 원소 개수를 반환 -> size_t로 반환

**✨벡터의 할당된 메모리를 확인하는 법**
`vecInt.capacity();`
실제 배열에 할당된 메모리의 개수를 반환
- [!] 벡터의 경우 지속적으로 삽입이 잦아질 것 같다면, 넉넉하게 메모리를 할당하게 됨.

**✨벡터의 원소를 모두 지우는 법**
`vecInt.clear();`
배열에 할당된 메모리는 (capacity)는 남아있고, 원소가 지워짐.

**✨벡터 안에 원소가 있는지 확인하는 법**
`vecInt.empty()`
배열 안에 원소의 유무를 반환 -> bool 타입 반환

**✨같은 형식의 컨테이너 원소를 모두 교환하는 법**
`vecInt.swap(vecTmp);`
매개 인자로 받은 벡터와 원소부터 메모리 용량까지 교환함.(size / capacity)

**✨벡터의 용량(capacity) 모두 지우는 법**
1. `vector<int>().swap(vecInt);`
	메모리/사이즈의 할당이 되지 않은 임시 객체와 교환(swap)하여 지움.
2. `vecInt.shrink_to_fit();`
	 같은 동작으로 진행하게 됨.

----

`vector<int> vecInt`

`vecInt.front();` => 맨 앞의 원소에 접근하는 함수(읽기/쓰기)
`vecInt.back();` => 맨 뒤의 원소에 접근하는 함수(읽기/쓰기)
-> 반복자의 값을 반환하게 됨 (`*iterator`)

| vector. | begin() |     |     |     |     |     | end() |
| ------- | ------- | --- | --- | --- | --- | --- | ----- |
|         | 1       | 2   | 3   | 4   | 5   | 6   | -     |

`vector<int>::iterator iter = vecInt.begin()`
`vecInt.begin()` -> 원소를 가리키고 있는 것이 아닌, 배열 안에 접근할 준비가 되어 있다?

✨이터레이터로 값에 접근하는 법
`*iter` -> 포인터 문법과 같지만, 포인터는 아님.

✨이터레이터로 순회해보자!
```
for(vector<int>::iterator iter = vecInt.begin(); iter != vecInt.end(); ++iter){
	cout<<(*iter)<<endl;
}
```
- [>] <span style="color:rgb(92, 92, 92)">모던 C++가면 짧아짐.</span>

**반복자의 종류**
1.  출력 반복자
	` const * `
2.  입력 반복자
	` *, = `
3.  정방향 반복자
	` *, =, ++ `
4.  양방향 반복자 (거의 대부분)
	` *, =, ++, -- `
5.  임의 접근 반복자(벡터)
	` *, =, ++, --, +=, -= `

----

**벡터의 중간 삽입 / 삭제**

! 중간 삽입
```
vector<int>::iterator iter = vecInt.begin();
iter+=3;
vecInt.insert(iter,50);
```
`iter = vecInt.insert(위치, 값);`
- [!] Insert 후에 iterator를 다시 반환 받아야 함.

! 중간 삭제
```
vector<int>::iterator iter = vecInt.begin();
iter+=3;
vecInt.erase(iter);
```
`iter = vecInt.erase(위치);`
- [!] erase 후에 iterator를 다시 반환 받아야 함.

! 잘못된 포문의 사용
```
vector<int>::iterator iter= vec.begin();
for( ; iter != vec.end(); ++iter){
	if(*iter == 4){
		vec.erase(iter);
	}
}
```
- [!] 원소를 추가하거나 지우게 되면 기존에 사용하던 iterator는 사용할 수가 없다. 
그렇기에 `vec.erase(iter` 아래에 `iter = vec.begin()`을 사용하면 해결이 된다.

**그러나**,
이는 조건문에 해당하는 사항을 지우고 나면 다시 begin으로 돌아와서 순회하는 방식이기 떄문에 비효율적이라고 볼 수 있다.
```
for (vector<int>::size_type i=0; i != vec.size(); ++i) { 
	if (vec[i] == 50) {
		vec.erase(vec.begin() + i); 
	}
}
```
<span style="color:rgb(92, 92, 92)">size_type은 vec.size()했을 때 반환되는 size_t와 자료형을 맞춘 것임.</span>
위와 같이` int i` 와 같은 형태로 진행 후, `begin() + i`로 진행해도 좋다.

---
벡터에 있는 메모리와 관련된 멤버함수

벡터의 초기화
```
vector<int> vecInt(10);
```
- [>] 벡터의 카파시티와 사이즈를 10개로 초기화(0으로) 해줌.  

```
vector<int> vecInt(10,3);
```
- [>] 벡터의 카파시티와 사이즈를 10개로 초기화(3으로) 해줌.  

```
vector<int> vecInt.resize(5);
```
- [>] 벡터의 원소의 개수를 5로 줄임 (카파시티는 그대로)

⭐⭐⭐⭐⭐
```
vector<int> vecInt.reserve(10);
```
- [>] 벡터의 카파시티를 10개로 초기화 해줌.  (원소 없이 용량만 10으로 예약된) 


 
**벡터를 템플릿으로**
```cpp
template<typename T>
void PrintVec(vector<T>& vec) {
	for (typename vector<T>::iterator iter = vec.begin(); iter != vec.end(); ++iter) 
	{
		cout << *iter << endl;
	}
}
```
포문 안에 typename을 넣어주면 된다

```
vector<int> vec;
vec.push_back(1);
vec.push_back(2);
vec.push_back(3);
vec.push_back(4);

vec.erase(vec.begin() + 2); // erase 3
vec.insert(vec.begin() + 2, 90); //1,2,90,4
``` 

**잘못된 포문의 사용**
```
vector<int>::iterator iter= vec.begin();
for( ; iter != vec.end(); ++iter){
	if(*iter == 4){
		vec.erase(iter);
	}
}
```
원소를 추가하거나 지우게 되면 기존에 사용하던 iterator는 사용할 수가 없다. 
그렇기에 `vec.erase(iter` 아래에 `iter = vec.begin()`을 사용하면 해결이 된다.

**그러나**,
이는 조건문에 해당하는 사항을 지우고 나면 다시 begin으로 돌아와서 순회하는 방식이기 떄문에 비효율적이라고 볼 수 있다.
```
for (vector<int>::size_type i =0; i != vec.size(); ++i) { 
	if (vec[i] == 50) {
		vec.erase(vec.begin() + i); 
	}
}
```
%%size_type은 vec.size()했을 때 반환되는 size_t와 자료형을 맞춘 것임.%%
위와 같이 int i 와 같은 형태로 진행 후, begin()+i로 진행해도 좋다.

---

`const_iterator`
이것은 const포인터와 마찬가지로 iterator가 가르키는 값을 변경할 수 없는 iterator다.
이 값은 
`vector<int>::const_iterator iter = vec.cbegin()`과 같이 `cbegin()` 혹은 `cend()` 로만 값을 얻을 수 있다.

---
`reverse_iterator` (역반복자)
`vector<int>::reverse_iterator iter = vec.rbegin()`

|        | begin() |     |     |     |     |          | end() |
| ------ | ------- | --- | --- | --- | --- | -------- | ----- |
|        | 1       | 2   | 3   | 4   | 5   | 6        |       |
| rend() |         |     |     |     |     | rbegin() |       |

vector의 인덱스를 담당하는 `size_type`은 `unsigned int`와 비슷하다(실제로는 `size_t`).
그렇기에 역으로 순회하는 과정에서 인덱스가 0이 되었을 때 -1이 진행되면 size_t가 낼 수 있는 가장 큰 수로 변경이 되기 때문에(음수가 안되니까) 오류가 발생.

그렇기에 역으로 순회할 때에는 `reverse_iterator`를 사용하도록 하자

---
`const_reverse_iterator`
`vec.crbegin()` / `vec.crend()`

마찬가지로 const_reverse도 존재.

---

**range base for loop**
[[범위기반 for문]] 가능

