// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase setup
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ensure the DOM is fully loaded before rendering
window.addEventListener("DOMContentLoaded", () => {
    const width = 1400;
    const radius = width / 2;

    const svg = d3.select("#radial-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2, width, width])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    let nodes = [];
    let links = [];

    // Fetch data from Firestore and render chart
    async function fetchAndRender() {
        try {
            const nodesSnapshot = await getDocs(collection(db, "nodes"));
            const nodeMap = {};

            // Prepare nodes
            nodes = nodesSnapshot.docs.map(doc => {
                const data = doc.data();
                if (!data.name) {
                    console.warn(`Node with ID ${doc.id} is missing a 'name' field.`);
                    return null;
                }
                nodeMap[doc.id] = { id: doc.id, name: data.name, question: data.question || null };
                return nodeMap[doc.id];
            }).filter(Boolean);

            // Prepare links
            links = [];
            nodesSnapshot.docs.forEach(doc => {
                const data = doc.data();
                Object.entries(data).forEach(([key, value]) => {
                    if (value === "edge" && nodeMap[key]) {
                        const source = nodeMap[doc.id];
                        const target = nodeMap[key];
                        if (source && target) {
                            links.push({ source, target });
                        }
                    }
                });
            });

            renderRadialBundleChart();
        } catch (error) {
            console.error("Error fetching Firebase data:", error);
        }
    }

    function renderRadialBundleChart() {
        const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
        const root = tree(bilink(d3.hierarchy({ children: nodes })
            .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

        const line = d3.lineRadial()
            .curve(d3.curveBundle.beta(0.4))
            .radius(d => d.y)
            .angle(d => d.x);

        svg.append("g")
            .selectAll("path")
            .data(links.map(link => {
                const sourceNode = root.leaves().find(node => node.data.id === link.source.id);
                const targetNode = root.leaves().find(node => node.data.id === link.target.id);
                if (sourceNode && targetNode) {
                    return {
                        path: sourceNode.path(targetNode),
                        sourceQuestion: link.source.question,
                        targetQuestion: link.target.question
                    };
                }
                return null;
            }).filter(Boolean))
            .join("path")
            .attr("d", d => d.path ? line(d.path) : null)
            .attr("stroke", d => {
                if (d.sourceQuestion && d.targetQuestion) {
                    return "blue";
                } else if ((d.sourceQuestion && !d.targetQuestion) || (!d.sourceQuestion && d.targetQuestion)) {
                    return "purple";
                } else {
                    return "red";
                }
            })
            .attr("fill", "none")
            .attr("stroke-width", 3);

        const node = svg.append("g")
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `rotate(${(d.x * 180 / Math.PI - 90)}) translate(${d.y},0)`);

        node.append("circle")
            .attr("r", 6)
            .attr("fill", "#f9f9f9");

        node.append("text")
            .attr("dy", "0.6em")
            .attr("x", d => d.x < Math.PI ? 12 : -12)
            .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
            .text(d => d.data.name)
            .attr("fill", "white");
    }

    function bilink(root) {
        const map = new Map(root.leaves().map(d => [id(d), d]));
        for (const link of links) {
            const sourceNode = map.get(link.source.id);
            const targetNode = map.get(link.target.id);
            if (sourceNode && targetNode) {
                (sourceNode.outgoing || (sourceNode.outgoing = [])).push(targetNode);
                (targetNode.incoming || (targetNode.incoming = [])).push(sourceNode);
            }
        }
        return root;
    }

    function id(node) {
        return node.id;
    }

    fetchAndRender();
});
