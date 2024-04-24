import { ReactElementType } from '@/shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

export function createContainer(container: HTMLElement) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)

  const root = new FiberRootNode(container, hostRootFiber)
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}

export function updateContainer(
  element: ReactElementType,
  root: FiberRootNode
) {
  const hostRootfiber = root.current
  const update = createUpdate<ReactElementType | null>(element)

  enqueueUpdate(hostRootfiber.updateQueue!, update)

  scheduleUpdateOnFiber(hostRootfiber)
}
