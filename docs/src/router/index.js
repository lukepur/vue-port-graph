import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import PropMutateTest from '@/pages/prop-mutate-test'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/prop-mutate-test',
      name: 'PropMutateTest',
      component: PropMutateTest
    }
  ]
})
