

// D3 setup
const svg = d3.select("#contromap");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Constant nodes
const nodes = [
    { id: "depStoNode", label: "Department Store" },
    { id: "signaNode", label: "SIGNA" },
    { id: "shoppersNode", label: "Shoppers" },
    { id: "transportationNode", label: "Transportation" },
    { id: "employeesNode", label: "Employees" },
    { id: "managerNode", label: "Manager" },
    { id: "architectNode", label: "Architect" },
    { id: "urbanPlannerNode", label: "Urban Planner" },
    { id: "politicsNode", label: "Politics" },
    { id: "lawNode", label: "Law" },
    { id: "communityNode", label: "Community" },
    { id: "internetNode", label: "Internet" },
    { id: "onlineShoppingNode", label: "Online Shopping" },
    { id: "mediaNode", label: "Media" },
    { id: "manufacturerNode", label: "Manufacturer" },
    { id: "productNode", label: "Product" },
    { id: "rawMaterialNode", label: "Raw Materials" },
    { id: "brandsNode", label: "Brands" },
];

// Links between nodes
const links = [
    { source: "depStoNode", target: "signaNode" },
    { source: "depStoNode", target: "shoppersNode" },
    { source: "depStoNode", target: "transportationNode" },
    { source: "depStoNode", target: "employeesNode" },
    { source: "depStoNode", target: "managerNode" },
    { source: "depStoNode", target: "architectNode" },
    { source: "depStoNode", target: "urbanPlannerNode" },
    { source: "depStoNode", target: "politicsNode" },
    { source: "depStoNode", target: "lawNode" },
    { source: "depStoNode", target: "communityNode" },
    { source: "depStoNode", target: "internetNode" },
    { source: "depStoNode", target: "onlineShoppingNode" },
    { source: "depStoNode", target: "mediaNode" },
    { source: "depStoNode", target: "manufacturerNode" },
    { source: "depStoNode", target: "productNode" },
    { source: "depStoNode", target: "rawMaterialNode" },
    { source: "depStoNode", target: "brandsNode" },
];

// Force simulation
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Render links
svg.append("g")
    .attr("stroke", "#aaa")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 2);

// Render nodes
const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => {
        // Calculate node degree (number of connections)
        const degree = links.filter(link => link.source.id === d.id || link.target.id === d.id).length;
        return 10 + degree * 2; // Base size of 10, increase with degree
    })
    .attr("fill", "#69b3a2")
    .call(drag(simulation))
    .on("click", handleNodeClick);

// Render labels
svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("text-anchor", "middle")
    .attr("dy", 3)
    .attr("font-size", "12px")
    .attr("fill", "#f9f9f9")
    .text(d => d.label);

// Update positions on each tick
simulation.on("tick", () => {
    svg.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    svg.selectAll("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    svg.selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
});

// Handle node click
async function handleNodeClick(event, d) {
    const answer = prompt(`Enter your answer for ${d.label}:`);
    if (answer) {
        try {
            const docRef = doc(collection(db, "mappers"), d.id);
            await updateDoc(docRef, { userAnswer: answer });
            alert("Answer saved!");
        } catch (error) {
            console.error("Error saving answer: ", error);
            alert("Failed to save answer. Check console for details.");
        }
    }
}

// Drag behavior
function drag(simulation) {
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

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}