import { createApp } from 'vue'
import App from './App.vue'
import foofItem from './components/foofItem.vue';
const app = createApp(App);
app.component('food-item', foofItem);
app.mount('#app');