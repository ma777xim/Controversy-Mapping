// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = firebase.firestore();

let allData = { nodes: [], links: [] }; // For reloading dynamically
const container = d3.select("#controversymap");

function updateVisualization() {
    // Clear the previous content
    container.html("");

    // Fetch data from Firestore
    db.collection("mappers").get().then(snapshot => {
        const users = snapshot.docs.map(doc => doc.data());

        // Create nodes
        const nodes = users.map(user => ({
            id: user.username,
            name: user.username,
            degree: 0
        }));

        // Create links based on matching usernames
        const links = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                if (users[i].username === users[j].username) {
                    links.push({
                        source: users[i].username,
                        target: users[j].username,
                        value: 1
                    });
                }
            }
        }

        // Count degree
        links.forEach(link => {
            const sourceNode = nodes.find(node => node.id === link.source);
            const targetNode = nodes.find(node => node.id === link.target);
            if (sourceNode) sourceNode.degree++;
            if (targetNode) targetNode.degree++;
        });

        allData = { nodes, links }; // Cache for reuse
        createGraph({ nodes, links });
    });
}

function createGraph(data) {
    const container = document.getElementById("controversymap");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const svg = d3.select("#controversymap").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.nodes.map(d => d.id));

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
        .attr("fill", d => color(d.id)) // Dynamic color
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
updateVisualization();
