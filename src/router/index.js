import { createWebHistory, createRouter } from "vue-router";
import Game from "@/views/Game.vue";
import Lessons from "@/views/Lessons.vue";

const routes = [
  {
    path: "/",
    name: "Game",
    component: Game,
  },
  {
    path: "/lessons",
    name: "Lessons",
    component: Lessons,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;