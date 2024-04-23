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

export function enqueueUpdate<T>(
  updateQueue: UpdateQueue<T>,
  update: Update<T>
) {
  updateQueue.shared.pending = update
}
