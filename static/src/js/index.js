/**
 * Contains majority of the D3 functionality
 */

//d3.select("#landing-banner").attr("width",document.getElementById("landing-bg").clientWidth);

//Global Variables
var svg;
var sim;

var listings = [];
var genres = [["all","All Types"],["purItem","Purchase Items"],["donItem","Donate Items"],["donFunds","Donate Funds"],["info","Information"],["network","Network"],["perSer","Provide Personal Service"],["volun","Volunteer with Organization"]];
var genre;
var cats = ["All Categories", "Matching Givers to Receivers", "Local Business", "Students", "Employment", "Migrant Workers", "Low-income Households", "Elderly", "Domestic Violence", "Creative Industry", "Medical Services", "Mental Health", "Join Networks", "Obtaining Essentials", "Other Countries"]
var cat;

////////////////////// Landing Page /////////////////////////

d3.select("#micro-genres")
    .selectAll("option")
    .data(genres)
    .enter()
    .append("option")
    .attr("value",function(d) {
        return d[0]
    })
    .text(d => d[1]);

d3.select("#cats")
    .selectAll("option")
    .data(cats)
    .enter()
    .append("option")
    .attr("value",function(d) {
        return d
    })
    .text(d => d);

/////////////////////////////////////////////////////////////

//Tooltip for each listing
var tip = d3.tip()
    .direction(function(d) {
        var title_height = document.getElementById("controls").clientHeight;
        var height = window.innerHeight - title_height;
        if (d.y < height / 2) {
            return "s";
        } else {
            return "n";
        }
    })
    .html(function(d,width,height) {
        return "<div class=\"tip alert alert-dark\">" +
            "<h4>" + d.name + "</h4>" +
            "<p width=\"80px\">" + d.summary + "</p>" + 
            "<p>Date Posted: " + d.date + "</p>" +
            "</div>"
    });


////////////////////// Event Handlers /////////////////////////

$('#filter-cats').change(function() {
    genre = document.getElementById("filter-genres").value;
    cat = document.getElementById("filter-cats").value;
    filter();
});

$('#filter-genres').change(function() {
    genre = document.getElementById("filter-genres").value;
    cat = document.getElementById("filter-cats").value;
    filter();
});

$(document).on("click", "#side-toggler", function() { 
});

$(document).on("click", "#search", function() {
    search();
});

$(document).on("submit", "#search-form", function(e) {
    console.log(e)
    if (e.which == 13) {
        e.preventDefault();
        search();
    }
});

///////////////////////////////////////////////////////////////

////////////////////// Functions /////////////////////////

//Search function triggers on click from landing page
function search() {
    /*
    var title_height = document.getElementById("controls").clientHeight;
    var height = window.innerHeight - title_height;
    var width = document.getElementById("testbed").clientWidth;
    //Main Canvas
    svg = d3.select("#testbed")
        .append("svg")
        .attr("id","canvas")
        .attr("width",width)
        .attr("height",height)
        .call(function(d) {
            tip(d,width,height);
        })
        .call(function(d) {
            resize(d,sim)
        });
*/
    cat = document.getElementById("cats").value;
    genre = document.getElementById("micro-genres").value;

    //Sample dataset for development purposes
    d3.json("data").then(function(dump) {
        console.log(dump)
        listings = dump.listings;
        nav(listings);
        filter();
    });
};

//Dynamically build filter list
function nav(listings) {
    
    d3.select("#filter-genres")
        .selectAll("option")
        .data(genres)
        .enter()
        .append("option")
        .attr("value",function(d) {
            return d[0]
        })
        .text(d => d[1]);

    var default_genre = document.getElementById('filter-genres');

    for(var i, j = 0; i = default_genre.options[j]; j++) {
        if(i.value == genre) {
            default_genre.selectedIndex = j;
            break;
        }
    }

    var filter_cat = d3.select("#filter-cats")
        .selectAll("option")
        .data(cats)

    filter_cat.enter()
        .append("option")
        .attr("value",function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });
    
    var default_cat = document.getElementById('filter-cats');

    for(var i, j = 0; i = default_cat.options[j]; j++) {
        if(i.value == cat) {
            default_cat.selectedIndex = j;
            break;
        }
    }
}

