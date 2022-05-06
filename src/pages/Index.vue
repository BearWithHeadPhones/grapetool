<template>
  <q-page flex>
    <q-header elevated ref="heada">
      <q-bar class="bg-indigo">
        <q-btn
          flat
          @click="leftDrawerOpen = !leftDrawerOpen"
          round
          dense
          icon="menu"
        />
        <q-toolbar-title>grapetool</q-toolbar-title>
        <q-input
          standout
          v-model="searchPhrase"
          dark
          dense
          ref="searchField"
          debounce="50"
          placeholder="search"
          @keyup.enter="search"
          input-class="text-right"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-separator dark vertical inset />
        <q-toggle size="xs" v-model="showLineNumbers" icon="list" />
        <q-separator dark vertical inset />
        <q-file v-if="true" ref="filepicker" v-model="file" style="width: 0" />
        <q-btn-dropdown
          split
          push
          icon="folder"
          flat
          label="open file"
          @click="pickFile"
        >
          <div class="text-center">
            <q-list dense>
              <div class="text-h7 q-mb-md" style="margin-bottom: 0px">
                Log file Settings
              </div>
              <q-item>
                <q-toggle size="xs" v-model="sortOnFileOpen" label="Sort" />
              </q-item>
              <q-item>
                <q-toggle
                  size="xs"
                  v-model="removeBlankLinesOnFileOpen"
                  label="Remove blanks"
                />
              </q-item>
            </q-list>
          </div>
        </q-btn-dropdown>
        <q-separator dark vertical inset />
        <q-btn flat @click="clearEverything">Reset</q-btn>
        <q-separator dark vertical inset />
        <q-btn flat @click="clearHighlights">Clear Highlights</q-btn>

        <q-separator dark vertical inset />
      </q-bar>
    </q-header>

    <q-drawer
      padding
      v-model="leftDrawerOpen"
      class="text-white"
      style="background-color: #24759c"
    >
      <q-scroll-area class="fit">
        <q-list dense padding style="padding-left: 12px">
          <div v-for="bookmark in bookmarks" :key="bookmark.id">
            <BookmarkItem
              :line="bookmark.text"
              :name="bookmark.emot + bookmark.name"
              :lineNumber="bookmark.id"
              :markPosition="bookmark.id == markedBookmarkId"
              @bookmarkWarp="bookmarkWarp($event)"
            />
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">grep</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            ref="grepInput"
            v-model="grepToken"
            autofocus
            @keyup.enter="grep"
            @keyup.esc="prompt = false"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="cancel" v-close-popup />
          <q-btn flat label="grep" v-close-popup @click="grep" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-linear-progress v-if="loading" indeterminate />
    <div class="container">
      <q-tabs
        ref="tabs"
        v-model="workspaceIndex"
        dense
        no-caps
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        inline-label
      >
        <q-tab
          :key="workspace.index"
          v-for="workspace in workspaces"
          highlight
          separator
          :name="workspace.index"
          :label="workspace.label"
        >
          <q-btn
            size="8px"
            v-if="workspace.index > 0"
            flat
            round
            color="deep-orange"
            icon="close"
            @click="closeTab(workspace.index)"
        /></q-tab>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="workspaceIndex" @click="oneClick">
        <q-tab-panel
          style="padding: 0"
          :key="workspace.index"
          v-for="workspace in workspaces"
          highlight
          separator
          bordered
          :name="workspace.index"
        >
          <WorkspaceItem
            ref="workspace"
            @logLineClicked="logLineClicked($event)"
            :workspaceId="workspace.index"
            :items="workspace.content"
            :bookmarkLine="bookmarkLine"
            :searchedToken="searchPhrase"
            :showLineNumbers="showLineNumbers"
            :height="workspaceHeight"
          />
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <q-footer class="bg-black" ref="foota">
      <q-bar dense class="bg-black text-white">
        V1.1 bartosz.cwynar@yahoo.com
        <q-space />
        <div style="padding-right: 30px">
          line:{{ currentLine + 1 }}/{{ linesnumber }}
        </div>
      </q-bar>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { useStore } from "vuex";
import WorkspaceItem from "../components/WorkspaceItem.vue";
import BookmarkItem from "../components/BookmarkItem.vue";
import { updateStats } from "../database/firebaseActions.js";

