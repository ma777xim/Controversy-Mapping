// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Chart dimensions
const width = 1800;
const height = 400;
const marginTop = 20;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;

// Fetch data from Firestore
async function fetchEdgeCounts() {
    try {
        const nodesSnapshot = await getDocs(collection(db, "nodes"));
        const nodesData = nodesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            data: doc.data()
        }));

        const frequencyMap = new Map();

        const getNodeNameById = (id) => {
            const node = nodesData.find(n => n.id === id);
            return node ? node.name : null;
        };

        nodesData.forEach(({ name, data }) => {
            if (!frequencyMap.has(name)) {
                frequencyMap.set(name, 0);
            }
            Object.entries(data).forEach(([key, value]) => {
                if (value === "edge") {
                    frequencyMap.set(name, frequencyMap.get(name) + 1);
                    const referencedNodeName = getNodeNameById(key);
                    if (referencedNodeName) {
                        if (!frequencyMap.has(referencedNodeName)) {
                            frequencyMap.set(referencedNodeName, 0);
                        }
                        frequencyMap.set(referencedNodeName, frequencyMap.get(referencedNodeName) + 1);
                    }
                }
            });
        });

        const data = Array.from(frequencyMap.entries()).map(([name, frequency]) => ({
            name,
            frequency
        }));

        if (data.length > 0) {
            createBarChart(data);
        } else {
            console.error("No data found in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
    }
}

// D3 bar chart
function createBarChart(data) {
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.frequency)]).nice()
        .range([height - marginBottom, marginTop]);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
    const yAxis = d3.axisLeft(y);

    const svg = d3.select("#barchart")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", `${width}px`)
        .style("height", `${height}px`)
        .style("font", "Inter")
        .style("font-size", "30px")
        .style("overflow", "visible");

    const bars = svg.append("g")
        .attr("fill", "#0000ff")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.frequency))
        .attr("height", d => y(0) - y(d.frequency))
        .attr("width", x.bandwidth());

    const labels = svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", d => x(d.name) + x.bandwidth() / 2)
        .attr("y", d => y(d.frequency) - 5)
        .attr("text-anchor", "middle")
        .style("font", "20px Inter")
        .style("fill", "white")
        .text(d => d.frequency);

    const gx = svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    // Only append Y-axis once here
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .attr("class", "y-axis");  // Add class for targeting

    gx.selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "20px")
        .style("font-weight", "400")
        .attr("transform", "rotate(-45)");

    // Apply styles to the Y-axis labels (only once, after it has been appended)
    svg.selectAll(".y-axis text")
        .style("font-size", "20px")  // Set font size
        .style("font-weight", "400")  // Set font weight
        .style("transform", "translateX(-10px)");  // Apply translation

    function sortBars(order) {
        data.sort(order);
        x.domain(data.map(d => d.name));

        const t = svg.transition().duration(1500);

        bars.data(data, d => d.name)
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d.name));

        labels.data(data, d => d.name)
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d.name) + x.bandwidth() / 2);

        gx.transition(t).call(xAxis).selectAll(".tick").delay((d, i) => i * 20);
    }

    d3.select("#sort-asc").on("click", () => sortBars((a, b) => a.frequency - b.frequency));
    d3.select("#sort-desc").on("click", () => sortBars((a, b) => b.frequency - a.frequency));
    d3.select("#sort-alpha").on("click", () => sortBars((a, b) => d3.ascending(a.name, b.name)));
}

document.addEventListener("DOMContentLoaded", fetchEdgeCounts);
