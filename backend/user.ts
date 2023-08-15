export const getNowInTimezone = (timezone: string) => {
    console.log('getNowInTimezone', timezone)
    const now = new Date()
    return new Date(now.toLocaleString('en-US', {timeZone: timezone}))
}