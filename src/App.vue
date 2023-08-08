<template>
  <div class="container" v-if="isBrowserCompatible">
    <div class="card" v-if="userData">
      <HistoryTable v-if="isPillOfTheDayTaken" />
      <ButtonChoice v-else />
    </div>
    <RegisterForm v-else />
  </div>

  <h1 v-else>Sorry, your browser is not compatible with this app</h1>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useNotifications} from "@/composable/use-notifications";
import {useUser} from "@/composable/use-user";
import RegisterForm from "@/components/RegisterForm.vue";
import ButtonChoice from "@/components/ButtonChoice.vue";
import HistoryTable from "@/components/HistoryTable.vue";
import {usePills} from "@/composable/use-pills";

const { checkBrowserCompatibility } = useNotifications()
const { userData, getUserData } = useUser()
const { isPillOfTheDayTaken } =  usePills()
const isBrowserCompatible = ref(false)

onMounted(async () => {
  // Check if the browser support service worker and Notification API. If not, display a message to the user
  try {
    checkBrowserCompatibility()
    isBrowserCompatible.value = true
  } catch (e) {
    alert(e)
    isBrowserCompatible.value = false
  }

  getUserData()

})

</script>


<style scoped>
</style>
