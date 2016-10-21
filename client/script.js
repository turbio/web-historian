const svg = d3.select("#link-view");
const width = window.innerWidth;
const height = window.innerHeight;

const color = d3.scaleOrdinal(d3.schemeCategory20);

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

const dragstarted = (d) => {
  if (!d3.event.active) {
    simulation.alphaTarget(0.3).restart();
  }

  d.fx = d.x;
  d.fy = d.y;
};

const dragged = (d) => {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

const dragended = (d) => {
  if (!d3.event.active) {
    simulation.alphaTarget(0);
  }

  d.fx = null;
  d.fy = null;
};

const unfocus = () => {
  const focusStealer = document.createElement("input");
  document.body.appendChild(focusStealer);
  focusStealer.focus();
  document.body.removeChild(focusStealer);
};

const showGraph = (graph) => {
  console.log(graph);

  const link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  const node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  const ticked = () => {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  };

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);
};

const searchUrl = (test) => {
  $('svg').text('');

  $.get(`/link?url=${test}`, (res) => {
    showGraph(res);
  });
};

$('#submit-url').on('submit', (event) => {
  event.preventDefault();
  unfocus();
  searchUrl($('#search').val());
});
