import Vue from 'vue'
import Router from 'vue-router'
import welcome from './views/Welcome.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: welcome
    },
    {
      path: '/main',
      name: 'main',
      component: () => import(/* webpackChunkName: "main" */ './views/Main.vue')
    }
  ]
})
