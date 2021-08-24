import Vue from "vue";
import App from "./app.vue";
import "./index.scss";

Vue.config.productionTip = false;

new Vue({ render: h => h(App), }).$mount("#app");
