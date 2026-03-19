#자료구조
#시퀀스컨테이너
#vector

 
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

