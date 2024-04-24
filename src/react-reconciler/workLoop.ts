import { beginWork } from './beginWork'
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags'

let workInProgress: FiberNode | null = null

function prepareFreshStack(root: FiberRootNode): void {
  workInProgress = createWorkInProgress(root.current, {})
}
// 找到最顶层的root
function markUpdateFromFiberToRoot(fiber: FiberNode): FiberRootNode | null {
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

// fiber 是 wip
function performUnitOfWork(fiber: FiberNode): void {
  // 递
  const next = beginWork(fiber)
  fiber.memoizesProps = fiber.pendingProps

  if (next === null) {
    // 归
    completeUnitOfWork(fiber)
  } else {
    workInProgress = next
  }
}

function workLoop(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
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
