import { Props } from '@/shared/ReactTypes'
import { Container } from './hostConfig'

export const elementPropsKey = '__props'
const validEventTypeList = ['click']

type EventCallback = (e: Event) => void

interface SyntheticEvent extends Event {
  __stopPropagation: boolean
}

interface Paths {
  capture: EventCallback[]
  bubble: EventCallback[]
}

export interface DomElement extends Element {
  [elementPropsKey]?: Props
}

export function updateFiberProps(node: DomElement, props: Props) {
  node[elementPropsKey] = props
}

/** 在react中，事件都绑定在 react的容器根节点 */
export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    return
  }

  container.addEventListener(eventType, (e: Event) => {
    dispatchEvent(container, eventType, e)
  })
}

function createSyntheticEvent(e: Event) {
  const syntheticEvent = e as SyntheticEvent
  syntheticEvent.__stopPropagation = false
  const originStopPropagation = e.stopPropagation

  syntheticEvent.stopPropagation = () => {
    syntheticEvent.__stopPropagation = true
    if (originStopPropagation) {
      originStopPropagation()
    }
  }
  return syntheticEvent
}

function getEventCallbackNameFromEventType(eventType: string) {
  return {
    click: ['onClickCapture', 'onClock']
  }[eventType]
}

function collectPaths(
  targetElement: DomElement,
  container: Container,
  eventType: string
) {
  const paths: Paths = {
    capture: [],
    bubble: []
  }

  while (targetElement && targetElement !== container) {
    // 收集
    const elementProps = targetElement[elementPropsKey]
    if (elementProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType)

      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName]
          if (eventCallback) {
            if (i === 0) {
              // 捕获 放在前
              paths.capture.unshift(eventCallback)
            } else {
              // 冒泡
              paths.bubble.push(eventCallback)
            }
          }
        })
      }
    }
    targetElement = targetElement.parentElement as unknown as DomElement
  }

  return paths
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
  const targetElement = e.target as DomElement

  if (targetElement === null) {
    return
  }

  // 1. 收集沿途事件
  const { bubble, capture } = collectPaths(targetElement, container, eventType)

  // 2. 构造合成事件
  const se = createSyntheticEvent(e)

  // 3 遍历captue
  triggerEventFlow(capture, se)

  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se)
  }
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i]
    callback.call(null, se)

    if (se.__stopPropagation) {
      break
    }
  }
}
