const replaceVariables = (str, replacingValue = "var") => {
  if (str.indexOf("${") < 0) return str;
  while (str.indexOf("${") > -1) {
    const index = str.indexOf("${");
    const endIndex = str.indexOf("}", index);
    if (endIndex < 0) continue;
    str = str.slice(0, index) + replacingValue + str.slice(endIndex + 1);
  }
  return str;
};

console.log(replaceVariables("12${var1}34${var2}567${var3}89"));
