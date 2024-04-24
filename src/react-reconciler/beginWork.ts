import { ReactElementType } from '@/shared/ReactTypes'
import { FiberNode } from './fiber'
import { processUpdateQueue } from './updateQueue'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags'
import { mountChildFibers, reconcilerChildFibers } from './childFibers'

// 递 阶段
export function beginWork(wip: FiberNode): FiberNode | null {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip)
    case HostComponent:
      return updateHostComponent(wip)
    case HostText:
      return null
    case FunctionComponent:
      return updateFunctionComponent(wip)
    default:
      console.error('beginWork 不支持的类型')
      break
  }
  return null
}

function updateHostRoot(wip: FiberNode): FiberNode | null {
  const baseState = wip.memoizedState
  const updateQueue = wip.updateQueue
  const pending = updateQueue!.shared.pending
  updateQueue!.shared.pending = null

  const { memoizedState } = processUpdateQueue(baseState, pending)
  wip.memoizedState = memoizedState

  const nextChildren = wip.memoizedState
  reconcilerChildren(wip, nextChildren)
  return wip.child
}

// 建立 fiber、父子关系
function reconcilerChildren(wip: FiberNode, children?: ReactElementType): void {
  const current = wip.alternate

  if (current !== null) {
    wip.child = reconcilerChildFibers(wip, current.child, children)
  } else {
    wip.child = mountChildFibers(wip, null, children)
  }
}

function updateHostComponent(wip: FiberNode): FiberNode | null {
  const nextProps = wip.pendingProps
  const nextChildren = nextProps!.children

  reconcilerChildren(wip, nextChildren)

  return wip.child
}

function updateFunctionComponent(wip: FiberNode): FiberNode | null {
  return null
}
