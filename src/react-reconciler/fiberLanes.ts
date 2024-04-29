import { FiberRootNode } from './fiber'

export type Lane = number
export type Lanes = number

export const NoLane = 0b0000
export const NoLanes = 0b0000

export const SyncLane = 0b0001
export const InputContinuousLane = 0b0010
export const DefaultLane = 0b0100
export const IdleLane = 0b1000

export function mergeLane(laneA: Lane, laneB: Lane) {
  return laneA | laneB
}

export function requestUpdateLane() {
  return SyncLane
}

// 数字越小优先级越大
export function getHighestPriorityLane(lanes: Lanes) {
  return lanes & -lanes
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
  root.pendingLanes &= ~lane
}
