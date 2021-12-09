'use strict';

module.exports = cbo => {
  const enter = cbo.enter || (() => {});
  const leave = cbo.leave || (() => {});
  const rec = node => {
    const childCount = node.childCount;
    enter(node);
    for (let i = 0; i < childCount; i++) {
      rec(node.child(i));
    }
    leave(node);
  };
  return rec;
};
