import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

// 防止fontawesome自动添加CSS
config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
  library.add(fas, fab, far)
  
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
}) 