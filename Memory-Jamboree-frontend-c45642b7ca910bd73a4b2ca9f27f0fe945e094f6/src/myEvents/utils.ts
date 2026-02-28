export function isEventActive(startTime: string) {
    const now = new Date()
    const eventTime = new Date(startTime)
    const tenMinutesBefore = new Date(eventTime.getTime() - 10 * 60 * 1000)
    return now >= tenMinutesBefore && now <= eventTime
  }
  