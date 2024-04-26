import { Props } from '@/shared/ReactTypes'
import { DomElement, updateFiberProps } from './SyntheticEvent'
import { FiberNode } from '@/react-reconciler/fiber'
import { HostComponent, HostText } from '@/react-reconciler/workTags'

export type Container = any
export type Instance = Element
export type TextInstance = Text

export function createInstance(type: string, props: Props): Instance {
  const element = document.createElement(type)
  updateFiberProps(element, props)
  return element
}

export function createTextInstance(content: string): TextInstance {
  return document.createTextNode(content)
}

export function appendInitialChild(
  parent: Instance | Container,
  child: Instance
) {
  parent.appendChild(child)
}

export function commitTextUpdate(testInstance: TextInstance, content: string) {
  testInstance.textContent = content
}

export function commitUpdate(fiber: FiberNode) {
  switch (fiber.tag) {
    case HostText:
      const text = fiber.memoizesProps?.content
      return commitTextUpdate(fiber.stateNode, text)
    case HostComponent:
      return updateFiberProps(fiber.stateNode, fiber.memoizesProps)
    default:
      break
  }
}

export const appendChildToContainer = appendInitialChild

/** queueMicrotask || Promise.resolve || setTimeout */
export const scheduleMicroTask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : typeof Promise === 'function'
    ? (callback: (...arg: any) => void) => Promise.resolve(null).then(callback)
    : setTimeout
