var TheNavbar = {
    template: `
        <nav id="the-navbar" class="navbar navbar-expand-md">
            <router-link class="navbar-brand" to="home">nexus</router-link>
            <div id="" class="collapse navbar-collapse nav-menu">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <router-link to="map" class="nav-link">map</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="list" class="nav-link">list</router-link>
                    </li>
                </ul>
            </div>
            <button class="navbar-toggler navbar-dark" type="button" data-toggle="collapse" data-target=".nav-menu">
                <span class="navbar-toggler-icon"></span>
            </button>
        </nav>
    `
};

var ContentMapDelete = {
    props: [
        'nodeId'
    ],
    template: `
        <div class="modal" tabindex="-1" role="dialog" id="delete">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Are you sure you want to delete this entity?</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" v-on:click="deleteContent">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        deleteContent: function() {
            fetch('/beta/nexus/content/nodes/' + this.nodeId, {
                    method: 'DELETE',
                })
                .then(response => {
                    if (!response.ok) {
                        alert('Delete operation failed :( Error ' + response.status + " " + response.statusText);
                    }
                    this.$emit('refresh');
                    $('#delete').modal('hide');
                });
        }
    }
};

var ContentMapFormNode = {
    props: [
        'node'
    ],
    template: `
        <div class="modal" tabindex="-1" role="dialog" id="formNode">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add new entity</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" class="form-control" v-model.trim="name" />
                            </div>
                            <div class="form-group">
                                <label for="type">Type</label>
                                <input type="text" id="type" class="form-control" v-model.trim="type" />
                            </div>
                            <div class="form-group">
                                <label for="sphere">Sphere</label>
                                <input type="text" id="sphere" class="form-control" v-model.trim="sphere" />
                            </div>
                            <div class="form-group">
                                <label for="activities">Activities (seperate by #)</label>
                                <input type="text" id="activities" class="form-control" v-model.trim="activities" />
                            </div>
                            <div class="form-group">
                                <label for="requests">Requests (seperate by #)</label>
                                <input type="text" id="requests" class="form-control" v-model.trim="requests" />
                            </div>
                            <div class="form-group">
                                <label for="offers">Offers (seperate by #)</label>
                                <input type="type" id="offers" class="form-control" v-model.trim="offers" />
                            </div>
                            <div class="form-group">
                                <label for="img">Image</label><br />
                                <input type="file" id="img" v-on:change="readFile" />
                            </div>
                            <div class="form-group">
                                <img id="preview" :src="img" />
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" v-on:click="addContent">{{ action }}</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            nodeId: "",
            name: "",
            type: "",
            sphere: "",
            img: "",
            activities: "",
            offers: "",
            requests: "",
            action: "Add",
            reader: new FileReader()
        }
    },
    watch: {
        node: function(node) {
            if (node != null) {
                this.nodeId = node.id;
                this.name = node.name;
                this.type = node.type;
                this.sphere = node.sphere;
                this.img = node.img;
                this.activities = this.join(node.activities);
                this.offers = this.join(node.offers);
                this.requests = this.join(node.requests);
                this.action = "Save";
            } else {
                this.nodeId = "";
                this.name = "";
                this.type = "";
                this.sphere = "";
                this.img = "";
                this.activities = "";
                this.offers = "";
                this.requests = "";
                this.action = "Add";
            }
        }
    },
    methods: {
        join: function(array) {
            var string = "";
            array.forEach(str => {
                string += ' #';
                string += str;
            });
            return string.trim();
        },
        split: function(string) {
            var array = string.split('#');
            array.shift();
            array.forEach(string => string.trim());
            return array;
        },
        readFile: function(event) {
            var self = this;
            this.reader.onload = function(e) {
                self.img = e.target.result;
            }
            this.reader.readAsDataURL(event.target.files[0]);
        },
        addContent: function() {
            if (this.reader.readyState == 2 || this.nodeId != '') {
                var payload = JSON.stringify({
                    id: this.name.toLowerCase().replace(/\s+/g, "-"),
                    name: this.name,
                    type: this.type,
                    sphere: this.sphere,
                    img: this.img,
                    activities: this.split(this.activities),
                    offers: this.split(this.offers),
                    requests: this.split(this.requests)
                });
                var response;
                if (this.nodeId != '') {
                    response = fetch('/beta/nexus/content/nodes/' + this.nodeId, { 
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: payload 
                    });
                } else {
                    response = fetch('/beta/nexus/content/nodes', { 
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json'
                        }, 
                        body: payload 
                    });
                }
                response.then(res => {
                    if (!res.ok) {
                        alert("Error " + res.status + " " + res.statusText + " :(") 
                    }
                    $('#form').modal('hide');
                    this.$emit('refresh');
    
                });
            } else {
                alert('No image uploaded!');
            }

        }
    } 
}

