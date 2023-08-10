import {Notification, PillStatus, User} from "./types";
import webPush from "web-push";
import {getDb, getNYCFromUTC, isToday} from "./utils.js";


const INTERVAL_CHECK_PILLS_STATUS = 10000 // 5 mins
const NOTIFICATION_MAX = 10

const DEFAULT_REMINDER_TIME = '8:15'
const isReminderTimePassed = (reminderTime: string) => {
    const [hour, min] = reminderTime.split(':');
    const nowInNY = getNYCFromUTC() // TODO: Gerer les notifications en fonction de l'heure de l'utilisateur

    // Définissez l'heure de rappel basée sur l'heure actuelle de New York
    const reminderDate = new Date(nowInNY.getFullYear(), nowInNY.getMonth(), nowInNY.getDate(), Number(hour), Number(min));

    return nowInNY > reminderDate;
}


const checkPillStatus = async () => {
    console.log('Checking pill status ...', new Date().toString())
    const db = await getDb()
    const users = db.data.users

    for (const user of users) {
        let pillHistoryIndex = user?.pillsHistory.findIndex(pillDatas => isToday(new Date(pillDatas.date)))
        // If no pill history for today, create one
        if (pillHistoryIndex === -1) {
            console.log('There is no pill history for today, creating one ...', user.name)
            user.pillsHistory.push({date: new Date(), taken: false, notifications: 0})
            pillHistoryIndex = user.pillsHistory.length -1
        }

        // If pill not taken and less than NOTIFICATION_MAX, send one
        if (user.pillsHistory[pillHistoryIndex].taken ||
            user.pillsHistory[pillHistoryIndex].notifications === NOTIFICATION_MAX ||
            !isReminderTimePassed(DEFAULT_REMINDER_TIME)) {
            console.log('Pill already taken, max notifications reached or reminder time not passed', user.name)
            continue
        }

        const notificationPayload: Notification = {
            title: 'Pill reminder',
            body: 'Did you take your pill today ?'
        }

        try {
            console.log("Sending notification to " + user.name)
            await webPush.sendNotification(
                user.subscription,
                JSON.stringify({ notification: notificationPayload })
            );

            user.pillsHistory[pillHistoryIndex].notifications++
        } catch (e) {
            console.log("Error when sending notification to " + user.name)
        }
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
        user.pillsHistory.push({date: new Date(), taken: datas.taken, notifications: 0})
        pillHistoryIndex = user.pillsHistory.length -1
    }

    user.pillsHistory[pillHistoryIndex].date = getNYCFromUTC()
    user.pillsHistory[pillHistoryIndex].taken = datas.taken
    await db.write()

    return user
}

