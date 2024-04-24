import { ReactElementType } from '@/shared/ReactTypes'
import { createFiberFromElement, FiberNode } from './fiber'
import { REACT_ELEMENT_TYPE } from '@/shared/ReactSymbols'
import { HostText } from './workTags'
import { Placement } from './fiberFlags'

function ChildReconciler(shouldTrackEffect: boolean) {
  function reconcilerSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    const fiber = createFiberFromElement(element)
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

    return null
  }
}

export const reconcilerChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
