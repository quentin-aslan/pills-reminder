<template>
  <div>
    <h1>Settings</h1>
      <h2>Set the hour of your reminder for your pills with thie datepicker</h2>
      <div>
        <input type="number" v-model="hour" min="0" max="23" />
        <input type="number" v-model="minutes" min="0" max="59" />
      </div>
  </div>
</template>

<script lang="ts">
import {ref} from "vue";

const hour = ref(9)
const minutes = ref(30)
</script>

<style>
</style>
