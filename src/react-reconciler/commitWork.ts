import { Container } from 'react-dom'
import { FiberNode, FiberRootNode, PendingPassivEffects } from './fiber'
import {
  ChildDeletion,
  Flags,
  MutationMask,
  NoFlags,
  PassiveEffect,
  Placement,
  Update
} from './fiberFlags'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags'
import {
  appendChildToContainer,
  appendInitialChild,
  commitUpdate,
  Instance
} from '@/react-dom/hostConfig'
import { FCUpdateQueue } from './updateQueue'
import { Effect } from '@/react/currentDispatcher'

let nextEffect: FiberNode | null = null

export function commitMutationEffects(finishedWork: FiberNode) {
  nextEffect = finishedWork

  while (nextEffect !== null) {
    const child: FiberNode | null = nextEffect.child

    if (
      (nextEffect.subtreeFlags & (MutationMask | PassiveEffect)) !== NoFlags &&
      child !== null
    ) {
      nextEffect = child
    } else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect)
        const sibling: FiberNode | null = nextEffect.sibling

        if (sibling !== null) {
          nextEffect = sibling
          break up
        }
        nextEffect = nextEffect.return
      }
    }
  }
}

function commitMutationEffectsOnFiber(
  finishedWork: FiberNode,
  root: FiberRootNode
) {
  const flags = finishedWork.flags

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    finishedWork.flags &= ~Placement
  }

  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork)
    finishedWork.flags &= ~Update
  }

  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions
    if (deletions !== null) {
      deletions.forEach((childToDelete) => commitDeletion(childToDelete, root))
    }
    finishedWork.flags &= ~ChildDeletion
  }
  if ((flags & PassiveEffect) !== NoFlags) {
    commitPassiveEffect(finishedWork, root, 'update')
    finishedWork.flags &= ~PassiveEffect
  }
}

function commitPassiveEffect(
  fiber: FiberNode,
  root: FiberRootNode,
  type: keyof PendingPassivEffects
) {
  if (
    fiber.tag !== FunctionComponent ||
    (type === 'update' && (fiber.flags & PassiveEffect) === NoFlags)
  ) {
    return
  }

  const updateQueue = fiber.updateQueue as FCUpdateQueue<any>
  if (updateQueue !== null) {
    root.pendingPassivEffects![type].push(updateQueue.lastEffect)
  }
}

function commitPlacement(finishedWork: FiberNode) {
  const hostParent = getHostParent(finishedWork)

  const sibling = getHostSibling(finishedWork)

  if (hostParent !== null) {
    // appendPlacementNodeIntoContainer(finishedWork, hostParent)
    insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling)
  }
}

function getHostParent(fiber: FiberNode): Container | null {
  let parent = fiber.return

  while (parent) {
    const parentTag = parent.tag
    if (parentTag === HostComponent) {
      return parent.stateNode
    } else if (parentTag === HostRoot) {
      return parent.stateNode.container
    }
    parent = parent.return
  }
  return null
}

function insertOrAppendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: Container,
  before?: Instance
) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    if (before) {
      insertChildToContainer(finishedWork.stateNode, hostParent, before)
    } else {
      appendChildToContainer(hostParent, finishedWork.stateNode)
    }
  }
}

function commitHookEffectList(
  flags: Flags,
  lastEffect: Effect,
  callback: (effect: Effect) => void
) {
  let effect = lastEffect.next as Effect
  do {
    if ((effect.tag & flags) === flags) {
      callback(effect)
    }
    effect = effect.next as Effect
  } while (effect !== lastEffect.next)
}

export function commitHookEffectListDestory(flags: Flags, lastEffect: Effect) {
  commitHookEffectList(flags, lastEffect, (effect: Effect) => {
    const destroy = effect.destroy
    if (typeof destroy === 'function') {
      destroy()
    }
  })
}

export function commitHookEffectListCreate(flags: Flags, lastEffect: Effect) {
  commitHookEffectList(flags, lastEffect, (effect: Effect) => {
    const create = effect.create
    if (typeof create === 'function') {
      effect.destroy = create()
    }
  })
}
