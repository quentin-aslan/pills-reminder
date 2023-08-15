import {Notification, PillStatus, User} from "./types.js";
import webPush from "web-push";
import {getDb, isToday} from "./utils.js";
import {getNowInTimezone} from "./user.js";


const INTERVAL_CHECK_PILLS_STATUS = 300000 // 5 mins
const NOTIFICATION_MAX = 10

const isReminderTimePassed = (user: User) => {
    user.timezone = 'America/New_York'
    user.reminderTime = '8:15'
    if(!user.timezone || !user.reminderTime) throw new Error('isReminderTimePassed : User has no timezone or reminderTime')

    const [hour, min] = user.reminderTime.split(':')

    // Get current time in reminder timezone
    const reminderTimeFromTimezone = new Date().toLocaleString('en-US', {timeZone: user.timezone})
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
    try {
        const db = await getDb()
        const users = db.data.users

        for (const user of users) {
            console.log(`Checking pill status for ${user.name} at ${getNowInTimezone(user.timezone).toString()}`)
            let pillHistoryIndex = user?.pillsHistory.findIndex(pillDatas => isToday(user.timezone, new Date(pillDatas.date)))
            // If no pill history for today, create one
            if (pillHistoryIndex === -1) {
                console.log('There is no pill history for today, creating one ...', user.name)
                user.pillsHistory.push({date: getNowInTimezone(user.timezone), taken: false, notifications: 0})
                pillHistoryIndex = user.pillsHistory.length -1
            }

            // If pill not taken and less than NOTIFICATION_MAX, send one
            if (user.pillsHistory[pillHistoryIndex].taken ||
                user.pillsHistory[pillHistoryIndex].notifications === NOTIFICATION_MAX ||
                !isReminderTimePassed(user)) {
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
    } catch (e) {
        console.log('Error when checking pill status')
        console.log(e)
    }
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
    let pillHistoryIndex = user?.pillsHistory.findIndex(pillDatas => isToday(user.timezone, new Date(pillDatas.date)))


    if(pillHistoryIndex === -1) {
        console.log('There is no pill history for today, creating one ...', user.name)
        user.pillsHistory.push({date: getNowInTimezone(user.timezone), taken: datas.taken, notifications: 0})
    } else {
        user.pillsHistory[pillHistoryIndex].date = getNowInTimezone(user.timezone)
        user.pillsHistory[pillHistoryIndex].taken = datas.taken
    }

    await db.write()

    return user
}