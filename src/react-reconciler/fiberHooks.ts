import type { ReactElementType } from '@/shared/ReactTypes'
import type { FiberNode } from './fiber'
import internals from '@/shared/internals'
import { Dispatch, Dispatcher } from '@/react/currentDispatcher'
import {
  Action,
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
  UpdateQueue
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

interface Hook {
  memoizedState: any
  updateQueue: UpdateQueue | null
  next: Hook | null
}

const { currentDispatcher } = internals
/** 当前处理哪个函数式组件  */
let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
/** 当前在处理哪个hooks */
let currentHook: Hook | null = null

export function renderWithHooks(wip: FiberNode): ReactElementType {
  // 赋值
  currentlyRenderingFiber = wip
  // 重置 hooks 链表
  wip.memoizedState = null
  const current = wip.alternate

  if (current !== null) {
    currentDispatcher.current = HooksDispatcherOnUpdate
  } else {
    currentDispatcher.current = HooksDispatcherOnMount
  }

  const Component = wip.type
  const props = wip.pendingProps
  const children = Component(props)

  currentlyRenderingFiber = null
  workInProgressHook = null
  currentHook = null

  return children
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState
}

function updateState<State>(): [State, Dispatch<State>] {
  const hook: Hook = updateWorkInProgressHook()

  const queue = hook.updateQueue
  const pending = queue!.shared.pending
  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending)
    hook.memoizedState = memoizedState
  }

  return [hook.memoizedState, queue!.dispatch]
}
function mountState<State>(
  initialState: State | (() => State)
): [State, Dispatch<State>] {
  const hook = mountWorkInProgressHook()
  let memoizedState
  if (initialState instanceof Function) {
    memoizedState = initialState()
  } else {
    memoizedState = initialState
  }
  const queue = createUpdateQueue<State>()
  hook.updateQueue = queue
  hook.memoizedState = memoizedState

  const dispach = dispatchSetState.bind(null, currentlyRenderingFiber!, queue)
  queue.dispatch = dispach
  return [memoizedState, dispach]
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State> // 组件内调用 setXXX 传入的值
) {
  const update = createUpdate(action)
  enqueueUpdate(updateQueue, update)
  scheduleUpdateOnFiber(fiber)
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null
  }
  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数式组件内调用hook')
    }
    workInProgressHook = hook
    currentlyRenderingFiber.memoizedState = workInProgressHook
  } else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  return workInProgressHook
}
