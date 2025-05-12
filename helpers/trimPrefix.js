module.exports = function trimPrefix(str, prefix) {
    return str.startsWith(prefix) ? str.slice(prefix.length).trim() : str;
  };