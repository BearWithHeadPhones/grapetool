const LogLine = require("./LogLine");

describe("computeNumbersPanel", () => {
  it.each([
    [true, "😀", 0, 0, ""],
    [false, "😀", -1, 0, ""],
    [false, "😀", 0, -1, ""],
    [
      false,
      "😀",
      0,
      0,
      '<span style="color:grey; background-color:#e0e0e0">😀1|0 </span>',
    ],
    [
      false,
      "😜",
      1000,
      500,
      '<span style="color:grey; background-color:#e0e0e0">😜1001|500 </span>',
    ],
  ])(
    "computeNumbersPanel(%s,%s,%i,%i) should return %s",
    (returnEmptyPanel, emot, index, id, result) => {
      expect(
        LogLine.computeNumbersPanel(returnEmptyPanel, emot, index, id)
      ).toBe(result);
    }
  );
});

describe("setLineColor", () => {
  it.each([
    [
      "error",
      "something error something",
      "Magenta",
      '<span style="color:Magenta;">something error something</span>',
    ],
    ["blah", "something error something", "", "something error something"],
    [
      "BLAH",
      "somethingBLAHsomething",
      "Red",
      '<span style="color:Red;">somethingBLAHsomething</span>',
    ],
  ])(
    "setLineColor(%s,%s,%s) should return %s",
    (phrase, line, color, result) => {
      expect(LogLine.setLineColor(phrase, line, color)).toBe(result);
    }
  );
});

describe("highlightToken", () => {
  it.each([
    [
      "dog",
      "cat dog pig cat horse",
      "Magenta",
      "cat <span style=background-color:Magenta;>dog</span> pig cat horse",
    ],
    [
      "cat",
      "cat dog pig cat horse",
      "Magenta",
      "<span style=background-color:Magenta;>cat</span> dog pig <span style=background-color:Magenta;>cat</span> horse",
    ],
    ["monkey", "cat dog pig cat horse", "Magenta", "cat dog pig cat horse"],
  ])(
    "setLineColor(%s,%s,%s) should return %s",
    (token, line, color, result) => {
      expect(LogLine.highlightToken(token, line, color)).toBe(result);
    }
  );
});
