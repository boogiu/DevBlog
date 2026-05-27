
물리 기반 렌더링. 빛의 실제 물리 법칙을 시뮬레이션해서 어떠한 조명 환경에서도 일관되고 사실적인 결과를 만드는 렌더링 방식.

---

## 빛은 에너지고, 에너지는 보존된다

빛이 표면에 닿으면 반드시 이 원칙이 성립한다.

<p style="background-color:#ffd70033; padding:12px; border-left:4px solid #f0b429;"> 입사 에너지 = 반사 에너지 + 흡수 에너지 </p>

기존 퐁(Phong) 방식은 이 원칙을 지키지 않는다. shininess 값에 따라 입사된 것보다 많은 에너지가 반사될 수 있고, 조명이 바뀔 때마다 결과가 달라져 재튜닝이 필요하다. PBR은 이 등식을 항상 지키기 때문에 어떤 조명 환경에서도 일관된 결과가 나온다.

---

## 퐁에서 PBR로

{% toggle "퐁(Phong) 복습" %}

$I = kd(N·L) + ks(V·R)^n$

`N·L` 은 법선과 광원 방향의 내적으로, 빛이 표면에 얼마나 정면으로 닿는지를 나타낸다. 수직으로 오면 1, 비스듬하면 0에 가까워진다. 이게 Diffuse 항이다.

`(V·R)^n` 은 시선 벡터 V와 반사 벡터 R의 내적을 shininess `n` 만큼 거듭제곱한 것이다. 눈이 반사 방향과 딱 일치할수록 하이라이트가 강해진다. n이 클수록 하이라이트가 작고 날카로워진다. 이게 Specular 항이다.

![[Pasted image 20260527201506.png]]

내가 사용했던 코드
```cpp
// Diffuse
float3 L = normalize(-g_vLightDir.xyz);  // 픽셀 → 광원
float ndl = saturate(dot(N, L));
float lambert = lerp(0.3f, 1.0f, ndl);
float3 diffuse = g_vLightDiffuse.rgb * lambert;

// Specular — 퐁 방식 (반사 벡터 R 직접 계산)
float3 V = normalize(vCamPosition.xyz - vWorldPos.xyz);  // 픽셀 → 카메라
float3 R = reflect(-L, N);                               // 반사 벡터
float spec = pow(saturate(dot(V, R)), 25.0f);            // n = 25
float3 specular = g_vLightSpecular.rgb * g_vMtrlSpecular.rgb * spec;
```

블린-퐁(Blinn-Phong)은 R 대신 `H = normalize(L+V)` 를 써서 `(N·H)^n` 으로 계산한다. 결과는 비슷하지만 계산이 더 가볍다. 두 방식 모두 에너지 보존은 위반할 수 있다.

{% endtoggle %}

퐁 쉐이딩을 사용하다가 PBR에 대한 욕구를 느끼게 된 것은 퐁의 한계 때문이다. 퐁으로 작업을 하다보면 무엇을 표현하려고 해도 웬만하면 고무나 찰흙으로 만든 느낌이 났다.

![[스크린샷 2026-05-08 192712.png]]

동물의 숲이나보니 티가 잘 나지는 않지만, 선글라스나, 바다 등이 원하는 대로 잘 표현이 안되었다. (동숲 텍스처가 표준좌표계 기준 노말맵이 아닌 것도 있는 것 같다.) 

기존 퐁 쉐이딩은 재질과 관계 없이, 정해진 공식을 통해 반사광과 하이라이트가 더해지다보니 재질에 대한 표현이 어려웠다. PBR을 통한다면 비금속/금속에 대한 표현이 가능해지니, 한번 알아보고자 한다.

---

## 현실의 재질

비금속과 금속

## Fresnel 효과

## 미세면 이론

## BRDF