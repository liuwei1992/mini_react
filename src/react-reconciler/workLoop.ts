import { beginWork } from './beginWork'
import { commitMutationEffects } from './commitWork'
import { completeWork } from './completeWork'
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import { MutationMask, NoFlags } from './fiberFlags'
import {
  getHighestPriorityLane,
  Lane,
  mergeLane,
  NoLane,
  SyncLane
} from './fiberLanes'
import { flushSyncCallbacks, scheduleSyncCallback } from './syncTaskQueue'
import { HostRoot } from './workTags'

let workInProgress: FiberNode | null = null
let wipRootRenderLane: Lane = NoLane
let RootDoesHasPassiveEffects = false

/** 处理 worlinprogress 等全局指针 */
function prepareFreshStack(root: FiberRootNode, lane: Lane): void {
  workInProgress = createWorkInProgress(root.current, {})
  wipRootRenderLane = lane
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

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber

  do {
    completeWork(node)
    const sibling = node.sibling

    if (sibling !== null) {
      workInProgress = sibling
      return
    }

    node = node.return
    workInProgress = node
  } while (node !== null)
}

// fiber 是 wip
function performUnitOfWork(fiber: FiberNode): void {
  // 递
  const next = beginWork(fiber, wipRootRenderLane)
  fiber.memoizesProps = fiber.pendingProps

  if (next === null) {
    // 归
    completeUnitOfWork(fiber)
  } else {
    workInProgress = next
  }
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork

  if (finishedWork === null) {
    return
  }

  root.finishedWork = null

  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasEffect || rootHasEffect) {
    commitMutationEffects(finishedWork)

    root.current = finishedWork
  } else {
    root.current = finishedWork
  }
}

function workLoop(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

// function renderRoot(root: FiberRootNode) {
//   // 初始化 wip
//   prepareFreshStack(root)

//   do {
//     try {
//       workLoop()
//       break
//     } catch (e) {
//       workInProgress = null
//     }
//   } while (true)

//   root.finishedWork = root.current.alternate

//   // 真实的 dom 渲染
//   commitRoot(root)
// }

function markRootUpdated(root: FiberRootNode, lane: Lane) {
  root.pendingLanes = mergeLane(root.pendingLanes, lane)
}

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
  const nextLane = getHighestPriorityLane(root.pendingLanes)

  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(root)
    return
  }

  prepareFreshStack(root, lane)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      workInProgress = null
    }
  } while (true)

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  root.finishedLane = lane
  wipRootRenderLane = NoLane

  commitRoot(root)
}

function ensureRootIsScheduled(root: FiberRootNode) {
  const updateLane = getHighestPriorityLane(root.pendingLanes)
  if (updateLane === NoLane) {
    return
  }
  if (updateLane === SyncLane) {
    // 同步->微任务
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
    scheduleMicroTask(flushSyncCallbacks)
  } else {
  }
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
  const root = markUpdateFromFiberToRoot(fiber)
  markRootUpdated(root!, lane)
  ensureRootIsScheduled(root!)
  // renderRoot(root!)
}
