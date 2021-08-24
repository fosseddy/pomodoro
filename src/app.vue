<script lang="ts">
import Vue from "vue";
import TestComponent from "./components/test.vue";

export default Vue.extend({
  name: "App",
  components: { TestComponent }
});
</script>

<template lang="pug">
  div
    h1 Hello, World

    TestComponent
</template>
