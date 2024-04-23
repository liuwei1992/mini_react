import { ElementType as RElementType } from 'react'

export type Type = any
export type Key = string | number | bigint | null
export type Ref = any | null
export type Props = any
export type ElementType = RElementType
export type Action<State> = State | ((prevState: State) => State)

export interface ReactElementType {
  $$typeof: symbol | number
  type: ElementType
  key: Key
  props: Props
  ref: Ref
}
