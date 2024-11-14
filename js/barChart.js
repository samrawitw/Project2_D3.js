// Set SVG dimensions
const margin = { top: 40, right: 20, bottom: 50, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append SVG
const svg = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load CSV data
d3.csv("data/HM_all_stores.csv").then(data => {
    // Convert sales to numbers
    data.forEach(d => {
        d.Sales = +d.Sales;
    });

    // Set scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.Store))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Sales)])
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
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Store))
        .attr("y", d => y(d.Sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Sales))
        .on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", "orange");
        })
        .on("mouseout", (event, d) => {
            d3.select(event.target).attr("fill", "steelblue");
        });
}).catch(error => {
    console.error("Error loading data: ", error);
});
