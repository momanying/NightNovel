import { defineNuxtPlugin } from '#app'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    toastDefaults: {
      error: {
        position: POSITION.BOTTOM_RIGHT,
        toastClassName: 'bg-red-600 text-white',
      },
      success: {
        position: POSITION.TOP_CENTER,
        toastClassName: 'bg-green-600 text-white',
      },
      info: {
        position: POSITION.TOP_RIGHT,
        toastClassName: 'bg-blue-600 text-white',
      },
    },
  }

  nuxtApp.vueApp.use(Toast, options)
})
