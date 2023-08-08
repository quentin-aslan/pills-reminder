<template>
  <div class="button_container">
    <button :disabled="isPillTakenDisabled" @click="_pillTaken">I took my pills</button>
  </div>
</template>

<script setup lang="ts">

import {usePills} from "@/composable/use-pills";
import {ref} from "vue";

const { pillTaken } = usePills()

const isPillTakenDisabled = ref(false)

const _pillTaken = async () => {
  isPillTakenDisabled.value = true
  await pillTaken()
  isPillTakenDisabled.value = false
}

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