let scene = 1;

function drawScene(scene, data) {

  d3.select("#chart").selectAll("*").remove();

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

  const yClose = d3.scaleLinear()
    .domain(d3.extent(data, d => d.close))
    .range([h - margin.bottom, margin.top]);

  if (scene === 1) {

    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineClose);

    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .style("font-size", "14px")
      .text("Price fluctuates but trends upward/downward.");
  }

  if (scene === 2) {

    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineClose);

    const yVol = d3.scaleLinear()
      .domain(d3.extent(data, d => d.SD20))
      .range([h - margin.bottom, margin.top]);

    const lineVol = d3.line()
      .x(d => x(d.date))
      .y(d => yVol(d.SD20));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", lineVol);

    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .style("font-size", "14px")
      .text("Periods of high volatility corresponds to sharp price movements.");
  }

  
  if (scene === 3) {

    
    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineClose);

    
    const lineUpper = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.upper));

    const lineLower = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.lower));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", lineUpper);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", lineLower);

    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .style("font-size", "14px")
      .text("Bands widen during periods of volatility and squeeze during calm periods.");
  }

  svg.append("g")
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yClose));
}

d3.csv("AAPL.csv").then(function(data) {

  const parseDate = d3.timeParse("%Y-%m-%d");

  data.forEach(function(d) {
    d.date = parseDate(d.Date);
    d.close = +d["Close(t)"];
    d.SD20 = +d.SD20;
    d.upper = +d.Upper_Band;
    d.lower = +d.Lower_Band;
  });

  window.globalData = data;

  drawScene(scene, data);
});

document.getElementById("next").onclick = () => {
  
  scene = Math.min(scene + 1, 4);
  drawScene(scene, window.globalData);
};

document.getElementById("back").onclick = () => {
  scene = Math.max(scene - 1, 1);
  drawScene(scene, window.globalData);
};
