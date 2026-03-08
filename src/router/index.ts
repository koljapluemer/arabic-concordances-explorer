import { createRouter, createWebHistory } from 'vue-router'
import GameView from '@/views/Game.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'game',
      component: GameView,
    },
  ],
})

export default router
