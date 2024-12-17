d3.csv("data.csv?v=" + new Date().getTime()).then(data => {
    // Clear the previous content
    d3.select("#controversymap").html("");

    // Generate links based on similarity
    const links = [];
    data.forEach((source, i) => {
        data.forEach((target, j) => {
            if (i < j) {
                let similarityCount = 0;
                for (const key in source) {
                    if (source[key] === target[key]) similarityCount++;
                }
                if (similarityCount > 0) {
                    links.push({ source: source.id, target: target.id, value: similarityCount });
                }
            }
        });
    });

    const nodes = data.map(d => ({
        id: d.id,
        name: d.name,
        degree: 0,
        ...d
    }));

    // Count degree
    links.forEach(link => {
        const sourceNode = nodes.find(node => node.id === link.source);
        const targetNode = nodes.find(node => node.id === link.target);
        if (sourceNode) sourceNode.degree++;
        if (targetNode) targetNode.degree++;
    });

    // Visualization
    createGraph({ nodes, links });
});

// Graph function
function createGraph(data) {
    const container = document.getElementById("controversymap");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const svg = d3.select("#controversymap").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // Adjustable size multiplier and base size
    let sizeMultiplier = 6;
    let baseSize = 1;

    // Function to calculate radius dynamically
    function calculateRadius(degree) {
        return baseSize + degree * sizeMultiplier;
    }

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(400))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", d => d.value);

    // Create nodes
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => calculateRadius(d.degree)) // Dynamic size
        .attr("fill", d => d3.schemeCategory10[d.id % 10]) // Simple color scheme
        .call(drag(simulation));

    node.append("title")
        .text(d => `${d.name} (Degree: ${d.degree})`);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => calculateRadius(d.degree)); // Update size on tick
    });

    // Add drag functionality
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Add UI for size adjustment
    const controls = d3.select("#controls"); // Assume there is a #controls div for UI
    controls.html(`
        <label>Base Size: <input type="range" id="base-size" min="1" max="20" value="${baseSize}" step="1"></label>
        <label>Size Multiplier: <input type="range" id="size-multiplier" min="1" max="10" value="${sizeMultiplier}" step="0.1"></label>
    `);

    d3.select("#base-size").on("input", function () {
        baseSize = +this.value;
        node.attr("r", d => calculateRadius(d.degree)); // Update sizes
    });

    d3.select("#size-multiplier").on("input", function () {
        sizeMultiplier = +this.value;
        node.attr("r", d => calculateRadius(d.degree)); // Update sizes
    });
}
