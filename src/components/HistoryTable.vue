<template>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Notifications sent before the pills taken</th>
      </tr>
    </thead>
    <tbody>
    {{ userData.pillsHistory }}
      <tr v-for="pill in userData.pillsHistory" :key="pill.id">
        <td>{{getDayMonthYear(new Date(pill.date)) }}</td>
        <td>{{ getHourMinutes(new Date(pill.date)) }}</td>
        <td>{{ pill.notifications }}</td>
      </tr>
    </tbody>x
  </table>

</template>

<script setup lang="ts">
import { usePills } from "@/composable/use-pills";
import {useUser} from "@/composable/use-user";
const { userData } = useUser()
const { getDayMonthYear, getHourMinutes } = usePills()

</script>

<style scoped>

</style>