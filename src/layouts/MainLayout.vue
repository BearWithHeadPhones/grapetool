<template>
  <div class="q-pa-md" style="padding: 0; overflow: hidden;">
    <q-layout view="hHh LpR fFf">
      <q-page-container style="padding-right: 0;">
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  components: {},
});
</script>
