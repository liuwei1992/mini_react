export type Type = any
export type Key = string | number | bigint
export type Ref = any
export type Props = null | {
  children: any[] | string
}
export type ElementType = any
export type Action<State> = State | ((prevState: State) => State)

export interface ReactElementType {
  $$typeof: symbol | number
  type: ElementType
  key?: Key
  props: Props
  ref?: Ref

  // 我们自己的特殊标记
  __mark?: string
}
