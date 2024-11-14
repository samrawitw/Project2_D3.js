
// Set SVG dimensions
const margin = { top: 40, right: 20, bottom: 50, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append SVG group element
const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load CSV data
d3.csv("js/data/HM_all_stores.csv").then(data => {
    console.log("Data loaded:", data);

    // Filter out rows with missing or undefined `storeClass`
    const filteredData = data.filter(d => d.storeClass);

    // Group data by `storeClass` and count the number of stores in each class
    const groupedData = d3.rollups(
        filteredData,
        v => v.length,           // Count the number of entries per class
        d => d.storeClass        // Group by `storeClass`
    ).map(([storeClass, count]) => ({ storeClass, count })); // Convert to array of objects

    console.log("Grouped Data:", groupedData);

    // Set scales
    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.storeClass)) // Store classes for x-axis
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.count)]) // Max count for y-axis
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    const bars = svg.selectAll(".bar")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.storeClass))
        .attr("width", x.bandwidth())
        .attr("y", height) // Start bars at the bottom for animation
        .attr("height", 0) // Set initial height to 0 for animation
        .attr("fill", "steelblue");

    // Add animation (transitions)
    bars.transition()
        .duration(800) // 800ms animation
        .attr("height", d => height - y(d.count))
        .attr("y", d => y(d.count));

    // Add interactivity
    bars.on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", "orange");
        })
        .on("mouseout", (event, d) => {
            d3.select(event.target).attr("fill", "steelblue");
        });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
J
