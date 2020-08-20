import store from '@/store'
import { logout } from '@/api'

import Facade from '@/views/Facade.vue'

export const authGuard = async (to, from, next) => {
  if (!store.getters.isLoggedIn) {
    next('/login')
  } else {
    try {
      await Promise.all([
        store.dispatch('fetchMe'),
        store.dispatch('fetchBoardList')
      ])
      next()
    } catch (err) {
      // @TODO: 서버장애 페이지..?
    }
    next()
  }
}

export default [
  {
    path: '/login',
    name: 'facade',
    component: Facade,
    beforeEnter: (to, from, next) => {
      if (store.getters.isLoggedIn) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/login-handler',
    name: 'login-handler',
    beforeEnter: (to, from, next) => {
      store.commit('setAuthState', true)
      next('/')
    }
  },
  {
    path: '/logout',
    name: 'logout-handler',
    beforeEnter: async (to, from, next) => {
      try {
        await logout()
      } catch (err) {}
      store.commit('setAuthState', false)
      next('/login')
    }
  }
]
