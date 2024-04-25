import { ReactElementType } from '@/shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { requestUpdateLane } from './fiberLanes'

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
  const lane = requestUpdateLane()
  const update = createUpdate<ReactElementType | null>(element, lane)

  enqueueUpdate(hostRootfiber.updateQueue!, update)

  scheduleUpdateOnFiber(hostRootfiber,lane)
  return element
}
