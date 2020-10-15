module.exports = function collapseNode(node, initAllOpen) {
  // Check if this node has children
  if (node.children) {
    node._children = node.children
    node._children.forEach((c) => collapseNode(c, initAllOpen))
    if(!initAllOpen) node.children = null
  }
}
