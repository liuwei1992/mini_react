import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'

let workInProgress: FiberNode | null = null

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {})
}
// 找到最顶层的root
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber
  let parent = node.return

  while (parent != null) {
    node = parent
    parent = node.return
  }

  if (node.tag === HostRoot) {
    return node.stateNode
  }

  return null
}

function renderRoot(root: FiberRootNode) {
  // 初始化 wip
  prepareFreshStack(root)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      workInProgress = null
    }
  } while (true)

  root.finishedWork = root.current.alternate

  commitRoot(root)
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  const root = markUpdateFromFiberToRoot(fiber)

  renderRoot(root)
}
