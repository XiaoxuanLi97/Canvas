import Vue from 'vue'
import App from './App.vue'
import elementUi from 'element-ui'

Vue.config.productionTip = false
Vue.use(elementUi)

new Vue({
  render: h => h(App),
}).$mount('#app')
