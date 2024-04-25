import { ReactElementType } from '@/shared/ReactTypes'

export type UpdateQueue<T = any> = {
  shared: {
    pending: null | Update<T>
  }
  dispatch: any
}

export type Update<T = any> = {
  action: T
}

export type Action<T = any> = T //ReactElementType

/** 返回一个 
 * {
    action: action
  }
  对象 */
export function createUpdate<T>(action: Action<T>) {
  return {
    action
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
  updateQueue.shared.pending = update
}

/** 获得 pending.action 的结果 */
export function processUpdateQueue<State = any>(
  baseState: State,
  pendingUpdate: Update<State>
): { memoizedState: State } {
  const result = {
    memoizedState: baseState
  }

  if (pendingUpdate !== null) {
    const action = pendingUpdate.action
    if (action instanceof Function) {
      result.memoizedState = action(baseState)
    } else {
      result.memoizedState = action
    }
  }

  return result
}
