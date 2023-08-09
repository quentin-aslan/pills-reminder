import {computed} from "vue";
import {useUser} from "@/composable/use-user";
import type {PillHistory} from "@/types";
import {BACKEND_URL} from "@/const";

const { userData } = useUser()

export function usePills () {

    const isPillOfTheDayTaken = computed(() => {
        if(!userData) return false
        return userData.value?.pillsHistory.some((pillHistory: PillHistory) => isToday(new Date(pillHistory.date)) && pillHistory.taken)
    })

    const pillTaken = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/pillStatus`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    username: userData.value?.name,
                    taken: true
                })
            })

            if(!response.ok) throw new Error('Pill status update failed')
            userData.value = await response.json()
            return true
        } catch (e) {
            return alert(e)
        }
    }

    // Utils
    const getDayMonthYear = (date: Date) => {
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()

        return `${day}/${month}/${year}`
    }

    const isToday = (someDate: Date) => {
        const today = new Date()
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear()
    }

    const getHourMinutes = (date: Date) => {
        const hour = date.getHours()
        const minutes = date.getMinutes()

        return `${hour}:${minutes}`
    }

    return {
        getDayMonthYear,
        getHourMinutes,
        isPillOfTheDayTaken,
        pillTaken
    }
}