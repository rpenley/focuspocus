function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getLocalDayRange(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function formatUtcDate(isoString: string) {
  const date = new Date(isoString)

  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`
}

export function formatUtcDateTime(isoString: string) {
  const date = new Date(isoString)
  const hours24 = date.getUTCHours()
  const hours12 = hours24 % 12 || 12
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'

  return `${formatUtcDate(isoString)}, ${hours12}:${minutes}:${seconds} ${meridiem} UTC`
}

export function dateInputValueFromIso(isoString: string | null) {
  if (!isoString) {
    return ''
  }

  return isoString.slice(0, 10)
}

export function isoFromDateInput(dateValue: string) {
  if (!dateValue) {
    return null
  }

  return `${dateValue}T12:00:00.000Z`
}
