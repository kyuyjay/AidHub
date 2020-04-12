var width = 800;
var height = 600;
    

d3.json("count/cats").then(function(stats) {
    d3.select("#catlist")
        .selectAll("li")
        .data(stats)
        .enter()
        .append("li")
        .text(function(d) {
            return d._id + ": " + d.count;
        });
});

d3.json("count/outs").then(function(stats) {
    d3.select("#outlist")
        .selectAll("li")
        .data(stats)
        .enter()
        .append("li")
        .text(function(d) {
            return d._id + ": " + d.count;
        });
});

d3.json("count/hits").then(function(stats) {
    d3.select("#total")
        .text("Total views " + stats.length);

    draw(stats, "#hits");

    stats = stats.filter(function(d) {
    	return d.unique == "true";
    });

    d3.select("#total-u")
        .text("Total unique view " + stats.length);
    
    draw(stats, "#hits-u");
});

function draw(stats, div) {

    var svg = d3.select(div)
        .append("svg")
        .attr("width", width + 100)
        .attr("height", height + 100)

    var collate = d3.map();
    stats.forEach(function(d) {
        d.date = new Date(d.date);
        binned = d.date;
        binned.setMinutes(0);
        binned.setSeconds(0);
        binned.setMilliseconds(0);
        if (collate.has(binned)) {
            collate.set(binned, collate.get(binned) + 1);
        } else {
            collate.set(binned, 1);
        }
    });

    var data = [];
    collate.keys().forEach(function(d) {
        data.push({"x": d, "y": collate.get(d)});
    });

    var x_domain = d3.extent(data, function(d) {
        return new Date(d.x);
    });

    var y_domain = d3.extent(data, function(d) {
        return d.y;
    });
   
    var x = d3.scaleTime()
	.domain(x_domain)
        .range([50, width + 50]);
    
    var y = d3.scaleLinear()
        .domain(y_domain)
        .range([height + 50, 50]);

    var line = d3.line()
        .x(function(d) {
            return x(new Date(d.x));
        })
        .y(function(d) {
            return y(d.y);
        });

    svg.append("g")
        .attr("transform", "translate(0, " + (height + 50) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}
