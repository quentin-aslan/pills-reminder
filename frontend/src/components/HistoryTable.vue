<template>
    <table class="table">
      <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Notifications sent</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="pillHistory of userData?.pillsHistory">
        <td>{{ getDayMonthYear(new Date(pillHistory.dateISO)) }}</td>
        <td>{{ getHourMinutes(new Date(pillHistory.dateISO)) }}</td>
        <td>{{pillHistory.notifications }}</td>
      </tr>
      </tbody>
    </table>
</template>

<script setup lang="ts">
import { usePills } from "../composable/use-pills";
import {useUser} from "../composable/use-user";
const { userData } = useUser()
const { getDayMonthYear, getHourMinutes } = usePills()
</script>

<style scoped>

</style>