//Draw nodes
function draw(f_listings) {

/*
    var title_height = document.getElementById("controls").clientHeight;
    var height = window.innerHeight - title_height;
    var width = document.getElementById("testbed").clientWidth;
*/
    d3.select("#testbed")
        .selectAll("div")
        .data([])
        .exit().remove();

    var cardbed = d3.select("#testbed")
        .selectAll("div")
        .data(f_listings);
    
    cardbed.enter()
        .append("div")
        .classed("card",true)
        .classed("mb-3",true)
        .each(function(d) {
            d3.select(this)
                .append("h5")
                .classed("card-header",true)
                .text(d.name);
            var cardbody = d3.select(this)
                .append("div")
                .classed("card-body",true)
            cardbody.append("p")
                .classed("card-text",true)
                .text(d.summary);
            if (!d.link.startsWith("http")) {
                d.link = "http://" + d.link;
            }
            cardbody.append("a")
                .attr("href",d.link)
                .classed("btn",true)
                .classed("btn-primary",true)
                .text("Get Aid");
        });
/*
    f_listings.forEach(d => d.r = 20);

    var title_height = document.getElementById("controls").clientHeight;
    var height = window.innerHeight - title_height;
    var width = document.getElementById("testbed").clientWidth;

    //Circles
    svg.selectAll("text")
        .remove();

    //Clustering positions
    var collisionForce = d3.forceCollide(function(d) {
            return d.r + 10;
        })
        .strength(1)
        .iterations(200);
    var centeringForce = d3.forceCenter(width / 2,height / 2)
    var splitForce = d3.forceRadial()
        .x(width / 2)
        .y(height / 2)
        .radius(function(d) {
            if (d[genre] != "True") {
                return 300;
            } else {
                return 0;
            }
        })
        .strength(0.4);
    var chargeForce = d3.forceManyBody()
        .strength(-60)
        .distanceMax(function(d) {
            return d.r + 10
        });

    sim = d3.forceSimulation(f_listings)
            .force("collide",collisionForce)    //Prevent node overlap
            .force("center",centeringForce)     //Center nodes onto middle of viewport
            .force("charge",chargeForce)        //Push away nodes close to each other
            .force("split",splitForce)          //Cluster nodes radially
            .on("tick",ticked);
    
    //Static force-directed graph
    sim.stop();
    sim.tick();
    sim.tick();
    sim.tick();
    sim.tick();
    sim.tick();
    sim.tick();
    sim.tick();
    sim.tick();

    //Draw circles
    var circles = svg.selectAll("circle")
        .data(sim.nodes())

    circles.exit()
        .transition()
            .duration(300)
            .style("fill-opacity",0)
            .remove();

    var nodes = circles.enter()
        .append("circle")
        .attr("r",function(d) {
            return d.r;
        })
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .style("fill-opacity",0)
        .style("fill",function(d) {
            if (d[genre] == "False") {
                return "#E6E6E6";
            } else {
                return "#F94D4D";
            }
        })
        .on("mouseover",tip.show)
        .on("mouseout",tip.hide)
        .on("click",function(d) {
            window.open(d.link);
        })
        .transition()
            .duration(300)
            .style("fill-opacity",1)
            .attr("r",function(d) {
                return d.r;
            });

    circles.transition()
        .duration(400)
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .attr("r",function(d) {
            return d.r;
        })
        .style("fill",function(d) {
            console.log(d["type"].genre)
            console.log(genre)
            if (d["type"][genre] == "False") {
                return "#E6E6E6";
            } else {
                return "#F94D4D";
            }
        });

    //If no listings found
    if (f_listings.length == 0) {
        svg_height = svg.attr("height");
        svg_width = svg.attr("width");
        svg.append("text")
            .attr("x",svg_width / 2)
            .attr("y",svg_height / 2)
            .text("No listings match your requirements")
            .classed("404",true);
        

    }
    */
}

//Static simulation
function ticked() {
    svg.selectAll("circle")
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        });
}

//Responsive design
function resize(svg,force) {
    d3.select(window)
        .on("resize",function() {
            var width = document.getElementById("testbed").clientWidth;
            var title_height = document.getElementById("controls").clientHeight;
            var height = window.innerHeight - title_height;
            // svg.attr("width",width)
            //     .attr("height",height);
            // var centeringForce = d3.forceCenter(width / 2,height / 2);
            // sim.force("center",centeringForce);
            // sim.restart();
        });
}

//Filter function
//Filters listings by user preference
function filter() {
    var filtered = listings;

    var selected_cat = document.getElementById("filter-cats").value;
    if (selected_cat != "All Categories") {
        filtered = filtered.filter(function(d) {
            return d.cat == selected_cat;
        });
    } 
    
    var selected_genre = document.getElementById("filter-genres").value;
    if (selected_genre != "all") {
        filtered = filtered.filter(function(d) {
            if ("type" in d) {
                if (selected_genre in d.type) {
                    return d["type"][selected_genre] == "True";
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
    } 

    draw(filtered);
}

