module.exports = function eachChild(navigation, index, options) {
    let children = [];
    for (let i = index + 1; i < navigation.length; i++) {
      if (navigation[i].label.trim().startsWith('--')) {
        children.push(navigation[i]);
      } else {
        break;
      }
    }
    return children.map(child => options.fn(child)).join('');
  };