<template>
  <div id="app">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/components/layout/AppLayout.vue';

const authStore = useAuthStore();

onMounted(async () => {
  console.log('🚀 App.vue mounted');
  if (!authStore.initialized) {
    await authStore.initialize();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #334155;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}
</style>