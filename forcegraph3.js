const svg = d3.select("#controversymap").append("svg")
    .attr("width", 800)
    .attr("height", 600);

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(400, 300));

let nodes = []; // Initial nodes
let links = []; // Initial links

const link = svg.append("g")
    .selectAll(".link");

const node = svg.append("g")
    .selectAll(".node");

function updateGraph(newAnswer) {
    // Tokenize the answer
    const newWords = newAnswer.toLowerCase().split(/\W+/);

    // Check for existing connections
    newWords.forEach(word => {
        nodes.forEach(existingNode => {
            if (existingNode.words.includes(word)) {
                links.push({ source: existingNode.id, target: newAnswer });
            }
        });
    });

    // Add the new node
    nodes.push({ id: newAnswer, words: newWords });

    // Update the simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();

    // Update the SVG elements
    renderGraph();
}

function renderGraph() {
    // Bind data to links
    const linkSelection = link.data(links);
    linkSelection.enter().append("line")
        .attr("class", "link")
        .merge(linkSelection)
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5);

    linkSelection.exit().remove();

    // Bind data to nodes
    const nodeSelection = node.data(nodes);
    const nodeEnter = nodeSelection.enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", "steelblue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("title").text(d => d.id);

    nodeEnter.merge(nodeSelection)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    nodeSelection.exit().remove();
}

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function submitForm(event, topic) {
    event.preventDefault();
    const form = event.target;
    const answer = form.querySelector("input[name='answer']").value;

    // Save the answer to Firestore (already in your code)
    fetch('http://localhost:3000/submit', { /*...*/ });

    // Add the answer as a new node
    updateGraph(answer);

    form.reset();
    form.classList.add('hidden');
}

if (existingNode.words.includes(word)) {
    links.push({ source: existingNode.id, target: newAnswer });
}

