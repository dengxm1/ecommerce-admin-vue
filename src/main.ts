import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/main.scss'  
import {permissionDirective} from '@/directives/permission'
import './styles/nprogress.scss'


const app = createApp(App)

app.use(createPinia())
app.use(router)

 app.directive('permission', permissionDirective)

app.mount('#app')
