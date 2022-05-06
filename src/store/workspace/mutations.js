export const updateWorkspaceToVirtualScrollIndex = (
  state,
  { workspaceIndex, virtualScrollIndex }
) => {
  state.workspaceToVirtualScrollIndex[workspaceIndex] = virtualScrollIndex;
};

export const updateWorkspaceToBookmarkLine = (
  state,
  { workspaceIndex, bookmarkLine }
) => {
  state.workspaceToBookmarkLine[workspaceIndex] = bookmarkLine;
};

function generateEmot() {
  let max = 200;
  let min = 100;
  let randomEmot = Math.floor(Math.random() * (max - min)) + min;

  //return "&#128019;"
  return "&#128" + randomEmot + ";";
}

export const addBookMark = (state, { id, text,name, emot }) => {
  
  if (
    !state.bookmarks.find((elem) => {
      return elem.id == id;
    }) 
  ) {

    state.bookmarks.push({ id: id, text: text, emot: emot ? emot : generateEmot(), name: name });
    state.bookmarks.sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    });
  }
};

export const addBookmarkNoSortOrValidation = (state, { id, text,name, emot }) => {
    state.bookmarks.push({ id: id, text: text, emot: emot ? emot : generateEmot(), name: name });
}


export const sortBookmarks = (state) =>{
  state.bookmarks.sort((a, b) => {
    return a.id > b.id ? 1 : -1;
  });

}

export const clearHighlights = (state) => {
  state.highlights = []
}

export const clearEverything = (state) => {
  state.workspaceToVirtualScrollIndex = []
  state.workspaceToBookmarkLine = []
  state.bookmarks = []
  state.highlights = []
}

export const addHighlight = (
  state,
  { higlightText, color }
) => {
  state.highlights.push({higlightText:higlightText, color:color});
};

