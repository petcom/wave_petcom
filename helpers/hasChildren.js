module.exports = function hasChildren(navigation, index, options) {
    const next = navigation[index + 1];
    return next && next.label.trim().startsWith('--');
  };