<script setup lang="ts">

const generateRandomPictureLink = () => {
  return `https://picsum.photos/300/350`
}
</script>

<template>
  <div style="text-align: center">
    <img :src="generateRandomPictureLink()" alt="random sky image" />
  </div>
</template>

<style scoped>

</style>