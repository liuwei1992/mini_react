export type Container = any
export type Instance = any

export function createInstance(type: string): Instance {
  return document.createElement(type)
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
