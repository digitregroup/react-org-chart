const { wrapText, helpers } = require('../utils')
const renderLines = require('./render-lines')
const onClick = require('./on-click')
const iconLink = require('./components/icon-link')

const CHART_NODE_CLASS = 'org-chart-node'
const PERSON_LINK_CLASS = 'org-chart-person-link'
const PERSON_NAME_CLASS = 'org-chart-person-name'
const PERSON_TITLE_CLASS = 'org-chart-person-title'
const PERSON_DEPARTMENT_CLASS = 'org-chart-person-dept'
const PERSON_REPORTS_CLASS = 'org-chart-person-reports'
let mouseDownCoords;
let mouseDownEvent;
const mouseMoveThreshold = 5;

function render(config) {
  const {
    svgroot,
    svg,
    tree,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    colorDepth,
    isGoneColor,
    reportsColor,
    borderColor,
    avatarWidth,
    lineDepthY,
    treeData,
    sourceNode,
    onPersonLinkClick,
    onClickCard,
    orientation,
    orientationMode
  } = config

  // Compute the new tree layout.
  const nodes = tree.nodes(treeData)
  const links = tree.links(nodes)

  config.links = links
  config.nodes = nodes

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * orientation.lineDepth
  })

  // Update the nodes
  const node = svg
    .selectAll('g.' + CHART_NODE_CLASS)
    .data(nodes.filter(d => d.id), d => d.id)
  const parentNode = sourceNode || treeData

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .insert('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', `translate(${orientation.x0(parentNode)}, ${orientation.y0(parentNode)})`)

  // Person Card Shadow
  nodeEnter
    .append('rect')
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('id', d => 'container-shadow-' + d.id)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('fill-opacity', 0.05)
    .attr('stroke-opacity', 0.025)
    .attr('filter', 'url(#boxShadow)')

  // Person Card Container
  nodeEnter
    .append('rect')
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('id', d => d.id)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('class', 'box')
    .on('click', onClickCard)

  const namePos = {
    x: nodePaddingX * 1.4 + avatarWidth,
    y: nodePaddingY * 1.8
  }

  // Person's Name
  nodeEnter
    .append('text')
    .attr('class', PERSON_NAME_CLASS)
    .attr('x', namePos.x)
    .attr('y', namePos.y)
    .style('fill', d => {
      const isGone = typeof(d.isGone) !== 'undefined' ? d.isGone : d.person.isGone;
      return isGone ? isGoneColor : colorDepth[d.depth];
    })
    .style('font-size', 16)
    .text(d => d.person.name)

  // Person's Gain
  nodeEnter
    .append('text')
    .attr('class', PERSON_TITLE_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('y', namePos.y + nodePaddingY * 1.2)
    .attr('dy', '0.1em')
    .style('font-size', 14)
    .style('fill', titleColor)
    .text(d => {
      if(typeof(d.primeHT) !== 'undefined') {
        return d.primeHT !== null ? (Math.round(d.primeHT * 100) / 100) + ' €' : '-';
      } else {
        return (Math.round((d.person.primeHT + (d.person.primeFirstHT || 0)) * 100) / 100) + ' €'
      }
    });


  // Person's Avatar
  nodeEnter
    .append('image')
    .attr('width', avatarWidth)
    .attr('height', avatarWidth)
    .attr('x', nodePaddingX)
    .attr('y', nodePaddingY)
    .attr('stroke', borderColor)
    .attr('src', d => d.person.avatar)
    .attr('xlink:href', d => d.person.avatar)
    .attr('clip-path', 'url(#avatarClip)')
    .on('click', onClickCard)


  const toggleChildrenLink = nodeEnter
    .append('g')
    .style('visibility', d => (d._children && d._children.length || !d.parent) ? 'visible' : 'hidden')
    .attr('stroke', 'none')
    .attr('fill', 'none')

  // 3.5 = arrow width or height / 2
  iconLink({
    svg: toggleChildrenLink,
    x: orientationMode === 'vertical' ? nodeWidth / 2 - 3.5 : nodeWidth - 14 - 3.5,
    y: orientationMode === 'vertical' ? nodeHeight - 14 - 3.5 : nodeHeight / 2 - 3.5,
    orientation: orientation
  });


  toggleChildrenLink
    .append('rect')
    .attr('id', function(d, i) { return 'toogle-children-link-' + d.id })
    .attr('x', orientationMode === 'vertical' ? 0 : nodeWidth - 24)
    .attr('y', orientationMode === 'vertical' ? nodeHeight - 24 : 0)
    .attr('width', orientationMode === 'vertical' ? nodeWidth : 24)
    .attr('height', orientationMode === 'vertical' ? 24 : nodeHeight)
    .attr('fill', 'transparent')
    .attr('fill-opacity', .05)
    .style('cursor', 'pointer')
    .on("mousedown", storeMousePosition)
    .on('click', function(d) {
      if (preventClick(mouseMoveThreshold)) {
        onClick(config, d)
      }
    })
    .on("mouseover", function(d,i){
      d3.select("#toogle-children-link-" + d.id).style("fill", "#007DBC");
    }).on("mouseout", function(d,i){
      d3.select("#toogle-children-link-" + d.id).style("fill", "transparent");
    });

  
  nodeEnter
    .append('rect')
    .attr('width', orientationMode === 'vertical' ? nodeWidth : nodeWidth - 24)
    .attr('height', orientationMode === 'vertical' ? nodeHeight - 24 : nodeHeight)
    .attr('id', d => 'action-box' + d.id)
    .attr('fill', 'transparent')
    .attr('stroke', 'transparent')
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .on("mouseover", function(d,i){
      d3.select("#container-shadow-" + d.id).transition().style("stroke-opacity", .8);
    }).on("mouseout", function(d,i){
      d3.select("#container-shadow-" + d.id).transition().style("stroke-opacity", .025);
    })
    .style('cursor', 'pointer')
    .on("mousedown", storeMousePosition)
    .on('click', function(d){ 
      // we have reached a big enough distance to pass over to the zoom handler
      if (preventClick(mouseMoveThreshold)) {
        onClickCard(d) 
      }
    })


  // Transition nodes to their new position.
  const nodeUpdate = node
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${orientation.x(d)}, ${orientation.y(d)})`)

  nodeUpdate
    .select('rect.box')
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', `translate(${orientation.x(parentNode)}, ${orientation.y(parentNode)})`)
    .remove()

  // Update the links
  const link = svg.selectAll('path.link').data(links, d => d.target.id)

  // Wrap the title texts
  const wrapWidth = 140

  svg.selectAll('text.unedited.' + PERSON_TITLE_CLASS).call(wrapText, wrapWidth)
  
  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
  
    // Render lines connecting nodes
    renderLines(config)
}

function storeMousePosition() {
  // create a copy of the mousedown event to propagate later if needed
  mouseDownEvent = new MouseEvent(d3.event.type, d3.event);

  // keep coords handy to check distance to see if mouse moved far enough
  mouseDownCoords = [mouseDownEvent.x, mouseDownEvent.y];
}

function preventClick(mouseMoveThreshold) {
  const mouse = [d3.event.x, d3.event.y];
  const distance = Math.sqrt(Math.pow(mouse[0] - mouseDownCoords[0], 2) + Math.pow(mouse[1] - mouseDownCoords[1], 2));
  return distance <= mouseMoveThreshold;
}

module.exports = render
