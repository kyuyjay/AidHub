function render(nodes, links) {

    var svg = d3.select('#canvas');

    var width = document.getElementById('canvas').clientWidth;
    var height = document.getElementById('canvas').clientHeight;

    var r = 10;

    var collisionForce = d3.forceCollide(function(d) {
            return r + 10;
        })
        .strength(1);

    var centeringForce = d3.forceCenter(width/2, height/2);

    var chargeForce = d3.forceManyBody()
        .strength(-60)
        .distanceMax(function(d) {
            return r + 10;
        });

    var sim = d3.forceSimulation(nodes)
        .force("collide", collisionForce)
        .force("center", centeringForce)
        .force("charge", chargeForce)
        .on("tick", ticked(svg));

    var circles = svg.selectAll('circle')
        .data(sim.nodes());

    sim.tick(5000);

    circles.enter()
        .append('circle')
        .attr('r', r)
        .attr('cx', function(d) {
            return d.x;
        })
        .attr('cy', function(d) {
            return d.y;
        })
        .style('fill', 'steelblue')
        .style('fill-opacity', 0)
        .transition()
            .duration(300)
            .style('fill-opacity', 1);
       
    circles.transition()
        .duration(300)
        .attr('cx', function(d) {
            return d.x;
        })
        .attr('cy', function(d) {
            return d.y;
        })
        .attr('r', r)
        .style('fill', 'steelblue');

    circles.exit()
        .transition()
            .duration(300)
            .style('fill-opacity', 0)
            .remove();
}

function ticked(svg) {
    svg.selectAll('circle')
        .attr('cx', function(d) {
            return d.x;
        })
        .attr('cy', function(d) {
            return d.y;
        })
}
