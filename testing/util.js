const getClosingPairIndex = (str, startIndex = 0) => {
  if (!str) return;
  if (str[startIndex] != "{") return -1;

  const arr = [];
  const strLength = str.length;
  for (let i = startIndex; i < strLength; ++i) {
    if (str[i] == "{") arr.push(str[i]);
    else if (str[i] == "}") arr.pop();

    if (arr.length === 0) return i;
  }
  return -1;
};

const replaceVariablesFromTemplateString = (str, replacingValue = "var") => {
  if (str.indexOf("${") < 0) return str;
  while (str.indexOf("${") > -1) {
    const index = str.indexOf("${");
    const endIndex = str.indexOf("}", index);
    if (endIndex < 0) continue;
    str = str.slice(0, index) + replacingValue + str.slice(endIndex + 1);
  }
  return str;
};

module.exports = {
  getClosingPairIndex,
  replaceVariablesFromTemplateString,
};
