type Subscription = {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    }
}

export type User = {
    name: string,
    timezone: string,
    reminderTime: string, // hh:mm
    subscriptions: Subscription[],
    pillsHistory: PillHistory[]
}

export type PillHistory = {
    dateISO: Date,
    notifications: number,
    taken: boolean
}