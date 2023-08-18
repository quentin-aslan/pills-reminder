<template>
  <div class="button_container">
    <button :disabled="isDisable" @click="togglePillStatus">{{ contentText }}</button>
  </div>
</template>

<script setup lang="ts">

import {usePills} from "../composable/use-pills";
import {computed, ref} from "vue";

const { updatePillStatus, isPillOfTheDayTaken } = usePills()

const isDisable = ref(false)

const togglePillStatus = async () => {
  isDisable.value = true
  await updatePillStatus(!isPillOfTheDayTaken.value)
  isDisable.value = false
}

const contentText = computed(() => {
  return isPillOfTheDayTaken.value ? "I didn't take my pills" :  'I took my pills'
})

</script>

<style scoped>
  .button_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px
  }

  button {
    width: 200px;
    height: 50px;
    border-radius: 10px;
    border: none;
    background-color: #F2F2F2;
    color: #000000;
    font-size: 20px;
    font-weight: 500;
    cursor: pointer;
  }
</style>