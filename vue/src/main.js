import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable */
new Vue({
  render: h => h(App),
  router,
}).$mount('#app');
