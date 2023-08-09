import type {Subscription, User} from "@/types";
import {useNotifications} from "@/composable/use-notifications";
import {type Ref, ref} from "vue";
import {BACKEND_URL} from "@/const";

const LOCAL_STORAGE_KEY = 'pills-reminder'
const { subscribeUserToPush } = useNotifications()

const userData:Ref<User | null> = ref<User | null>(null)

export function useUser() {
    const setUsername = async (username: string) => {
        try {
            if(username.length < 3) throw new Error('Username must be at least 3 characters long')

            const pushSubscription = await subscribeUserToPush()

            const payload = {
                name: username,
                subscription: (pushSubscription) ? pushSubscription as unknown as Subscription : null,
                pillsHistory: []
            }

            if (!payload.name || !payload.subscription) throw new Error('An error occurred, name and subscription are required to subscribe new user.')

            const response = await fetch(`${BACKEND_URL}/subscribe`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if(!response.ok) throw new Error('Register failed')

            localStorage.setItem(`${LOCAL_STORAGE_KEY}-username`, username);

            userData.value = payload as User
        } catch (e) {
            return alert(e)
        }
    }

    const getUserData = async (): Promise<User | null> => {
        try {
            const username = localStorage.getItem(`${LOCAL_STORAGE_KEY}-username`)
            if(!username) return null

            const response = await fetch(`${BACKEND_URL}/getUser?username=${username}`)
            if (response.ok) {
                const datas = await response.json()
                if(datas) userData.value = datas
            }
            return userData.value
        } catch (e) {
            alert(e)
            return null
        }
    }

    return {
        getUserData,
        setUsername,
        userData
    }
}
