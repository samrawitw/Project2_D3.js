// Set SVG dimensions
const margin = { top: 40, right: 150, bottom: 70, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append SVG group element
const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Load CSV data
d3.csv("js/data/HM_all_stores.csv").then(data => {
    console.log("Data loaded:", data);

    // Filter out invalid values and the `F` class
    const filteredData = data.filter(d => d.storeClass && d.storeClass.trim() !== "F");
    console.log("Filtered Data:", filteredData);

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
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.count) + 50]) // Max count for y-axis, with padding
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // Add X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Store Classes");

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Stores");

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
        .attr("fill", d => color(d.storeClass));

    // Add bar labels
    const labels = svg.selectAll(".label")
        .data(groupedData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.storeClass) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5) // Slightly above the bar
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.count)
        .style("opacity", 0); // Initially hidden for animation

    // Add animation (transitions)
    bars.transition()
        .duration(800) // 800ms animation
        .attr("height", d => height - y(d.count))
        .attr("y", d => y(d.count))
        .on("end", () => {
            labels.transition()
                .duration(300)
                .style("opacity", 1); // Show labels after animation
        });

    // Add interactivity
    bars.on("mouseover", (event, d) => {
            d3.select(event.target)
                .attr("fill", "orange");
        })
        .on("mouseout", (event, d) => {
            d3.select(event.target)
                .attr("fill", color(d.storeClass));
        });

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

    groupedData.forEach((d, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(d.storeClass));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .style("font-size", "12px")
            .text(d.storeClass);
    });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
