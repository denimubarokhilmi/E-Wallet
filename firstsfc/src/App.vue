<script>
export default {
  data(){
    return {
      message: 'Hello Vue.js!'
    }
  }
}
</script>
<template>
  <p>{{ message }}</p>
  <h2>food</h2>
  <food-item/>
  <food-item/>
  <food-item/>
</template>
<style>
#app .coba{
  border: dashed black 1px;
  display: inline-block;
  margin: 10px;
  padding: 10px;
  background-color: lightcoral;
}
</style>