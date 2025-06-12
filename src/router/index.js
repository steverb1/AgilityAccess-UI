import Vue from 'vue'
import VueRouter from 'vue-router'
import StoryExtractForm from '../views/StoryExtractForm.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: StoryExtractForm
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
