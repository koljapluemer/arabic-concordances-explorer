import { createWebHistory, createRouter } from "vue-router";
import Game from "@/views/Game.vue";
import About from "@/views/About.vue";

const routes = [
  {
    path: "/",
    name: "Game",
    component: Game,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;