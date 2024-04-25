import {
  createContainer,
  updateContainer
} from '@/react-reconciler/fiberReconciler'
import { Container } from './hostConfig'
import { ReactElementType } from '@/shared/ReactTypes'

export function createRoot(container: Container) {
  const root = createContainer(container)

  return {
    render(element: ReactElementType) {
      // initEvent(container, 'click')
      updateContainer(element, root)
    }
  }
}