var ContentMapFormLink = {
    props: [
        'link'
    ],
    template: `
        <div class="modal" tabindex="-1" role="dialog" id="formLink">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add new link</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" v-on:click="addContent">{{ action }}</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            linkId: "",
            source: "",
            target: "",
            action: "Add",
        }
    },
    watch: {
        node: function(node) {
            if (link != null) {
                this.linkId = link.id;
                this.source = link.source;
                this.target = link.target;
                this.action = "Save";
            } else {
                this.linkId = "";
                this.source = "";
                this.target = "";
                this.action = "Add";
            }
        }
    },
    methods: {
        addContent: function() {
            var payload = JSON.stringify({
                id: (this.source + '-' + this.target).toLowerCase().replace(/\s+/g, "-"),
                source: this.source,
                target: this.target,
            });
            var response;
            if (this.nodeId != '') {
                response = fetch('/beta/nexus/content/links/' + this.linkId, { 
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: payload 
                });
            } else {
                response = fetch('/beta/nexus/content/links', { 
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                    body: payload 
                });
            }
            response.then(res => {
                if (!res.ok) {
                    alert("Error " + res.status + " " + res.statusText + " :(") 
                }
                $('#form').modal('hide');
                this.$emit('refresh');

            });
        }
    } 
}
var ContentMapDetails = {
    components: {
        'ContentMapDelete': ContentMapDelete
    },
    props: [
        'nodeId'
    ],
    template: `
        <div id="map-details" class="container-fluid p-3" style="border-radius: 10px; border: solid 1px black;">
            <div v-if="nodeId !== ''">
                <div class="row">
                    <div class="col">
                        <h1>{{ name }}</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="col d-flex justify-content-center">
                        <img :src="img" class="img-fluid w-100" />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span><strong>Type:</strong> {{ type }}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span><strong>Sphere:</strong> {{ sphere }}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span><strong>Activities:</strong> {{ activities }}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span><strong>Offers:</strong> {{ offers }}</span>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col">
                        <span><strong>Requests:</strong> {{ requests }}</span>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col">
                        <button class="btn btn-block btn-primary" v-on:click="$emit('edit', node)">Edit</button>
                    </div>
                    <div class="col">
                        <button class="btn btn-block btn-secondary" data-toggle="modal" data-target="#delete">Delete</button>
                    </div>
                </div>
                <ContentMapDelete :node-id="nodeId" v-on:refresh="$emit('refresh')" />
            </div>
            <div v-if="nodeId === ''">
                <span>Click on an entity!</span>
            </div>
        </div>
    `,
    watch: {
        nodeId: function() {
            fetch('/beta/nexus/content/nodes/' + this.nodeId)
                .then(response => response.json())
                .then(data => {
                    this.node = data;
                    this.name = data.name;
                    this.type = data.type;
                    this.sphere = data.sphere;
                    this.img = data.img;
                    this.activities = this.join(data.activities);
                    this.offers = this.join(data.offers);
                    this.requests = this.join(data.requests);
                })
            this.action = "Save";
        }
    },
    data: function() {
        return {
            name: "",
            type: "",
            sphere: "",
            img: "",
            activities: "",
            offers: "",
            requests: "",
            node: {}
        }
    },
    methods: {
        join: function(array) {
            var string = "";
            array.forEach(str => {
                string += ' #';
                string += str;
            });
            return string.trim();
        }
    }
    
}

var ContentHome = {
    template: `
        <div id="home">
            Welcome
        </div>
    `
}

var ContentMap = {
    components: {
        'ContentMapFormNode': ContentMapFormNode,
        'ContentMapFormLink': ContentMapFormLink,
        'ContentMapDetails': ContentMapDetails
    },
    template: `
        <div id="map" class="container-fluid">
            <div class="row">
                <div class="col-4">
                    <button type="button" class="btn btn-primary btn-block mb-3" v-on:click="addNode">
                        Add Entity
                    </button>
                    <!-- <button type="button" class="btn btn-primary btn-block mb-3" v-on:click="addLink">
                        Add link
                    </button> -->
                    <ContentMapDetails :node-id="nodeId" v-on:edit="editNode" v-on:refresh="refresh" />
                </div>
                <div class="col">
                    <svg id="canvas" class="vh-100 w-100"></svg>
                </div>
            </div>
            <ContentMapFormNode :node="node" v-on:refresh="refresh" />
            <ContentMapFormLink :link="link" v-on:refresh="refresh" />
        </div>
    `,
    data: function() {
        return {
            node: {},
            link: {},
            nodes: [],
            links: [],
            nodeId: ""
        }
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
            var getNodes = fetch('/beta/nexus/content/nodes')
                .then(response => response.json())

            var getLinks = fetch('/beta/nexus/content/links')
                .then(response => response.json())

            Promise.all([getNodes, getLinks]).then(data => {
                this.nodes = data[0].nodes;
                this.links = data[1].links;
                this.render();
            });
        },
        addNode: function() {
            this.node = null;
            $('#formNode').modal('show');
        },
        editNode: function(obj) {
            this.node = obj;
            $('#formNode').modal('show');
        },
        addLink: function(s, t) {
            var payload = JSON.stringify({
                id: (s.id + '-' + t.id).toLowerCase().replace(/\s+/g, "-"),
                source: s.id,
                target: t.id
            });
            fetch('/beta/nexus/content/links', { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: payload 
            })
            .then(res => {
                if (!res.ok) {
                    alert("Error " + res.status + " " + res.statusText + " :(") 
                }
                $('#form').modal('hide');
                this.refresh()
            });

        },
        render: function() {
            var map = this;
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

            var linkForce = d3.forceLink(this.links)
                .id(function(d) {
                    return d.id
                });

            var sim = d3.forceSimulation(this.nodes)
                .force("collide", collisionForce)
                .force("center", centeringForce)
                .force("charge", chargeForce)
                .force("links", linkForce)
                .on("tick", this.ticked(svg));

            var circles = svg.selectAll('circle')
                .data(sim.nodes());

            sim.tick(5000);

            var line;

            var connect = d3.drag()
                .on("start", function(d) {
                    line = svg.append('line')
                        .style('stroke', 'black')
                        .style('stroke-wdith', '5px')
                        .attr('x1', d.x)
                        .attr('y1', d.y)
                        .attr('x2', d.x)
                        .attr('y2', d.y);
                })
                .on("drag", function(d) {
                    line.attr('x2', d3.event.x)
                        .attr('y2', d3.event.y);
                })
                .on("end", function(d) {
                    map.nodes.forEach(function(o) {
                        if (Math.abs(d3.event.x - o.x) <= r && Math.abs(d3.event.y - o.y) <= r) {
                            if (d.id != o.id) {
                                map.addLink(d, o)
                            }
                        } else {
                            line.remove();
                        }
                    })
                });

            circles.enter()
                .append('circle')
                .attr('r', r)
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
                .on('click', function(d) {
                    map.nodeId = d.id;
                })
                .call(connect)
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

            var link = svg.append("g")
                .attr("class", "link")
                .selectAll("line")
                .data(sim.force('links').links())
                .enter()
                .append("line")
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; })
                    .style("stroke", "black")
                    .style("stroke-wdith", "5px");


        },
        ticked: function(svg) {
            svg.selectAll('circle')
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
        }
    }
};

var ContentList = {
    template: `
        <div id="list">
            list
        </div>
    `
}

const routes = [
    { path: '*', component: ContentHome},
    { path: '*/home', component: ContentHome},
    { path: '*/map', component: ContentMap},
    { path: '*/list', component: ContentList}
]

const router = new VueRouter({
    mode: 'history',
    routes: routes,
    scrollBehavior (to, from, savedPosition) {
        return { x: 0, y: 0 };
    }
});

new Vue({
    el: '#app',
    components: {
        'TheNavbar': TheNavbar,
    },
    template: `
        <div id='wrapper'>
            <TheNavbar />
            <router-view />
        </div>
    `,
    router
}).$mount('#app');
