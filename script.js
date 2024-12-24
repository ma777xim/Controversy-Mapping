// Nnetwork Diagram Setup
const colorMap = {
    1: "#0000ff", // Blue - Architects
    2: "#ff0000", // Red - Green activists
    3: "#00ff00", // Green - young peeps
    4: "#ffff00", // Yellow
    5: "#ff00ff", // Magenta
    6: "#00ffff"  // Cyan
};

const svg = d3.select("#network-diagram");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Sample data for nodes and links
const nodes = [
    { id: "Maxim", group: 1 },
    { id: "Gustave", group: 1 },
    { id: "Nick", group: 2 },
    { id: "Ivan", group: 2 },
    { id: "Petzold", group: 3 },
    { id: "Jonathan", group: 4 },
    { id: "Julia", group: 4 },
    { id: "Steffi", group: 4 },
    { id: "hellow", },

];

const links = [
    { source: "Maxim", target: "Gustave" },
    { source: "Nick", target: "Maxim" },
    { source: "Nick", target: "Gustave" },
    { source: "Nick", target: "Petzold" },
    { source: "Nick", target: "Ivan" },
    { source: "Nick", target: "Julia" },
    { source: "Nick", target: "Jonathan" },
    { source: "Nick", target: "Steffi" },
    { source: "Julia", target: "Steffi" },
    { source: "Jonathan", target: "Steffi" },
    { source: "Jonathan", target: "Julia" },
    { source: "Ivan", target: "Petzold" },
    { source: "Ivan", target: "Steffi" },
    { source: "Ivan", target: "Gustave" },
    { source: "Ivan", target: "Maxim" },
    { source: "hellow", target: "Nick" },

];

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
    .attr("stroke", "#aaa")
    .selectAll("line")
    .data(links)
    .join("line");

// Add a function to calculate node size based on the number of connections
function getNodeSize(nodeId) {
    const numConnections = links.filter(link => link.source.id === nodeId || link.target.id === nodeId).length;
    return Math.min(1 + numConnections * 2, 50); // Start radius at 10, grow by 3 for each connection, but max out at 40
}

const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => getNodeSize(d.id)) // Set the radius based on the number of connections
    .attr("fill", d => colorMap[d.group] || "#000000")
    .call(drag(simulation));

node.append("title").text(d => d.id);

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
});

function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(.2).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(.05);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function addNodeToNetwork(name, group) {
    const newNode = { id: name, group: group };
    nodes.push(newNode);
    updateNetwork(); // Redraw the network
}

function addLinkToNetwork(sourceId, targetId) {
    const sourceNode = nodes.find(node => node.id === sourceId);
    const targetNode = nodes.find(node => node.id === targetId);
    if (sourceNode && targetNode) {
        links.push({ source: sourceNode, target: targetNode });
        updateNetwork(); // Redraw the network
    }
}


// Icon Interactivity
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupDescription = document.getElementById("popup-description");

document.querySelectorAll(".icon").forEach(button => {
    button.addEventListener("click", () => {
        const topic = button.getAttribute("data-topic");
        popupTitle.innerText = topic.charAt(0).toUpperCase() + topic.slice(1);
        popupDescription.innerText = `Details about ${topic}.`;
        popup.classList.remove("hidden");
    });
});

document.getElementById("close-popup").addEventListener("click", () => {
    popup.classList.add("hidden");
});

console.log("Degrees:", degrees);

