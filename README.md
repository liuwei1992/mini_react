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

# performUnitOfWork （while） 递与归
## 递(beginWork) 阶段
* 创建子元素fiber
* 打 flags 标记
* 创建 child、return 关系

## 归(completeUnitOfWork) do-while 阶段
* 创建真实dom节点
* 处理subtreeFlags
* 建立dom节点的关系，把子节点插入到父节点