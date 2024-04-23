import { REACT_ELEMENT_TYPE } from '@/shared/ReactSymbols'
import type {
  Key,
  Props,
  ReactElementType,
  Ref,
  Type,
  ElementType
} from '@/shared/ReactTypes'

const ReactElement = function (type: Type, key: Key, ref: Ref, props: Props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    props,
    ref
  }
}

// 返回element对象
export const jsx = (
  type: ElementType,
  config: any = {},
  ...children: any
): ReactElementType => {
  console.log('jsx------', type, config, children)
  let key: Key = null
  let ref: Ref = null
  let props: Props = {}

  for (const k in config) {
    const v = config[k]

    if ('key' === k) {
      key = `${v}`
      continue
    }

    if ('ref' === k) {
      ref = v
      continue
    }

    if (config.hasOwnProperty(k)) {
      props[k] = v
    }
  }

  if (children.length === 1) {
    props.children = children[0]
  }

  if (children.length > 1) {
    props.children = [...children]
  }

  return ReactElement(type, key, ref, props)
}
