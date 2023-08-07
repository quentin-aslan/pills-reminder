import {computed, ref} from "vue";
import { type Ref } from "vue";

type PillHistory = {
    date: Date,
    notifications: number,
    taken: boolean
}

const pillsHistory: Ref<PillHistory[]> = ref<PillHistory[]>([])

export function usePills () {

    const isPillOfTheDayTaken = computed(() => {
        return pillsHistory.value.some((pill) => (getDayMonthYear(pill.date) === getDayMonthYear(new Date())) && pill.taken)
    })

    const pillTaken = () => {
        const getTodayPills = pillsHistory.value.find((row) => getDayMonthYear(row.date) === getDayMonthYear(new Date()))
        pillsHistory.value.push({
            date: new Date(),
            notifications: getTodayPills?.notifications ?? 0,
            taken: true
        })
    }

    // Utils
    const getDayMonthYear = (date: Date) => {
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()

        return `${day}/${month}/${year}`
    }

    const getHourMinutes = (date: Date) => {
        const hour = date.getHours()
        const minutes = date.getMinutes()

        return `${hour}:${minutes}`
    }

    return {
        pillsHistory,
        getDayMonthYear,
        getHourMinutes,
        isPillOfTheDayTaken,
        pillTaken
    }
}