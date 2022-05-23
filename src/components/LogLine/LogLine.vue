<template>
  <q-menu transition-show="jump-down" transition-hide="jump-up" touch-position context-menu>
    <q-item clickable v-close-popup>
      <q-item-section clickable @click="book">Bookmark</q-item-section>
    </q-item>
  </q-menu>
  <q-item style="min-height: 0; padding: 0; margin: 0; line-height: 1">
    <pre @click="logLineClickedFunc" class="text-left" :class="{ 'bg-indigo text-white': highlight }"
      style="white-space: pre; margin: 0" v-html="computedLine" />
  </q-item>
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { updateStats } from "../../database/firebaseActions.js";
const logLine = require("./LogLineImpl.js");

export default defineComponent({
  name: "LogLine",
  emits: ["logLineClicked"],
  data() {
    return {
      $store: useStore(),
      emot: "  "
    };
  },
  props: {
    highlight: {
      type: Boolean,
    },
    showLineNumbers: {
      type: Boolean,
    },
    id: {
      type: Number,
      required: true,
    },

    line: {
      type: String,
      required: true,
    },
    searchedToken: {
      type: String,
    },
    index: {
      type: Number,
    },
  },
  methods: {
    book() {
      updateStats("bookmarks", 1);
      this.$store.commit("workspace/addBookMark", {
        id: this.id,
        text: this.line,
        name: "<span style='font-weight: bold;'> custom </span>",
      });
    },
    logLineClickedFunc() {
      this.$emit("logLineClicked", this.index);
    },
  },
  computed: {
    computedLine: function () {
      let line = this.line;
      let emot = "  ";
      let foundBookmark = null;
      if (
        (foundBookmark = this.$store.state.workspace.bookmarks.find(
          (bookmark) => {
            return bookmark.id === this.id;
          }
        ))
      ) {
        emot = foundBookmark.emot;
      }

      line = logLine.setLineColor(" error ", line, "red");

      line = logLine.highlightToken(this.searchedToken, line, "Cyan");

      this.$store.state.workspace.highlights.forEach((element) => {
        line = logLine.highlightToken(
          element.higlightText,
          line,
          element.color
        );

      });

      return (
        logLine.computeNumbersPanel(
          !this.showLineNumbers,
          emot,
          this.index,
          this.id
        ) + line
      );
    },
  },
});
</script>
