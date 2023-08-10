// Set-up express server
import cors from 'cors'
import {dirname, join} from 'path'
import https from 'https'
import http from 'http'
import webPush from 'web-push'
import bodyParser from 'body-parser'
import {Notification, PillStatus, User} from "./types.js";
import express, { Request, Response } from "express";
import {getCertificate, getDb, initWebPush} from './utils.js';
import {initCheckPillsStatus, updatePillStatus} from "./pills-reminder.js";
import {fileURLToPath} from "url";
const app = express();
const SERVER_PORT = process.env.PORT || 4051;

// Set-up vue app
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '../frontend')));

// Functions
const saveUserInDb = async (userData: User) => {
    const db = await getDb()
    const userDb = db.data.users.find(user => user.name === userData.name)

    if (!userDb) {
        if(!userData.pillsHistory) userData.pillsHistory = []

        db.data.users.push(userData)
        await db.write()
    } else {
        console.log('utilisateur existe')
        if(userDb.subscriptions?.length > 0) userDb.subscriptions = [...userDb.subscriptions, ...userData.subscriptions]
        console.log(userDb.subscriptions)
        await db.write()
    }

}
const getServer = () => {
    const certs = getCertificate()
    if (!certs) {
        console.log('No certificates found, starting http server instead of https')
        return http.createServer(app)
    } else {
        console.log('Certificates found, starting https server')
        return https.createServer(certs, app)
    }
}

// Start server
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
getServer().listen(SERVER_PORT, async () => {
    console.log(`Server started on port ${SERVER_PORT}`)
    await initWebPush()
    await initCheckPillsStatus()
})

// API ROUTES

app.get('/api/vapidPublic', async (req: Request, res: Response) => {
    const db = await getDb()
    const vapidKeys = db.data.vapidKeys

    if (!vapidKeys.publicKey) return res.status(500).json({ message: 'No public key found' })
    return res.status(200).json({vapid_public_key: vapidKeys.publicKey})
})

app.post('/api/subscribe', async (req: any, res: any) => {
    try {
        const data: User = req.body;

        // Check if subscription have all keys
        if (!data.name || !data.subscriptions || !Array.isArray(data.subscriptions)) {
            return res.status(400).json({ message: 'Username, endpoint and keys properties are mandatory' });
        }

        for (const subscription of data.subscriptions) {
            if (!subscription.endpoint || !subscription.keys) {
                return res.status(400).json({ message: 'Endpoint and keys properties are mandatory' });
            }
        }

        await saveUserInDb(data)
        return res.status(201).json({ message: 'Subscription added successfully.' });
    } catch (e) {
        return res.status(500).json({ message: 'Error when saving the subscription.' });
    }
});

// Send a push notification
app.post('/api/sendNotification', async (req: Request, res: Response) => {
    try {
        // get notification from params
        const notificationPayload: Notification & { username: string } = req.body;

        if(!notificationPayload.title || !notificationPayload.body || !notificationPayload.username) {
            return res.status(400).json({message: 'Username is required and Notification must have a title and a body'})
        }

        const db = await getDb()
        const user = db.data.users.find(user => user.name === notificationPayload.username)
        if (!user) return res.status(400).json({message: 'User not found'})

        for (const subscription of user.subscriptions) {
            try {
                await webPush.sendNotification(
                    subscription,
                    JSON.stringify({notification: notificationPayload})
                );
            } catch (e) {
                console.log("Error when sending notification to " + user.name)
            }
        }

        return res.status(201).json({ message: 'Notifications sent successfully.' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Error when sending the notification.' });
    }
})

app.post('/api/pillStatus', async (req: any, res: any) => {
    try {
        const pillStatus: PillStatus = req.body;

        if (!pillStatus.username || !pillStatus.taken) {
            return res.status(400).json({ message: 'Username or taken properties missed' });
        }

        const user = await updatePillStatus(pillStatus)

        return res.status(200).json(user);
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Error when saving the pill status.' });
    }
});

app.get('/api/getUser', async (req: any, res: any) => {
    try {
        const username = req.query.username
        if (!username) return res.status(400).json({ message: 'Username is required' });

        const db = await getDb()
        const user = db.data.users.find(user => user.name === username)

        if (!user) return res.status(400).json({ message: 'Wrong username !' });

        return res.status(200).json(user);
    } catch (e) {
        return res.status(500).json({ message: 'Error when getting the pills history.' });
    }
})

// Redirect all the other routes to Vue app
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/index.html'));
});