export default defineComponent({
  name: "PageIndex",
  components: {
    WorkspaceItem,
    BookmarkItem,
  },

  data() {
    return {
      currentLine: 0,
      sortOnFileOpen: ref(true),
      removeBlankLinesOnFileOpen: ref(true),
      showLineNumbers: ref(true),
      markColors: ["#864AE0", "#EDAA5A", "#F0E92B", "#3BC1FF", "#3A50CF"],
      leftDrawerOpen: ref(false),
      searchOffset: 0,
      searchStartIndex: 0,
      searchPhrase: ref(null),
      grepToken: ref(null),
      store: useStore(),
      lineNumber: 1000,
      bookmarkLine: 0,
      workspaceIndex: ref(0),
      loading: false,
      workspaces: [],
      file: "",
      fileContent: [{ index: 1, line: "" }],
      prompt: ref(false),
      searchToken: ref(""),
      result: [],
      delay: 700,
      clicks: 0,
      timer: null,
      preprocessTokens: [],
      searchResult: [],
      lastSearchPhrase: "",
      searchResultIndex: 0,
      windowsize: 0,
      greps: [],
    };
  },
  watch: {
    file(newVal, oldVal) {
      if (newVal) {
        this.loading = true;
        setTimeout(() => {
          this.openLogFile(this.file.path);
          this.file = "";
        }, 100);
      }
    },
    workspaceIndex(newVal, oldVal) {
      console.log("wrkspcIndex", newVal);
      if (!this.getWorkspace(newVal)) this.workspaceIndex = oldVal;
    },
  },
  computed: {
    markedBookmarkId() {
      let absoluteLine =
        this.workspaces[this.workspaceIndex].content[this.currentLine];
      if (absoluteLine) {
        let bokmarks = this.$store.state.workspace.bookmarks;
        let index = bokmarks.findIndex((elem) => elem.id > absoluteLine.index);

        try {
          return bokmarks[index].id;
        } catch (error) {
          console.log(error);
        }
      }
      return 0;
    },
    bookmarks() {
      return this.$store.state.workspace.bookmarks;
    },
    linesnumber() {
      let workspace = this.getWorkspace(this.workspaceIndex);

      return workspace
        ? this.getWorkspace(this.workspaceIndex).content.length
        : 0;
    },

    workspaceHeight() {
      return this.windowsize - 94;
    },
  },
  created() {
    window.addEventListener("resize", this.resize);
  },
  methods: {
    resize() {
      this.windowsize = window.innerHeight;
    },
    pickFile() {
      this.$refs.filepicker.pickFiles();
    },
    clearEverything() {
      this.$store.commit("workspace/clearEverything");
      this.workspaces = [{ index: 0, label: "", content: [] }];
      this.leftDrawerOpen = false;
    },
    clearHighlights() {
      this.$store.commit("workspace/clearHighlights");
    },
    logLineClicked(event) {
      this.currentLine = event;
      this.searchStartIndex = event;
    },
    bookmarkWarp(event) {
      this.gotToLine(event);
    },
    oneClick(event) {
      this.clicks++;
      if (this.clicks === 1) {
        this.searchPhrase = "";
        this.timer = setTimeout(() => {
          this.clicks = 0;
        }, this.delay);
      } else {
        clearTimeout(this.timer);
        this.searchPhrase = window.getSelection().toString();
        this.clicks = 0;
      }
    },

    gotToLine(index) {
      this.currentLine = this.$refs.workspace.goToBookmark(index);
      this.searchStartIndex = index;
    },

    addBookmark(id, text, name, emot) {
      this.$store.commit("workspace/addBookMark", {
        id: id,
        text: text,
        name: name,
        emot: emot,
      });
    },
    preprocessFile(content) {
      (async () => {
        let result = window.myAPI.computeBookmarks(
          content.map((elem) => {
            return { line: elem.line, index: elem.index };
          }),
          this.preprocessTokens.map((token) => {
            return {
              phrase: token.phrase,
              regexp: token.regexp,
              emot: token.emot,
              name: token.name,
            };
          })
        );
        result.then((result) => {
          result.forEach((element) => {
            this.$store.commit("workspace/addBookmarkNoSortOrValidation", element)})
            if (this.bookmarks.length > 0) {
              this.$store.commit("workspace/sortBookmarks")
              this.leftDrawerOpen = true;
              this.loading = false;
            }
          });
      })();

      /*content.forEach((element) => {
        this.preprocessTokens.some((token) => {
          if (token.regexp) {
            var tokenRegexp = new RegExp(token.regexp);
            if (element.line.indexOf(token.phrase) > -1) {
              let regexpResult = element.line.match(tokenRegexp);
              if (regexpResult) {
                this.addBookmark(
                  element.index,
                  element.line,
                  token.name + regexpResult[1],
                  token.emot
                );
              }
              return true;
            }
          } else if (element.line.indexOf(token.phrase) > -1) {
            this.addBookmark(
              element.index,
              element.line,
              token.name,
              token.emot
            );
            return true;
          }
          return false;
        });
      });*/
    },

    markSearch(token) {
      this.workspaces.at(this.workspaceIndex).content.forEach((elem) => {
        elem.line = elem.line.replaceAll(token, "[" + token + "]");
      });
    },
    openfileDialog() {
      this.openfile();
    },
    highlight(phrase) {
      updateStats("highlights", 1);
      let highlight = phrase ? phrase : window.getSelection().toString();
      if (highlight.length > 0) {
        this.$store.commit("workspace/addHighlight", {
          higlightText: highlight,
          color:
            this.markColors[Math.floor(Math.random() * this.markColors.length)],
        });
      }
    },
    openLogFile: function (filePath) {
      updateStats("logfilesopened", 1);
      this.clearEverything();
      let x = 0;
      this.workspaces[0].content = window.myAPI.readFile(filePath).split("\n");

      if (this.sortOnFileOpen) {
        this.workspaces[0].content = this.workspaces[0].content.sort();
      }

      if (this.removeBlankLinesOnFileOpen) {
        this.workspaces[0].content = this.workspaces[0].content.filter(
          (elem) => {
            return /\S/g.test(elem);
          }
        );
      }

      this.workspaces[0].content = this.workspaces[0].content.map((elem) => {
        x++;
        return {
          index: x,
          line: elem.trim(),
        };
      });

      this.workspaces[0].contentOneLline = this.convertToOneLine(
        this.workspaces[0].content
      );
      this.workspaces[0].label = this.file.name;
      this.preprocessFile(this.workspaces[0].content);
      this.greps.forEach((grepPhrase) => {
        this.grepToken = grepPhrase;
        this.workspaceIndex = 0;
        this.grep();
        this.workspaceIndex = 0;
      });
    },
    openfile(filePath) {
      return window.myAPI.readFile(filePath);
    },
    searchOLD: function () {
      try {
        var searchregexp = new RegExp(this.searchPhrase, "i");
        let searchResult = this.workspaces
          .at(this.workspaceIndex)
          .content.find((elem) => {
            return (
              elem.index > this.searchStartIndex &&
              elem.line.match(searchregexp) != undefined
            );
          });
        this.gotToLine(searchResult.index);
        this.searchStartIndex = searchResult.index;
      } catch (error) {
        console.log(error);
      }
    },

    search() {
      //this.searchResultIndex = this.searchResult.findIndex(element => {return element.index >= this.searchStartIndex})
      if (this.lastSearchPhrase == this.searchPhrase) {
        this.searchResultIndex++;
        if (!this.searchResult[this.searchResultIndex]) {
          this.searchResultIndex = 0;
        }
        this.gotToLine(this.searchResult[this.searchResultIndex].value.index);
        return;
      }

      this.searchResult = this.find(
        this.searchPhrase,
        this.workspaces.at(this.workspaceIndex).contentOneLline,
        this.workspaces.at(this.workspaceIndex).content
      );

      this.searchResultIndex = 0;
      this.lastSearchPhrase = this.searchPhrase;
      this.gotToLine(this.searchResult[this.searchResultIndex].value.index);
    },

    convertToOneLine(content) {
      return content
        .map(
          (item, index) => '"' + index + " " + item.line.replace(/"/g, "") + '"'
        )
        .join("");
    },

    find(needle, sourceAsString, source) {
      updateStats("searches", 1);
      var rx = new RegExp('"(\\d+) ([^"]*(' + needle + ')[^"]*)"', "gi");
      var i = 0,
        results = [];
      var result;
      while ((result = rx.exec(sourceAsString))) {
        results.push(result[1]);
      }

      //console.log(results)
      return results.map((index) => ({
        index: +index,
        value: source[index],
      }));
    },

    closeTab(index) {
      this.workspaceIndex = 0;
      this.workspaces.splice(
        this.workspaces.findIndex((element) => {
          return element.index == index;
        }),
        1
      );
    },
    getWorkspace(index) {
      return this.workspaces.find((element) => {
        return element.index === this.workspaceIndex;
      });
    },

    grep: function () {
      updateStats("greps", 1);
      let grepresult = this.getWorkspace(this.workspaceIndex).content;

      var grep = new RegExp(this.grepToken, "i");
      grepresult = grepresult.filter((elem) => {
        return grep.test(elem.line);
      });

      let currentIndex = this.workspaces.at(-1).index;
      let curretnLabel = this.getWorkspace(this.workspaceIndex).label;

      this.workspaces.push({
        index: currentIndex + 1,
        label: curretnLabel + " " + this.grepToken,
        content: grepresult,
      });
      this.workspaceIndex = currentIndex + 1;
      this.workspaces[this.workspaceIndex].contentOneLline =
        this.convertToOneLine(this.workspaces[this.workspaceIndex].content);
      this.prompt = false;
      this.grepToken = "";
    },
  },
  mounted() {
    this._keyListener = function (e) {
      if (e.key === "h" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // present "Save Page" from getting triggered.
        this.highlight();
      }
      if (e.key === "g" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // present "Save Page" from getting triggered.
        this.searchToken = "";
        this.prompt = true;
        setTimeout(() => {
          this.$refs.grepInput.$el.focus();
        }, 20);
      }

      if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // present "Save Page" from getting triggered.
        setTimeout(() => {
          this.$refs.searchField.$el.focus();
        }, 20);
      }
    };

    this.windowsize = window.innerHeight;
    document.addEventListener("keydown", this._keyListener.bind(this));

    let preprocessTokensFile = JSON.parse(
      window.myAPI.readFileFromPublicFolder("preprocessTokens.json")
    );

    (async () => {
      let argv = await window.myAPI.getFileNameFromArgv();
      console.log(argv);
      if (argv[1]) {
        //this.openLogFile(argv[1]);
      }
    })();

    this.preprocessTokens = preprocessTokensFile.preprocessTokens
      ? preprocessTokensFile.preprocessTokens
      : [];
    this.greps = preprocessTokensFile.greps ? preprocessTokensFile.greps : [];
  },
});
</script>
