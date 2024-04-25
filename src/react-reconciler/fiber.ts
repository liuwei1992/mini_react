import type { Key, Props, ReactElementType, Ref } from '@/shared/ReactTypes'
import { type Flags, NoFlags } from './fiberFlags'
import { Fragment, FunctionComponent, HostComponent, WorkTag } from './workTags'
import { UpdateQueue } from './updateQueue'
import { NoLane } from './fiberLanes'

export class FiberNode {
  // 元素类型， 函数式组件就是函数本身
  type: any = null

  // 真实dom
  stateNode: any = null
  ref: Ref = null

  return: FiberNode | null = null
  sibling: FiberNode | null = null
  child: FiberNode | null = null
  // 子元素中的第几个
  index: number = 0

  /** 更新后的props状态 */
  memoizesProps: Props | null = null
  /** element 对象 */
  memoizedState: any = null

  // 备用 双缓存
  alternate: FiberNode | null = null

  // 副作用标记（删除，移动等）
  flags: Flags = NoFlags
  subtreeFlags: Flags = NoFlags
  updateQueue: UpdateQueue | null = null

  /**
   *
   * @param tag // 组件对象类型
   * @param pendingProps  组件初始props
   * @param key
   */
  constructor(
    public tag: WorkTag,
    public pendingProps: Props,
    public key: Key
  ) {}
}

export function createFiberFromElement(element: ReactElementType) {
  const { type, key, props } = element

  let tag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    tag = HostComponent
  } else if (typeof type !== 'function') {
    console.error('未定义的type类型', type)
  }

  const fiber = new FiberNode(tag, props, key)

  fiber.type = type

  return fiber
}

export function createFiberFromFragment(elements: any[], key: Key) {
  const fiber = new FiberNode(Fragment, elements, key)
  return fiber
}

export class FiberRootNode {
  finishedWork: FiberNode | null
  finishedLane = NoLane
  pendingLanes = NoFlags
  pendingPassiveffects = null

  constructor(public container: any, public current: FiberNode) {
    current.stateNode = this
    this.finishedWork = null
  }
}

export function createWorkInProgress(
  current: FiberNode,
  pendingProps: Props
): FiberNode {
  let wip = current.alternate

  if (wip == null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode

    wip.alternate = current
    current.alternate = wip
  } else {
    // update
    wip.pendingProps = pendingProps
    wip.flags = NoFlags
    wip.subtreeFlags = NoFlags
  }
  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizesProps = current.memoizesProps
  wip.memoizedState = current.memoizedState

  return wip
}
