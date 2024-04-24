# mini_react

# 节点类型
* 原生节点
* 组件节点: 函数、类
* 文本节点
* 空节点
* 数组节点

# 自定义jsx
tsconfig.json 中
```
tsconfig.json
  "jsx": "react",
  "jsxFactory": "myJsx",  
TSX file:
  import { myJsx } from "@/react";
  const HelloWorld = () => <div>Hello</div>; 
```

# 位运算 权限判断
* 加 A 加上标记 B  
A |= B
* 判断有 A 中是否有 B
A & B === B
* 删 A 中删除 B 标记
A &= ~B