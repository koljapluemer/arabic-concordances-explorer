import { createWebHistory, createRouter } from "vue-router";
import Game from "@/views/Game.vue";

const routes = [
  {
    path: "/",
    name: "Game",
    component: Game,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;