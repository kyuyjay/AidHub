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
var cats = ["All Categories", 
    "Government Measures", 
    "Matching Givers to Receivers", 
    "Local Business", 
    "Students", 
    "Employment", 
    "Migrant Workers", 
    "Low-income Households", 
    "Persons with Disabilities", 
    "Elderly", 
    "Domestic Violence", 
    "Creative Industry", 
    "Medical Services", 
    "Mental Health", 
    "Join Networks", 
    "Obtaining Essentials", 
    "Stay Home", 
    "Other Countries"];

var cat;

var tbd;

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

function out(id, name) {
    $.post("/count/outs",{"id": id, "name": name});
    return true;
}

function setDelete(name) {
    tbd = name;
}

function deleteEntry() {
    $.ajax({
        type: "DELETE",
        url: "data/" + tbd,
    });
    search();
}

///////////////////////////////////////////////////////////////

////////////////////// Functions /////////////////////////

//Search function triggers on click from landing page
function search() {
    var unique = false;
    if (document.cookie == "") {
        unique = true;
        document.cookie = "aid=hub; expires=Fri, 9 Apr 2021 12:00:00 UTC"
    }

    d3.select("#wrapper")
        .style("overflow","visible");

    d3.select("#contribute-nav-btn")
        .style("display","inline");

    cat = document.getElementById("cats").value;
    genre = document.getElementById("micro-genres").value;

    d3.json("data/" + unique).then(function(dump) {
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
            var cardhead = d3.select(this)
                .append("div")
                .classed("card-header",true)
                .classed("d-flex",true)
                .classed("justify-content-between",true)
                .classed("align-items-center",true);

            cardhead.append("h5")
                .classed("m-0",true)
                .text(d.name + " ")
                .append("span")
                    .classed("badge",true)
                    .classed("badge-primary",true)
                    .text(d.cat);

            cardhead.append("button")
                .attr("data-toggle","modal")
                .attr("data-target","#delete-popup")
                .attr("onclick",function(d) {
                    return "setDelete(\"" + d._id + "\")";
                })
                .classed("btn",true)
                .classed("btn-secondary",true)
                .text("Delete");

            var cardbody = d3.select(this)
                .append("div")
                .classed("card-body",true)

            cardbody.append("p")
                .classed("card-text",true)
                .text(d.summary);

            if (d.link != null) {
                if (!d.link.startsWith("http")) {
                    d.link = "http://" + d.link;
                }
                cardbody.append("a")
                    .attr("href",d.link)
                    .attr("target","_blank")
                    .attr("onclick","out(\"" +d._id + "\",\"" + d.name + "\")")
                    .classed("btn",true)
                    .classed("btn-primary",true)
                    .text("Go to Resource");
            }

        });
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
                    });
}

//Filter function
//Filters listings by user preference
function filter() {
    var filtered = listings;

    var selected_cat = document.getElementById("filter-cats").value;
    if (selected_cat != "All Categories") {
        $.post("count/cats/", {"name": selected_cat});
        filtered = filtered.filter(function(d) {
            if (Array.isArray(d.cat)) {
                return d.cat.includes(selected_cat);
            } else {
                return d.cat == selected_cat;
            }
        });
    } 
    
    var selected_genre = document.getElementById("filter-genres").value;
    if (selected_genre != "all") {
        filtered = filtered.filter(function(d) {
            if ("type" in d && d.type != null) {
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

