// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3Vn9jXSJnQ0XC8JM64OszHpNEkvViBxA",
    authDomain: "mapping-controversies.firebaseapp.com",
    databaseURL: "https://mapping-controversies-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapping-controversies",
    storageBucket: "mapping-controversies.firebasestorage.app",
    messagingSenderId: "259825186402",
    appId: "1:259825186402:web:7c38048d67546fbe9b833b",
    measurementId: "G-Q0WM4CNVM4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch data from Firestore
async function fetchFirestoreData() {
    const mappersCollection = collection(db, "mappers");
    const snapshot = await getDocs(mappersCollection);
    const data = [];

    snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.user) {
            data.push({ id: doc.id, ...docData });
        }
    });

    return data;
}

fetchFirestoreData().then(data => {
    // Clear the previous content
    d3.select("#controversymap").html("");

    // Generate links based on identical usernames
    const links = [];
    data.forEach((source, i) => {
        data.forEach((target, j) => {
            if (i < j && source.user === target.user) {
                links.push({ source: source.id, target: target.id, value: 1 });
            }
        });
    });

    const nodes = data.map(d => ({
        id: d.id,
        name: d.user,
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

    let sizeMultiplier = 4;
    let baseSize = 1;

    function calculateRadius(degree) {
        return baseSize + degree * sizeMultiplier;
    }

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(400))
        .force("charge", d3.forceManyBody().strength(-200))
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
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => calculateRadius(d.degree))
        .attr("fill", d => d3.schemeCategory10[d.id % 10])
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
            .attr("r", d => calculateRadius(d.degree));
    });

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

    const controls = d3.select("#controls");
    controls.html(`
        <label>Base Size: <input type="range" id="base-size" min="1" max="20" value="${baseSize}" step="1"></label>
        <label>Size Multiplier: <input type="range" id="size-multiplier" min="1" max="10" value="${sizeMultiplier}" step="0.1"></label>
    `);

    d3.select("#base-size").on("input", function () {
        baseSize = +this.value;
        node.attr("r", d => calculateRadius(d.degree));
    });

    d3.select("#size-multiplier").on("input", function () {
        sizeMultiplier = +this.value;
        node.attr("r", d => calculateRadius(d.degree));
    });
}
