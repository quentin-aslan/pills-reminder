<template>
  <div class="container" v-if="isPWAInstalled">
    <div class="card" v-if="userData">
      <HistoryTable v-if="isPillOfTheDayTaken" />
      <ButtonChoice v-else />
    </div>
    <RegisterForm v-else />
  </div>
  <HowInstallPWA v-else />
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useNotifications} from "./composable/use-notifications";
import {useUser} from "./composable/use-user";
import RegisterForm from "./components/RegisterForm.vue";
import ButtonChoice from "./components/ButtonChoice.vue";
import HistoryTable from "./components/HistoryTable.vue";
import {usePills} from "./composable/use-pills";
import HowInstallPWA from "./components/HowInstallPWA.vue";

const { isPWA, checkBrowserCompatibility } = useNotifications()
const { userData, getUserData } = useUser()
const { isPillOfTheDayTaken } =  usePills()
const isPWAInstalled = ref(false)

onMounted(async () => {
  isPWAInstalled.value = isPWA()
  // Check if the browser support service worker and Notification API. If not, display a message to the user
  try {
    checkBrowserCompatibility()
  } catch (e) {
    alert(e)
    isPWAInstalled.value = false // If the browser is not compatible, we don't need to display the application
  }

  getUserData()

  console.log('isPWAInstalled', isPWAInstalled.value)

})

</script>


<style scoped>
</style>
