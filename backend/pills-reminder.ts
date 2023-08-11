import {Notification, PillStatus, User} from "./types";
import webPush from "web-push";
import {getDb, getNYDate, isToday} from "./utils.js";
import {ReminderTime} from "pills-reminder-frontend/src/types";


const INTERVAL_CHECK_PILLS_STATUS = 300000 // 5 mins
const NOTIFICATION_MAX = 10

const DEFAULT_REMINDER_TIME = {
    hour: '8:15',
    timezone: 'America/New_York'
}
const isReminderTimePassed = (reminderTime: ReminderTime) => {
    const [hour, min] = reminderTime.hour.split(':')

    const reminderTimeFromTimezone = new Date().toLocaleString('en-US', {timeZone: reminderTime.timezone})
    const nowInReminderTimezone = new Date(reminderTimeFromTimezone)
    const reminderDate = new Date(
        nowInReminderTimezone.getFullYear(),
        nowInReminderTimezone.getMonth(),
        nowInReminderTimezone.getDate(),
        Number(hour),
        Number(min)
    )

    return nowInReminderTimezone > reminderDate;
}


const checkPillStatus = async () => {
    console.log('Checking pill status ...', getNYDate().toString())
    const db = await getDb()
    const users = db.data.users

    for (const user of users) {
        let pillHistoryIndex = user?.pillsHistory.findIndex(pillDatas => isToday(new Date(pillDatas.date)))
        // If no pill history for today, create one
        if (pillHistoryIndex === -1) {
            console.log('There is no pill history for today, creating one ...', user.name)
            user.pillsHistory.push({date: getNYDate(), taken: false, notifications: 0})
            pillHistoryIndex = user.pillsHistory.length -1
        }

        // If pill not taken and less than NOTIFICATION_MAX, send one
        if (user.pillsHistory[pillHistoryIndex].taken ||
            user.pillsHistory[pillHistoryIndex].notifications === NOTIFICATION_MAX ||
            !isReminderTimePassed(DEFAULT_REMINDER_TIME)) {
            console.log('Pill already taken, max notifications reached or reminder time not passed', user.name)
            continue
        }

        console.log("Sending notification to " + user.name)

        const notificationPayload: Notification = {
            title: 'Pill reminder',
            body: 'Did you take your pill today ?'
        }

        let notificationSent = 0

        for (const subscription of user.subscriptions) {
            try {
                await webPush.sendNotification(
                    subscription,
                    JSON.stringify({notification: notificationPayload})
                );
                notificationSent++
            } catch (e) {
                console.log("Error when sending notification to "+ user.name + ' | ' + subscription.endpoint)
            }
        }

        if (notificationSent > 0) user.pillsHistory[pillHistoryIndex].notifications++
    }
    await db.write()
}

export const initCheckPillsStatus = () => {
    console.log('Init check pill status interval | every : (ms)', INTERVAL_CHECK_PILLS_STATUS)
    checkPillStatus()
    setInterval(checkPillStatus, INTERVAL_CHECK_PILLS_STATUS)
}

export const updatePillStatus = async (datas: PillStatus): Promise<User> => {
    const db = await getDb()

    // Found the user
    const user = db.data.users.find(user => user.name === datas.username)
    if (!user) throw new Error('User not found')
    let pillHistoryIndex = user?.pillsHistory.findIndex(pillDatas => isToday(new Date(pillDatas.date)))


    if(pillHistoryIndex === -1) {
        console.log('There is no pill history for today, creating one ...', user.name)
        user.pillsHistory.push({date: getNYDate(), taken: datas.taken, notifications: 0})
        pillHistoryIndex = user.pillsHistory.length -1
    }

    user.pillsHistory[pillHistoryIndex].date = getNYDate()
    user.pillsHistory[pillHistoryIndex].taken = datas.taken
    await db.write()

    return user
}

