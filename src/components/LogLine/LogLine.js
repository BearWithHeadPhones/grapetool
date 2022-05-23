let computeNumbersPanel = function (returnEmptyPanel, emot, index, id) {
  if (!returnEmptyPanel && index >= 0 && id >= 0) {
    return (
      '<span style="color:grey; background-color:#e0e0e0">' +
      emot +
      "" +
      (index + 1) +
      "|" +
      id +
      " " +
      "</span>"
    );
  }
  return "";
};

let setLineColor = function (phrase, line, color) {
  if (line.indexOf(phrase) > -1) {
    return `<span style="color:${color};">` + line + "</span>";
  }
  return line;
};

let highlightToken = function (token, line, color) {
  if (token && token.length > 0) {
    var found = new RegExp(token, "ig");
    return line.replaceAll(found, (matched) => {
      return `<span style=background-color:${color};>${matched}</span>`;
    });
  }
  return line;
};

module.exports = {
  computeNumbersPanel,
  setLineColor,
  highlightToken,
};
