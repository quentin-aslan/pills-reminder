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
    subscription: Subscription,
    pillsHistory: PillHistory[]
}
export type PillHistory = {
    date: Date,
    notifications: number,
    taken: boolean
}
