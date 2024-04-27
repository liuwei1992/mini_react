import { EffectCallback, resolveDispatcher, type Dispatcher } from './currentDispatcher'

export { jsx as myJsx } from './jsx'

/** 执行 renderWithHooks() 中 Component(props) 时 会调到此方法 */
export const useState: Dispatcher['useState'] = (initialState) => {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}

export const useEffect = (create: EffectCallback, deps: any[] | null) => {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}
