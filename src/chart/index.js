const d3 = require('d3')
const { collapse, wrapText, helpers } = require('../utils')
const defineBoxShadow = require('../defs/box-shadow')
const defineAvatarClip = require('../defs/avatar-clip')
const render = require('./render')
const renderUpdate = require('./render-update')
const defaultConfig = require('./config')

module.exports = {
  init
}

function init(options) {
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options,
    treeData: options.data
  }

  if (!config.id) {
    console.error('react-org-chart: missing id for svg root')
    return
  }

  const {
    id,
    treeData,
    lineType,
    margin,
    nodeWidth,
    nodeSpacing,
    shouldResize,
    orientationMode
  } = config;

  let {nodeHeight} = config;

  // Get the root element
  const elem = document.querySelector(id)

  if (!elem) {
    console.error(`react-org-chart: svg root DOM node not found (id: ${id})`)
    return
  }

  // Reset in case there's any existing DOM
  elem.innerHTML = ''

  const elemWidth = elem.offsetWidth
  const elemHeight = elem.offsetHeight

  if(orientationMode === 'horizontal') {
    nodeHeight = nodeHeight - 24;
    config.nodeHeight = nodeHeight;
  }

  const orientations = {
    'horizontal': {
      nodeSize: [nodeHeight + nodeSpacing, nodeWidth + nodeSpacing],
      x: function(d) { return d.y; },
      y: function(d) { return d.x; },
      x0: function(d) { return d.y0; },
      y0: function(d) { return d.x0; },
      lineDepth: nodeWidth + 40,
      xLineSize: nodeHeight,
      yLineSize: nodeWidth,
      initialTranslate: {
        x: 20,
        y: parseInt(elemHeight / 2 - nodeHeight / 2)
      },
      arrowCollapseAngle: 135,
      arrowExpandAngle: 315
    },
    'vertical': {
      nodeSize: [nodeWidth + nodeSpacing, nodeHeight + nodeSpacing],
      x: function(d) { return d.x; },
      y: function(d) { return d.y; },
      x0: function(d) { return d.x0; },
      y0: function(d) { return d.y0; },
      lineDepth: nodeHeight + 40,
      xLineSize: nodeWidth,
      yLineSize: nodeHeight,
      initialTranslate: {
        x: parseInt(elemWidth / 2 - nodeWidth / 2),
        y: 20
      },
      arrowCollapseAngle: 45,
      arrowExpandAngle: 225
    }
  }

  const orientation = orientations[orientationMode];
  config.orientation = orientation;

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == 'angle') {
    config.lineDepthY = nodeHeight + 40
  } else {
    config.lineDepthY = nodeHeight + 60
  }

  // Setup the d3 tree layout
  config.tree = d3.layout
    .tree()
    .nodeSize(orientation.nodeSize)


  // Add svg root for d3
  const svgroot = d3
    .select(id)
    .append('svg')
    .attr('width', elemWidth)
    .attr('height', elemHeight)

  // Add our base svg group to transform when a user zooms/pans
  const svg = svgroot
    .append('g')
    .attr('transform', 'translate(' + orientation.initialTranslate.x + ',' + orientation.initialTranslate.y + ')')

  // Define box shadow and avatar border radius
  defineBoxShadow(svgroot, 'boxShadow')
  defineAvatarClip(svgroot, 'avatarClip', {
    borderRadius: 40
  })

  // Center the viewport on initial load
  treeData.x0 = 0
  treeData.y0 = elemHeight / 2

  // Collapse all of the children on initial load
  if(treeData.children) {
    treeData.children.forEach(collapse)
  }

  // Connect core variables to config so that they can be
  // used in internal rendering functions
  config.svg = svg
  config.svgroot = svgroot
  config.render = render

  // Defined zoom behavior
  const zoom = d3.behavior
    .zoom()
    // Define the [zoomOutBound, zoomInBound]
    .scaleExtent([0, 2])
    .duration(50)
    .on('zoom', renderUpdate(config))

  // Attach zoom behavior to the svg root
  svgroot.call(zoom).on("dblclick.zoom", null);

  // Define the point of origin for zoom transformations
  zoom.translate([orientation.initialTranslate.x, orientation.initialTranslate.y])

  // Add listener for when the browser or parent node resizes
  const resize = () => {
    if (!elem) {
      global.removeEventListener('resize', resize)
      return
    }

    svgroot.attr('width', elem.offsetWidth).attr('height', elem.offsetHeight)
  }

  if (shouldResize) {
    global.addEventListener('resize', resize)
  }

  // Start initial render
  render(config)

  // Update DOM root height
  d3.select(id).style('height', elemHeight + margin.top + margin.bottom)
}
