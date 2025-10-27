// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Register Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Register Vue Router
app.use(router)

app.mount('#app')