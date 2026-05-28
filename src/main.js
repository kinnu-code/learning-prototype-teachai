import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

import SetupView from './views/SetupView.vue'
import LearningView from './views/LearningView.vue'
import PracticeView from './views/PracticeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: SetupView },
    { path: '/learn', component: LearningView },
    { path: '/practice', component: PracticeView },
  ],
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
