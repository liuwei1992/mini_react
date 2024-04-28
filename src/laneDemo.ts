// 数字越小优先级越高
const ImmefiatePriority = 1 // 同步 立即执行
const UserBlockingPriority = 2 // 用户优先级，点击事件

const NormalPriority = 3 // 正常优先级

const IdlePriority = 5 // 低优先级
const LowPriority = 4 // 低优先级

const root = document.querySelector('#root')

const workList: any[] = []
let prevPriority = IdlePriority
let curCallback: any = null
let time_log: any = 0

function shouldYield() {
  return (
    window.React as any
  ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_shouldYield.apply(
    null,
    arguments
  )
}

function cancelCallback(...arg: any) {
  return (
    window.React as any
  ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_cancelCallback.apply(
    null,
    arguments
  )
}

function getFirstCallbackNode() {
  return (
    window.React as any
  ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_getFirstCallbackNode.apply(
    null,
    arguments
  )
}

function scheduleCallback(...arg: any) {
  return (
    window.React as any
  ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_scheduleCallback.apply(
    null,
    arguments
  )
}

;(
  [
    [LowPriority, '低优先级'],
    [NormalPriority, '正常优先级'],
    [UserBlockingPriority, '用户优先级'],
    [ImmefiatePriority, '立即执行']
  ] as [number, string][]
).forEach(([priority, display]) => {
  const btn = document.createElement('button')
  root?.appendChild(btn)
  btn.innerText = display
  btn.onclick = () => {
    workList.unshift({
      count: 100,
      priority
    })
    schedule()
  }
})

interface Work {
  count: number
  priority: number
}

function schedule() {
  const cbNode = getFirstCallbackNode()
  // console.log('cbNode', cbNode)
  const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0]

  if (!curWork) {
    curCallback = null
    cbNode && cancelCallback(cbNode)
    return
  }
  const curPriority = curWork.priority

  if (curPriority === prevPriority) {
    return
  }

  cbNode && cancelCallback(cbNode)

  // scheduleCallback 是一个宏任务执行器，可以类比setTimeout postMessage
  curCallback = scheduleCallback(curPriority, perform.bind(null, curWork))
}

function perform(work: Work, didTimout: boolean): any {
  /**
   * 1.work.priority
   * 2. 饥饿问题
   * 3. 时间切片
   */

  if (!time_log) {
    time_log = new Date()
  } else {
    const diff = (new Date() as any) - time_log // 8ms
    time_log = new Date()
    console.log('diff', diff)
  }

  const needSync = work.priority === ImmefiatePriority || didTimout

  // shouldYield 不断地计算还有没有剩余时间
  while ((needSync || !shouldYield()) && work.count) {
    work.count--
    insertSpan(work.priority + '')
  }
  insertSpan2()
  console.log('work.count', work.count)

  prevPriority = work.priority

  if (!work.count) {
    const workIndex = workList.indexOf(work)
    workList.splice(workIndex, 1)
    prevPriority = IdlePriority
  }

  const prevCallback = curCallback
  schedule()
  const newCallback = curCallback

  if (newCallback && prevCallback === newCallback) {
    return perform.bind(null, work)
  }
}

function insertSpan(content: any) {
  const span = document.createElement('span')
  span.innerText = content
  span.className = `pri-${content}`
  doSomeBuzyWork(900000)
  root?.appendChild(span)
}

function insertSpan2() {
  const span = document.createElement('span')
  span.innerText = '[][][][][]'
  root?.appendChild(span)
}

function doSomeBuzyWork(len: number) {
  let result = 0

  while (len--) {
    result += len
  }
}

export {}
