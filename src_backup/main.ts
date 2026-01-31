import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './assets/main.scss'

// 解决 Chrome 控制台 [Violation] Added non-passive event listener 警告
// 强制将 wheel 等滚动阻断事件设置为 passive: true 以提高滚动性能
if (typeof EventTarget !== 'undefined') {
  const originalAddEventListener = EventTarget.prototype.addEventListener
  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'wheel' || type === 'touchmove' || type === 'mousewheel') {
      if (typeof options === 'object' && options !== null) {
        options = { ...options, passive: true }
      } else if (typeof options === 'boolean') {
        options = { capture: options, passive: true }
      } else if (options === undefined) {
        options = { passive: true }
      }
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
}

const app = createApp(App)
const pinia = createPinia()

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')