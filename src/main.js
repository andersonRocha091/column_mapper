import { createApp } from 'vue'
import App from './App.vue'
import UseCSVButton from '@usecsv/vuejs3'
import 'bootstrap/dist/css/bootstrap.css';

createApp(App).component("usecsv-button", UseCSVButton).mount('#app')
