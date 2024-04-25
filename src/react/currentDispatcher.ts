import { Action } from '@/shared/ReactTypes'

export interface Dispatcher {
  useState: <State>(
    initialState: State | (() => State)
  ) => [State, Dispatch<State>]
}

export type Dispatch<State> = (action: Action<State>) => void

/** renderWithHooks 时赋值 */
const currentDispatcher: { current: Dispatcher | null } = {
  current: null
}

export function resolveDispatcher(): Dispatcher {
  const dispatcher = currentDispatcher.current
  if (dispatcher === null) {
    throw new Error('hook 只能在函数组件内执行')
  }
  return dispatcher
}

export default currentDispatcher
