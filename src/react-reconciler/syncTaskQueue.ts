let syncQueue: ((...args: any) => void)[] | null = null
let isFlushingSyncQueue = false
export function scheduleSyncCallback(cb: (...args: any) => void) {
  if (syncQueue === null) {
    syncQueue = [cb]
  } else {
    syncQueue.push(cb)
  }
}

export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true

    try {
      syncQueue.forEach((cb) => cb())
    } catch (e) {
      console.error('flushSyncCallbacks 报错', e)
    } finally {
      isFlushingSyncQueue = false
      syncQueue = null
    }
  }
}
