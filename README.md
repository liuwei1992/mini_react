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
