import { DateTime } from 'luxon';

export const getNowInTimezone = (timezone: string) => {
    return DateTime.now().setZone(timezone)
}
