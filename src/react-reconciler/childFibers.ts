import { ReactElementType } from '@/shared/ReactTypes'
import {
  createFiberFromElement,
  createFiberFromFragment,
  FiberNode
} from './fiber'
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

  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild: any[]
  ) {
    // 最后一个可复用 fiber 在 current 中的 index
    let lastPlacedIndex = 0
    // 创建 的最后一个fiber
    let lastNewFiber: FiberNode | null = null
    let firstNewFiber: FiberNode | null = null

    const existingChildren: ExistingChildren = new Map()
    let current = currentFirstChild
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.key // ???
      existingChildren.set(keyToUse, current)
      current = current.sibling
    }

    for (let i = 0; i < newChild.length; i++) {
      const after = newChild[i]
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after)
      if (newFiber === null) {
        continue
      }

      newFiber.index = i
      newFiber.return = returnFiber

      if (lastNewFiber === null) {
        lastNewFiber = newFiber
        firstNewFiber = newFiber
      } else {
        lastNewFiber.sibling = newFiber
        lastNewFiber = lastNewFiber.sibling
      }

      if (!shouldTrackEffect) {
        continue
      }

      const current = newFiber.alternate
      if (current !== null) {
        const oldIndex = current.index
        if (oldIndex < lastPlacedIndex) {
          newFiber.flags |= Placement
          continue
        } else {
          lastPlacedIndex = oldIndex
        }
      } else {
        newFiber.flags |= Placement
      }
    }

    existingChildren.forEach((fiber) => {
      deleteChild(returnFiber, fiber)
    })
    return firstNewFiber
  }

  function updateFromMap(
    returnFiber: FiberNode,
    existingChildren: ExistingChildren,
    index: number,
    element: any
  ) {
    const keyToUse = element.key !== null ? element.key : index
    const before = existingChildren.get(keyToUse)

    if (typeof element === 'string' || typeof element === 'number') {
      if (before) {
        if (before.tag === HostText) {
          existingChildren.delete(keyToUse)
          return useFiber(before, { content: `${element}` })
        }
      }
      return new FiberNode(HostText, { content: `${element}` }, null)
    }

    if (typeof element === 'object' && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element,
              keyToUse,
              existingChildren
            )
          }
          if (before) {
            if (before.type === element.type) {
              existingChildren.delete(keyToUse)
              return useFiber(before, element.props)
            }
          }
          return createFiberFromElement(element)
      }
      if (Array.isArray(element)) {
        console.error('不支持数组类型')
      }
    }

    if (Array.isArray(element)) {
      return updateFragment(
        returnFiber,
        before,
        element,
        keyToUse,
        existingChildren
      )
    }
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
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild)
      }

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
