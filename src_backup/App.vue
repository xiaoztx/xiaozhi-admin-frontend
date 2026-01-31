<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

onMounted(() => {
  systemStore.loadSettings()
})
</script>

<style>
#app {
  height: 100vh;
  overflow: hidden;
}
</style>