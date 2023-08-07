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
      <tr v-for="pill in pillsHistory" :key="pill.id">
        <td>{{getDayMonthYear(pill.date) }}</td>
        <td>{{ getHourMinutes(pill.date) }}</td>
        <td>{{ pill.notifications }}</td>
      </tr>
    </tbody>
  </table>

</template>

<script setup lang="ts">
import { usePills } from "@/composable/use-pills";

const { pillsHistory, getDayMonthYear, getHourMinutes } = usePills()

</script>

<style scoped>

</style>