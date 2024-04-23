import { ReactElementType } from '@/shared/ReactTypes'

// 返回element对象
export const jsx = (type: any, props: any, key: string): ReactElementType => {
  return {
    $$typeof: Symbol(),
    type: 'h1',
    props: null,
    key: ''
  }
}
