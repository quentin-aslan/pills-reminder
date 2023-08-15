export const getNowInTimezone = (timezone: string) => {
    const now = new Date()
    return new Date(now.toLocaleString('en-US', {timeZone: timezone}))
}