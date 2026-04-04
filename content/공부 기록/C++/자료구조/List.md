#자료구조
#시퀀스컨테이너
#List
리스트는 양방향(혹은 단방향) 연결 구조체다.
`노드` <->`노드` <->`노드` 와 같은 형태.

```cpp
#include <list>

list<int> intlist;

intlist.push_back(19);
intlist.pop_back();

intlist.push_front(19);
intlist.pop_front();

for(list<int>::iterator iter; iter != intlist.end(); ++iter){
	*iter; //로 순회
}
```



그렇기에 vector처럼 임의 접근이 불가능하다.
리스트는 시작 노드와 마지막 노드만을 기억하기 때문에 특정 노드에 접근하기 위해서는 링크들을 하나하나 따라가야 하는 단점이 있다.

그럼에도 벡터는 할당된 메모리 공간을 넘어가게 되면 바로 O(n)의 시간복잡도가 발생했지만, 리스트는 그렇 필요 없이 추가/삭제가 O(1)로 매우 빠르게 진행된다.

```
list<int> lst;
list<int>::iterator iter;
```
리스트 iterator의 경우에는 `--` 나 `++` 과 같은 연산은 가능하지만(후위 전위 상관 X)
`iter +5`와 같은 연산은 불가능하다.
%%
벡터는 연속적인 공간에 메모리가 할당되었기 때문에 가능하지만 list는 그렇지 않기 때문
%%

리스트는 iterator의 타입이`BidirectionalIterator`임. (양방향이터레이터)
%%벡터는 `RandomAccessIterator`%%
[[범위기반 for문]] 가능

---

#forward_list
`#include<forward_list>`

정방향 리스트 (단방향 리스트)
-> ++로 밖에 이동을 못하는 거임.

원소 추가할 때 `push_back` 불가능. 
오로지 `push_front`만 가능함

인접한 중복 요소를 제거하는 함수
```
intlist.unique(10);
```
인접한 것 중(++ / --) remove와의 차이점은 1개는 남겨둔다는 것임(인접하지 않으면 제거되지 않음)

-> 포워드리스트는 리스트보다 링크가 하나 적기 때문에 용량이 상대적으로 작다.
-> 앞 부분의 삽입 삭제의 경우 리스트보다 빠르다.

----

멤버함수로 sort가 존재함 (디폴트 오름차 순/ 조건자 삽입 가능)
```
intlist.sort(greater<int>());
```

원소들의 순서를 역순으로 바꾸는 함수.
```
intlist.reverse();
```

값이 일치하는 원소를 "모두" 삭제하는 함수
```
intlist.remove(1);
intlist.remove_if(조건자); // 조건자에 해당하는 원소를 삭제하는 함수
```

특정 리스트를 오려넣기 하는 함수.
```
intlist.splice(이터레이터, 삽입할리스트);
```
(`intlist`의 iterator 위치에, 2번째 매개인자에 오려넣기 하는 함수임. 원본은 삭제되는 것. )
