import type { Action, ReactElementType } from '@/shared/ReactTypes'
import type { FiberNode } from './fiber'
import internals from '@/shared/internals'
import {
  Dispatch,
  Dispatcher,
  Effect,
  EffectCallback,
  EffectDeps,
  EffectDestroy
} from '@/react/currentDispatcher'
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  FCUpdateQueue,
  processUpdateQueue,
  UpdateQueue
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { Lane, NoLane, requestUpdateLane } from './fiberLanes'
import { Flags, PassiveEffect, Placement } from './fiberFlags'
import { HookHasEffect, Passive } from './hookEffectTags'

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
let renderLane: Lane = NoLane

export function renderWithHooks(wip: FiberNode, lane: Lane): ReactElementType {
  // 赋值
  currentlyRenderingFiber = wip
  // 重置 hooks 链表
  wip.memoizedState = null
  wip.updateQueue = null
  renderLane = lane
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
  renderLane = NoLane

  return children
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
  useEffect: mountEffect
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
  useEffect: updateEffect
}

function mountEffect(create: EffectCallback, deps?: EffectDeps) {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  currentlyRenderingFiber!.flags |= PassiveEffect

  hook.memoizedState = pushEffect(
    Passive | HookHasEffect,
    create,
    undefined,
    nextDeps
  )
}

function pushEffect(
  hookFlags: Flags,
  create: EffectCallback,
  destroy: EffectDestroy,
  deps: EffectDeps
) {
  const effect: Effect = {
    tag: hookFlags,
    create,
    destroy,
    deps,
    next: null
  }

  const fiber = currentlyRenderingFiber!
  const updateQueue = fiber?.updateQueue as FCUpdateQueue<any>
  if (updateQueue === null) {
    const updateQueue = createFCUpdateQueue()
    fiber.updateQueue = updateQueue
    effect.next = effect
    updateQueue.lastEffect = effect
  } else {
    const lastEffect = updateQueue.lastEffect
    if (lastEffect === null) {
      effect.next = effect
      updateQueue.lastEffect = effect
    } else {
      const firstEffect = lastEffect.next
      lastEffect.next = effect
      effect.next = firstEffect
      updateQueue.lastEffect = effect
    }
  }
  return effect
}

function createFCUpdateQueue<State>(): FCUpdateQueue<State> {
  const updateQueue = createUpdateQueue<State>() as FCUpdateQueue<State>
  updateQueue.lastEffect = null
  return updateQueue
}

function updateState<State>(): [State, Dispatch<State>] {
  const hook: Hook = updateWorkInProgressHook()

  const queue = hook.updateQueue
  const pending = queue!.shared.pending
  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(
      hook.memoizedState,
      pending,
      renderLane
    )
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

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber!, queue)
  queue.dispatch = dispatch
  return [memoizedState, dispatch]
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State> // 组件内调用 setXXX 传入的值
) {
  const lane = requestUpdateLane()
  const update = createUpdate(action, lane)
  enqueueUpdate(updateQueue, update)
  scheduleUpdateOnFiber(fiber, lane)
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

function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: null | Hook
  if (currentHook === null) {
    const current = currentlyRenderingFiber!.alternate
    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      nextCurrentHook = null
    }
  } else {
    nextCurrentHook = currentHook.next
  }

  let nextWorkInProgressHook: null | Hook
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber!.memoizedState
  } else {
    nextWorkInProgressHook = workInProgressHook.next
  }

  if (nextWorkInProgressHook !== null) {
    // There's already a work-in-progress. Reuse it.
    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next

    currentHook = nextCurrentHook
  } else {
    // Clone from the current hook.

    if (nextCurrentHook === null) {
      const currentFiber = currentlyRenderingFiber!.alternate
      if (currentFiber === null) {
        // This is the initial render. This branch is reached when the component
        // suspends, resumes, then renders an additional hook.
        // Should never be reached because we should switch to the mount dispatcher first.
        throw new Error(
          'Update hook called on initial render. This is likely a bug in React. Please file an issue.'
        )
      } else {
        // This is an update. We should always have a current hook.
        throw new Error('Rendered more hooks than during the previous render.')
      }
    }

    currentHook = nextCurrentHook

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      updateQueue: currentHook.updateQueue,
      next: null
    }

    if (workInProgressHook === null) {
      // This is the first hook in the list.
      currentlyRenderingFiber!.memoizedState = workInProgressHook = newHook
    } else {
      // Append to the end of the list.
      workInProgressHook = workInProgressHook.next = newHook
    }
  }
  return workInProgressHook
}
