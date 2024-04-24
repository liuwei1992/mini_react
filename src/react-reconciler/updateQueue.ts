import { ReactElementType } from '@/shared/ReactTypes'

export type UpdateQueue<T = any> = {
  shared: {
    pending: any
  }
}

export type Update<T = any> = {
  action: any
}

export type Action<T> = ReactElementType

export function createUpdate<T>(action: Action<T>): Update<T> {
  return {
    action
  }
}

export function createUpdateQueue<State = any>(): UpdateQueue<State> {
  return {
    shared: {
      pending: null
    }
  }
}

export function enqueueUpdate<State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
) {
  updateQueue.shared.pending = update
}

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
