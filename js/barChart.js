// Set SVG dimensions
const margin = { top: 50, right: 200, bottom: 70, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append SVG group element
const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Color scale for store classes
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Tooltip setup
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("font-size", "12px");

// Load CSV data
d3.csv("js/data/HM_all_stores.csv").then(data => {
    console.log("Data loaded:", data);

    // Group data by country and count the number of stores per class in each country
    const groupedData = d3.groups(data, d => d.country)
        .map(([country, stores]) => ({
            country,
            counts: d3.rollups(
                stores,
                v => v.length, // Count stores
                d => d.storeClass // Group by storeClass
            ).map(([storeClass, count]) => ({ storeClass, count })),
            totalStores: stores.length
        }))
        .sort((a, b) => b.totalStores - a.totalStores) // Sort by total number of stores
        .slice(0, 10); // Take top 10 countries

    console.log("Grouped Data by Country:", groupedData);

    // Flatten data for stacking
    const flattenedData = groupedData.map(d => ({
        country: d.country,
        ...Object.fromEntries(d.counts.map(c => [c.storeClass, c.count]))
    }));

    console.log("Flattened Data:", flattenedData);

    // Get all unique store classes
    const classes = Array.from(new Set(data.map(d => d.storeClass)));

    // Set scales
    const x = d3.scaleBand()
        .domain(flattenedData.map(d => d.country)) // Top 10 countries for x-axis
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(flattenedData, d => d3.sum(classes.map(c => d[c] || 0)))]) // Sum of all classes
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
        .text("Top 10 Countries");

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Stores");

    // Add stacked bars
    const barGroups = svg.selectAll(".bar-group")
        .data(flattenedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.country)}, 0)`);

    classes.forEach((storeClass, index) => {
        barGroups.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d3.sum(classes.slice(0, index + 1).map(c => d[c] || 0))))
            .attr("width", x.bandwidth())
            .attr("height", d => y(d3.sum(classes.slice(0, index).map(c => d[c] || 0))) - y(d3.sum(classes.slice(0, index + 1).map(c => d[c] || 0))))
            .attr("fill", color(storeClass))
            .on("mouseover", (event, d) => {
                const value = d[storeClass] || 0;
                tooltip.style("visibility", "visible")
                    .html(`
                        <strong>Country:</strong> ${d.country}<br>
                        <strong>Class:</strong> ${storeClass}<br>
                        <strong>Count:</strong> ${value}
                    `);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY + 10}px`).style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });
    });

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

    classes.forEach((storeClass, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(storeClass));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .style("font-size", "12px")
            .text(storeClass);
    });
}).catch(error => {
    console.error("Error loading CSV:", error);
});
