export type Database = {
    users: User[]
    vapidKeys: VapidKeys
}

export type Subscription = {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    }
}

export type VapidKeys = {
    publicKey?: string;
    privateKey?: string;
}

export type User = {
    name: string,
    timezone: string,
    reminderTime: string, // hh:mm
    subscriptions: Subscription[],
    pillsHistory: PillHistory[]
}

export type PillHistory = {
    dateISO: string,
    notifications: number,
    taken: boolean
}

export type Notification = {
    title: string;
    body: string;
    icon?: string;
}


type PillStatus = {
    username: string,
    taken: boolean
}