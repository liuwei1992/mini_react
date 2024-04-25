import { ReactElementType } from '@/shared/ReactTypes'
import { createFiberFromElement, createFiberFromFragment, FiberNode } from './fiber'
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from '@/shared/ReactSymbols'
import { HostText } from './workTags'
import { Placement } from './fiberFlags'

function ChildReconciler(shouldTrackEffect: boolean) {
  function reconcilerSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    // const fiber = createFiberFromElement(element)
    // fiber.return = returnFiber
    const key = element.key
    while (currentFiber !== null) {
      if (currentFiber.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            let props = element.props
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props?.children
            }
            const existing = useFiber(currentFiber, props)
            existing.return = returnFiber
            // 当前节点可复用，标记剩余的节点删除
            deleteRemainingChildren(returnFiber, currentFiber)
            return existing
          }
          deleteRemainingChildren(returnFiber, currentFiber)
          break
        } else {
          break
        }
      } else {
        deleteChild(returnFiber, currentFiber)
        currentFiber = currentFiber.sibling
      }
    }

    let fiber
    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props?.children, key)
    } else {
      fiber = createFiberFromElement(element)
    }
    fiber.return = returnFiber
    return fiber
  }

  function reconcilerSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    const fiber = new FiberNode(HostText, { content }, null)
    fiber.return = returnFiber

    return fiber
  }

  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffect && fiber.alternate === null) {
      fiber.flags |= Placement
    }
    return fiber
  }

  return function reconcilerChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType
  ) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcilerSingleElement(returnFiber, currentFiber, newChild)
          )
        default:
          console.error('未实现的 reconcile 类型', newChild)
          break
      }
    }

    // string|number类型
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcilerSingleTextNode(returnFiber, currentFiber, newChild)
      )
    }

    return null
  }
}

export const reconcilerChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
