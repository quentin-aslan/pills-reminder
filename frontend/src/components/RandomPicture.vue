<script setup lang="ts">

const generateRandomPictureLink = () => {
  return `https://source.unsplash.com/300x350/?landscape`
}
</script>

<template>
  <div>
    <img :src="generateRandomPictureLink()" alt="random sky image" />
  </div>
</template>

<style scoped>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }

  img {
    width: 300px;
    height: 350px;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    img {
      width: 200px;
      height: 250px;
    }
  }

</style>