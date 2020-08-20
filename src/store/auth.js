import { fetchMe, updateDarkMode } from '@/api'

const setDarkMode = (darkMode) => {
  localStorage.darkMode = darkMode

  const rootClassList = document.documentElement.classList

  if (darkMode) {
    rootClassList.add('dark')
  } else {
    rootClassList.remove('dark')
  }
}

export default {
  state: {
    authState: false,
    userProfile: {}
  },
  getters: {
    isLoggedIn ({ authState }) {
      return authState
    },
    userId ({ userProfile: { user } }) {
      return user
    },
    hasFetched ({ userProfile }) {
      return Object.keys(userProfile).length !== 0
    },
    userNickname ({ userProfile: { nickname } }) {
      return nickname
    },
    userPicture ({ userProfile: { picture } }) {
      return picture
    },
    userConfig ({ userProfile: { see_sexual: sexual, see_social: social } }) {
      return { sexual, social }
    },
    isDarkModeEnabled ({ userProfile }) {
      return userProfile.extra_preferences && userProfile.extra_preferences.darkMode
    }
  },
  mutations: {
    setUserProfile (state, userProfile) {
      const darkMode = userProfile.extra_preferences && userProfile.extra_preferences.darkMode
      setDarkMode(darkMode)

      state.userProfile = userProfile
    },

    setAuthState(state, authed) {
      state.authState = authed
    }
  },
  actions: {
    async fetchMe ({ commit, getters: { hasFetched } }) {
      if (!hasFetched) {
        commit('setUserProfile', await fetchMe())
      }
    },
    async toggleDarkMode ({ commit, getters: { isDarkModeEnabled } }) {
      commit('setUserProfile', await updateDarkMode(!isDarkModeEnabled))
    }
  }
}
