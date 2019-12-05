module.exports = function iconLink({ svg, x = 5, y = 5, orientation }) {

  const container = svg
    .append('g')
    .attr('stroke', 'none')
    .attr('fill', 'none')
    .style('cursor', 'pointer')
    .append('g')

  const icon = container
    .append('g')
    .attr('id', 'icon')
    .attr('fill', '#92a0ad')
    .attr('transform', `translate(${x}, ${y})`)

  const arrow = icon
    .append('g')
    .attr('id', d => 'arrow' + d.person.id)
    .attr(
      'transform',
      d => {
        if (d.children) {
          // Collapse the children
          return 'transform', 'translate(3.5, 3.5) scale(-1, 1) translate(-3.5, -3.5) rotate(' + orientation.arrowCollapseAngle + ', 3.5, 3.5)';
        } else {
          // Expand the children
          return 'transform', 'translate(3.5, 3.5) scale(-1, 1) translate(-3.5, -3.5) rotate(' + orientation.arrowExpandAngle + ', 3.5, 3.5)';
        }
      }
    )

  arrow
    .append('path')
    .attr('d', 'M3.41421356,2 L8.70710678,7.29289322 C9.09763107,7.68341751 9.09763107,8.31658249 8.70710678,8.70710678 C8.31658249,9.09763107 7.68341751,9.09763107 7.29289322,8.70710678 L2,3.41421356 L2,7 C2,7.55228475 1.55228475,8 1,8 C0.44771525,8 0,7.55228475 0,7 L0,1.49100518 C0,0.675320548 0.667758414,0 1.49100518,0 L7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 L3.41421356,2 Z')

  icon
    .append('rect')
    .attr('id', 'bounds')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 7)
    .attr('height', 7)
    .attr('fill', 'transparent')
}
  