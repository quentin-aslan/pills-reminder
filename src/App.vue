<template>
  <div v-if="isBrowserCompatible">
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/settings">Settings</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView v-if="userData" />
    <RegisterForm v-else />
  </div>
  <div v-else>
    <h1>Sorry, your browser is not compatible with this app</h1>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {onMounted, ref} from "vue";
import {useNotifications} from "@/composable/use-notifications";
import {useUser} from "@/composable/use-user";
import RegisterForm from "@/components/RegisterForm.vue";

const { checkBrowserCompatibility } = useNotifications()
const { userData, getUserData } = useUser()
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
