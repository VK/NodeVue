<template>
  <fullscreen :fullscreen.sync="fullscreen" background="#fac78f">
    <div class="home">
      <img alt="Vue logo" src="../assets/logo.png">
    </div>
    <button v-on:click="startFullScreen" >Start</button>
    <router-link :to="'main'">Main</router-link>
  </fullscreen>
</template>

<script>
import Vue from "vue";
import fullscreen from "vue-fullscreen";
Vue.use(fullscreen);

export default {
  name: "welcome",
  methods: {
    startFullScreen: function() {
      this.fullscreen = true;
    }
  },
  data() {
    return {
      fullscreen: false
    };
  }
};
</script>

