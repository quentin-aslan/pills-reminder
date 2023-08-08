<template>
  <div>
    <HistoryTable v-if="isPillOfTheDayTaken" />
    <ButtonChoice v-else />
  </div>
</template>
<script setup lang="ts">
import ButtonChoice from "@/components/ButtonChoice.vue";
import HistoryTable from "@/components/HistoryTable.vue";
import { usePills } from "@/composable/use-pills";
const { isPillOfTheDayTaken } = usePills()
</script>
