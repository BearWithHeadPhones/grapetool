<template>
  <q-item clickable v-ripple @mousedown="goToBookmarkedSection"
    style="min-height: 0; padding: 0; margin: 0; line-height: 1">
    <q-item-section>
      <pre v-html="bookmarkText" style="margin: 0.4px; color: #f4f6f6" />
      <q-tooltip>
        {{ line }}
      </q-tooltip>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BookmarkItem",

  props: {
    name: {
      type: String,
      required: true,
    },

    line: {
      type: String,
      required: true,
    },

    lineNumber: {
      type: Number,
      required: true,
    },

    markPosition: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    bookmarkText() {
      let bookmarktext =
        "".padStart(5 - this.lineNumber.toString().length, " ") +
        this.lineNumber +
        "|" +
        this.name +
        "</span>";

      if (this.markPosition) {
        bookmarktext =
          "<span style='text-decoration: overline;'>" +
          bookmarktext +
          "</span>";
      }

      return bookmarktext;
    },
  },
  methods: {
    goToBookmarkedSection() {
      this.$emit("bookmarkWarp", this.lineNumber);
    },
  },
});
</script>