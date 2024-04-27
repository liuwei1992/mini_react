import { Action } from '@/shared/ReactTypes'

export type EffectCallback = () => (() => void) | void
export type EffectDeps = Array<any> | void | null
export type EffectDestroy = (() => void) | void

export interface Effect {
  tag: number
  create: EffectCallback
  destroy: EffectDestroy | null
  deps: EffectDeps
  next: Effect | null
}
export interface Dispatcher {
  useState: <State>(
    initialState: State | (() => State)
  ) => [State, Dispatch<State>]
  useEffect: (create: EffectCallback, deps: EffectDeps) => void
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
