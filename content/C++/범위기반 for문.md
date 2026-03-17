범위기반 for문 #range_for

```cpp
vector<int> vec; //안에 원소가 있다고 가정

for(int element : vec){
	cout << element;
}
```

위와 같이 int i=0과 같은 형태 없이 순회도 가능하다.

물론 레퍼런스 형태도 가능
```cpp
vector<int> vec; //안에 원소가 있다고 가정

for(int element& : vec){
	cout << element;
}
```


<span style="color:rgb(222, 104, 99)">레퍼런스를 사용하는 이유</span>
```cpp
for(auto i : vecInt){
	i+= 5;
}
```

이런 경우에는<span style="color:rgb(188, 173, 205)"> i가 vecInt의 원소를 "복사"하여 지역적으로 사용</span>하는 것이기 때문에
원본 값에는 영향을 줄 수가 없다.