<template>
  <router-view style="max-height: 100vh;
    overflow-y: scroll;"/>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
})
</script>
