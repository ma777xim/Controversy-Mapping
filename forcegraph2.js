d3.csv("data.csv?v=" + new Date().getTime()).then(data => {
    let allData = { nodes: [], links: [] }; // For reloading dynamically
    const container = d3.select("#controversymap");

    function updateVisualization(columnForColor, columnForConnections) {
        container.html(""); // Clear the previous content

        // Generate links based on the selected column for connections
        const links = [];
        data.forEach((source, i) => {
            data.forEach((target, j) => {
                if (i < j && source[columnForConnections] && target[columnForConnections]) {
                    if (source[columnForConnections] === target[columnForConnections]) {
                        links.push({ source: source.id, target: target.id, value: 1 });
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

        allData = { nodes, links }; // Cache for reuse
        createGraph({ nodes, links }, columnForColor);
    }

    function createGraph(data, columnForColor) {
        const container = document.getElementById("controversymap");
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        const svg = d3.select("#controversymap").append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        const color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(data.nodes.map(d => d[columnForColor]));

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(400))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", d => d.value);

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", d => 5 + d.degree) // Adjust size
            .attr("fill", d => color(d[columnForColor])) // Dynamic color
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
                .attr("cy", d => d.y);
        });

        function drag(simulation) {
            return d3.drag()
                .on("start", event => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                })
                .on("drag", event => {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("end", event => {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                });
        }
    }

    // Add New Node and Link
    function addNewNode(userInput) {
        const newId = `node${allData.nodes.length + 1}`;
        const newWords = userInput.toLowerCase().split(/\W+/); // Split into words
        const newNode = { id: newId, name: userInput, degree: 0, words: newWords };

        // Create links to nodes with shared words
        allData.nodes.forEach(existingNode => {
            const sharedWords = existingNode.words.filter(word => newWords.includes(word));
            if (sharedWords.length > 0) {
                allData.links.push({ source: existingNode.id, target: newId, value: sharedWords.length });
                existingNode.degree++;
                newNode.degree++;
            }
        });

        // Add the new node
        allData.nodes.push(newNode);
        createGraph(allData, "name"); // Re-render graph
    }

    // Event listener for form submissions
    document.getElementById("answerForm").addEventListener("submit", event => {
        event.preventDefault();
        const userInput = event.target.querySelector("input[name='answer']").value;
        if (userInput.trim()) {
            addNewNode(userInput.trim());
        }
        event.target.reset();
    });

    // Initialize visualization
    updateVisualization("gender", "all");
});
