<template>
  <!-- <ImportOk /> -->
  <usecsv-button importerKey="1e9a7b85-e645-4f6c-99c4-f97485071ba3">
    Importar Dados
  </usecsv-button>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue';
// import ImportOk from './components/ImportOK.vue';
import UseCSVButton from '@usecsv/vuejs3';

export default {
  name: 'App',
  components: {
    // ImportOk
    "usecsv-button": UseCSVButton
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
