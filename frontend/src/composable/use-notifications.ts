import {BACKEND_URL} from "../const";

export function useNotifications() {
    // The purpose of this function is to take a base64-encoded string and convert it to a Uint8Array
    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // ask Vapid Public Key to the backend, for receive push API
    const getVapidPublicKey = async () => {
        const response = await fetch(`${BACKEND_URL}/api/vapidPublic`)
        const data = await response.json()
        return data.vapid_public_key
    }

    const checkBrowserCompatibility = () => {
        if (!('serviceWorker' in navigator)) throw new Error('Service workers are not supported by this browser')
        if (!('PushManager' in window)) throw new Error('Push notifications are not supported by this browser')
    }

    const askNotificationPermission = async () => {
        const permissionResult = await Notification.requestPermission()
        return permissionResult === 'granted';
    }

    const serviceWorkerRegistration = async () => {
        const client_url = window.location.href
        const registration = await navigator.serviceWorker.getRegistration(client_url)
        return registration ?? await navigator.serviceWorker.register('service-worker.js')
    }

    const subscribeUserToPush = async () => {
        try {
            const serviceWorker = await serviceWorkerRegistration()

            const public_key = await getVapidPublicKey()
            const subscribeOptions = {
                userVisibleOnly: true, // TODO: Understand the purpose of this property ?!
                applicationServerKey: urlBase64ToUint8Array(public_key)
            }

            return await serviceWorker.pushManager.subscribe(subscribeOptions)
        } catch (e) {
            console.error(e)
            return null
        }
    }

    return {
        askNotificationPermission,
        getVapidPublicKey,
        checkBrowserCompatibility,
        subscribeUserToPush
    }
}