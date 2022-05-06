<template>
      <q-virtual-scroll
        q-page-sticky
        ref="virtualListRef"
        :style="heightComputed"
        component="q-list"
        :items="items"
        dense
        @virtual-scroll="onVirtualScroll"
      >
        <template v-slot="{ item, index }">
          <q-item
            clickable
            v-ripple
            :key="index"    
            style="min-height: 0; padding: 0; line-height: 1"
          
          >
            <LogLine
              @logLineClicked="logLineClicked($event)"
              :index="index"
              :id="item.index"
              :line="item.line"
              :searchedToken="searchedToken"
              :showLineNumbers="showLineNumbers"
              :highlight="index === bookamrkLineRelative"
            />
          </q-item>
        </template>
      </q-virtual-scroll>
   
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";
import LogLine from "./LogLine/LogLine.vue";

export default defineComponent({
  components: {
    LogLine,
  },

  name: "WorkspaceItem",
  props: {
    height:{
      type:Number
    },
    showLineNumbers: {
      type: Boolean,
    },
    items: {
      required: true,
    },
    workspaceId: {
      required: true,
    },
    bookmarkLine: {
      type: Number,
      required: true,
    },
    searchedToken: {
      type: String,
    },
  },

  data() {
    return {
      $store: useStore(),
      virtualListIndex: 0,
      from: 0,
      to: 0,
      bookamrkLineRelative: 1000,
      linefocus: 1,
      forwardToken: "",
    };
  },
  computed:{
    heightComputed(){
      return "height: " + this.height +"px;"
    }
  },
  methods: {
    goToBookmark(lineNumber) {
      this.bookamrkLineRelative = this.indexToScrollIndex(lineNumber);
      this.scrollTo(lineNumber);
      this.$store.commit("workspace/updateWorkspaceToBookmarkLine", {
        workspaceIndex: this.workspaceId,
        bookmarkLine: this.bookamrkLineRelative,
      });
      return this.bookamrkLineRelative;
    },
    logLineClicked(event) {
      this.linefocus = event + 1;
      this.$emit("logLineClicked", event);
    },
    scrollTo(lineNumber) {
      this.$refs.virtualListRef.scrollTo(
        this.indexToScrollIndex(lineNumber),
        "center"
      );
    },
    indexToScrollIndex(index) {
      let returnIndex = this.items.findIndex((elem) => {
        return elem.index > index;
      });
      return returnIndex - 1;
    },
    onVirtualScroll(event) {
      this.from = event.from;
      this.to = event.to;
      this.linefocus = event.index;
      this.virtualListIndex = event.index;
      this.$store.commit("workspace/updateWorkspaceToVirtualScrollIndex", {
        workspaceIndex: this.workspaceId,
        virtualScrollIndex: event.index,
      })
    },
  },
  mounted() {
    let workspaceToVirtualScrollIndex =
      this.$store.state.workspace.workspaceToVirtualScrollIndex;
    if (this.workspaceId in workspaceToVirtualScrollIndex) {
      this.$refs.virtualListRef.scrollTo(
        workspaceToVirtualScrollIndex[this.workspaceId]
      );

      let workspaceToBookmarkLine =
        this.$store.state.workspace.workspaceToBookmarkLine;
      if (this.workspaceId in workspaceToBookmarkLine) {
        let val = workspaceToBookmarkLine[this.workspaceId];
        this.bookamrkLineRelative = val;
      }
    }
  },
});
</script>
