// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.appspot.com",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

const svg = d3.select("#controversymap");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Use D3's built-in color scheme
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Fetch and visualize the network
async function fetchNetworkData() {
    const nodes = [];
    const links = [];
    const data = {};

    const snapshot = await db.collection("mappers").get();
    snapshot.forEach(doc => {
        const node = doc.data();
        node.id = doc.id;
        nodes.push(node);

        if (!data[node.username]) data[node.username] = [];
        data[node.username].push(node.id);
    });

    Object.values(data).forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                links.push({ source: group[i], target: group[j] });
            }
        }
    });

    return { nodes, links };
}

async function updateNetwork() {
    const { nodes, links } = await fetchNetworkData();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#aaa")
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => getNodeSize(d.id, links))
        .attr("fill", (d, i) => colorScale(d.group || i)) // Assign random colors
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
}

function getNodeSize(nodeId, links) {
    const numConnections = links.filter(link => link.source.id === nodeId || link.target.id === nodeId).length;
    return Math.min(10 + numConnections * 2, 50);
}

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

updateNetwork();
