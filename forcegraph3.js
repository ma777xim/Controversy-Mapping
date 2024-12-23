// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.appspot.com",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fetch data from Firestore
db.collection("comments-mariocoin").get().then(querySnapshot => {
    let allData = { nodes: [], links: [] };
    const data = [];

    querySnapshot.forEach(doc => {
        const entry = doc.data();
        entry.id = doc.id; // Use document ID as a unique identifier
        data.push(entry);
    });

    const container = d3.select("#mariocoinmap");

    function updateVisualization(columnForColor, columnForConnections) {
        // Clear the previous content
        container.html("");

        // Generate links based on matching words in comments
        const links = [];
        data.forEach((source, i) => {
            data.forEach((target, j) => {
                if (i < j) {
                    const sourceWords = source[columnForConnections]?.split(/\s+/) || [];
                    const targetWords = target[columnForConnections]?.split(/\s+/) || [];
                    const commonWords = sourceWords.filter(word => targetWords.includes(word));

                    if (commonWords.length > 0) {
                        links.push({
                            source: source.id,
                            target: target.id,
                            value: commonWords.length
                        });
                    }
                }
            });
        });

        const nodes = data.map(d => ({
            id: d.id,
            name: d.name || d.comment, // Use name or comment as a fallback
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
        const container = document.getElementById("mariocoinmap");
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        const svg = d3.select("#mariocoinmap").append("svg")
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

    // Initialize visualization
    updateVisualization("comment", "comment");

    // Add event listeners for selectors
    d3.select("#color-switch").on("change", function () {
        const columnForColor = this.value;
        updateVisualization(columnForColor, d3.select("#connection-filter").node().value);
    });

    d3.select("#connection-filter").on("change", function () {
        const columnForConnections = this.value;
        updateVisualization(d3.select("#color-switch").node().value, columnForConnections);
    });
});
