d3.csv("AAPL.csv").then(function(data) {
  const parseDate = d3.timeParse("%m/%d/%Y");

  data.forEach(function(d) {
    d.date = parseDate(d.Date);
    d.close = +d["Close(t)"];
    
  });

  const w = 800;
  const h = 400;
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    
    .range([margin.left, w - margin.right]);

  
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.close))
    .range([h - margin.bottom, margin.top]);

  
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.close));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg.append("g")
    
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  
  console.log("JS running");

  
});
