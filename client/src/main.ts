import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faTerminal, faBars, faXmark, faSun, faMoon,
  faArrowRight, faArrowUpRightFromSquare, faGraduationCap,
  faScroll, faAward, faCertificate, faEnvelope, faLock,
  faPlay, faBriefcase, faCode, faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

import {
  faGithub, faLinkedin, faWhatsapp, faYoutube,
} from '@fortawesome/free-brands-svg-icons'

import App from './App.vue'
import router from './router'
import './assets/main.css'

library.add(
  faTerminal, faBars, faXmark, faSun, faMoon,
  faArrowRight, faArrowUpRightFromSquare, faGraduationCap,
  faScroll, faAward, faCertificate, faEnvelope, faLock,
  faPlay, faBriefcase, faCode, faChevronRight,
  faGithub, faLinkedin, faWhatsapp, faYoutube,
)

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router)
app.mount('#app')
