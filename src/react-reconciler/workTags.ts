export type WorkTag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText

export const FunctionComponent = 0
// 生成的中间空节点， 根fiber节点, 全局只有一个
export const HostRoot = 3

// 原生节点 div span等
export const HostComponent = 5

// 文本
export const HostText = 6
