import type {User} from "@/types";
import {useNotifications} from "@/composable/use-notifications";
import {ref} from "vue";
import {BACKEND_URL} from "@/const";

const LOCAL_STORAGE_KEY = 'pills-reminder'
const { subscribeUserToPush } = useNotifications()

const userData:Ref<User> = ref<User | null>(null)

export function useUser() {
    const setUsername = async (username: string) => {
        try {
            if(username.length < 3) throw new Error('Username must be at least 3 characters long')

            const pushSubscription = await subscribeUserToPush()

            const payload = {
                name: username,
                subscription: pushSubscription,
                pillsHistory: []
            }

            const response = await fetch(`${BACKEND_URL}/subscribe`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if(!response.ok) throw new Error('Register failed')

            localStorage.setItem(`${LOCAL_STORAGE_KEY}-username`, username);

            userData.value = payload
        } catch (e) {
            return alert(e)
        }
    }

    const getUserData: User = async (): Promise<User> => {
        try {
            const username = localStorage.getItem(`${LOCAL_STORAGE_KEY}-username`)
            if(!username) return undefined

            const response = await fetch(`${BACKEND_URL}/getUser?username=${username}`)
            if (response.ok) {
                userData.value = await response.json()
            }
            return userData.value
        } catch (e) {
            return alert(e)
        }
    }

    return {
        getUserData,
        setUsername,
        userData
    }
}
