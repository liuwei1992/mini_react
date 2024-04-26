export type Type = any
export type Key = string | number | null
export type Ref = any | null
export type Props = null | {
  children?: any // string | ReactElementType | ReactElementType[]
  [p: string]: any
}
export type ElementType = any
export type Action<State> = State | ((prevState: State) => State)

export interface ReactElementType {
  $$typeof: symbol | number
  type: ElementType
  key: Key
  props: Props
  ref: Ref
}
