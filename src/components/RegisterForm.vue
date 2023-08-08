<template>
  <div>
    <h1>Register</h1>
    <form>
      <div>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" />
      </div>
      <button class="button" @click.stop.prevent="continueRegister">Continue</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useNotifications} from "@/composable/use-notifications";
import {useUser} from "@/composable/use-user";

const { askNotificationPermission } = useNotifications()
const { setUsername } = useUser()

const username = ref('')

// Verify the username length and Ask notification permission if user click on continue, finally send all information to the backend
const continueRegister = async () => {
  if (username.value.length < 3) return alert('You have to enter a username with more than 3 characters')
  if (!await askNotificationPermission()) return alert('You have to accept notifications to continue');

  // Send all information to the backend
  await setUsername(username.value)
}

</script>

<style scoped>

</style>