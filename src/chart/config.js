const animationDuration = 350
const shouldResize = true

// Nodes
const nodeWidth = 240
const nodeHeight = 120
const nodeSpacing = 12
const nodePaddingX = 16
const nodePaddingY = 16
const avatarWidth = 40
const nodeBorderRadius = 4
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
}

// Lines
const lineType = 'angle'
const lineDepthY = 120 /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff'
const borderColor = '#e6e8e9'
const nameColor = '#222d38'
const titleColor = '#617080'
const reportsColor = '#92A0AD'
const isGoneColor = '#888888'
const colorDepth= [
  '#b14e4a',
  '#006699',
  '#009933',
  '#993366',
  '#996633'
]

const orientationMode = 'horizontal';  /* other choise "vertical" */

const initAllOpen = false;

const onClickCard = () => {};

const config = {
  margin,
  animationDuration,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  colorDepth,
  isGoneColor,
  reportsColor,
  shouldResize,
  orientationMode,
  onClickCard,
  initAllOpen
}

module.exports = config
