import { Action, ReactElementType } from '@/shared/ReactTypes'
import { Lane } from './fiberLanes'

export type UpdateQueue<T = any> = {
  shared: {
    pending: null | Update<T>
  }
  dispatch: any
}

export interface FCUpdateQueue<T> extends UpdateQueue<T> {
  lastEffect: any
}

export type Update<T> = {
  action: Action<T>
  lane: Lane
  next: Update<any> | null
}

/** 返回一个 
 * {
    action,
    lane,
    next: null
  }
  对象 */
export function createUpdate<T>(action: Action<T>, lane: Lane): Update<T> {
  return {
    action,
    lane,
    next: null
  }
}

/** 创建一个 
 * {
    shared: {
      pending: null
    },
    dispatch: null
  }
 * 的对象 */
export function createUpdateQueue<State = any>(): UpdateQueue<State> {
  return {
    shared: {
      pending: null
    },
    dispatch: null
  }
}

/** 设置值：  updateQueue.shared.pending = update */
export function enqueueUpdate<State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
) {
  const pending = updateQueue.shared.pending
  if (pending == null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
    // pending = 2   1->2->1
    //  pending = 3  1->2->3->1
    //  pending = 4  1->2->3->4->1
  }
  updateQueue.shared.pending = update
}

/** 获得 pending.action 的结果 */
export function processUpdateQueue<State = any>(
  baseState: State,
  pendingUpdate: Update<State>,
  renderLane: Lane
): { memoizedState: State } {
  const result = {
    memoizedState: baseState
  }

  if (pendingUpdate !== null) {
    const first = pendingUpdate.next
    let pending = pendingUpdate.next as Update<any>
    do {
      const updateLane = pending.lane
      if (updateLane === renderLane) {
        const action = pending?.action
        if (action instanceof Function) {
          baseState = action(baseState)
        } else {
          baseState = action
        }
      } else {
        console.log('不应该进入 updateLane ！== renderLane 的逻辑')
      }
      pending = pending.next as Update<State>
    } while (pending !== first)

    result.memoizedState = baseState
  }

  return result
}
