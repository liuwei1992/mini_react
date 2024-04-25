import { Props } from '@/shared/ReactTypes'
import { updateFiberProps } from './SyntheticEvent'

export type Container = any
export type Instance = any

export function createInstance(type: string, props: Props): Instance {
  const element = document.createElement(type)
  updateFiberProps(element, props)
  return element
}

export function createTextInstance(content: string): Instance {
  return document.createTextNode(content)
}

export function appendInitialChild(
  parent: Instance | Container,
  child: Instance
) {
  parent.appendChild(child)
}

export const appendChildToContainer = appendInitialChild
