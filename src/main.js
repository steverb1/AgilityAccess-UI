import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'

Vue.config.productionTip = false

console.log('Debug: Vue app starting to mount')

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

console.log('Debug: Vue app mounted')
