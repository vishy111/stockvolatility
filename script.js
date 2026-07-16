let scene = 1;

function drawScene(scene, data) {

  d3.select("#chart").selectAll("*").remove();

  const w = 1200;
  const h = 650;
  const margin = { top: 60, right: 60, bottom: 60, left: 80 };

  let sceneData = data;

  if (scene === 3) {
    sceneData = data.filter(d => d.date >= new Date("2020-03-15") && d.date <= new Date("2020-03-31"));
  }

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  const x = d3.scaleTime()
    .domain(d3.extent(sceneData, d => d.date))
    .range([margin.left, w - margin.right]);

  const yClose = d3.scaleLinear()
    .domain([
      d3.min(sceneData, d => d.lower),
      d3.max(sceneData, d => d.upper)
    ])
    .range([h - margin.bottom, margin.top]);

  if (scene === 1) {

    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", lineClose);

    svg.append("text")
      .attr("x", 30)
      .attr("y", 40)
      .style("font-size", "20px")
      .text("Price fluctuates but trends upward/downward.");
  }

  if (scene === 2) {

    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", lineClose);

    const yVol = d3.scaleLinear()
      .domain(d3.extent(sceneData, d => d.sd20))
      .range([h - margin.bottom, margin.top]);

    const lineVol = d3.line()
      .x(d => x(d.date))
      .y(d => yVol(d.sd20));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 3)
      .attr("d", lineVol);

    svg.append("text")
      .attr("x", 30)
      .attr("y", 40)
      .style("font-size", "20px")
      .text("Periods of high volatility correspond to sharp price movements.");
  }

  if (scene === 3) {

    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", lineClose);

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "rgba(255,0,0,0.20)")
      .attr("stroke", "none")
      .attr("d", d3.area()
        .x(d => x(d.date))
        .y0(d => yClose(d.lower))
        .y1(d => yClose(d.upper))
      );

    const lineUpper = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.upper));

    const lineLower = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.lower));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "darkred")
      .attr("stroke-width", 4)
      .attr("d", lineUpper);

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "maroon")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "6 6")
      .attr("d", lineLower);

    svg.append("text")
      .attr("x", 30)
      .attr("y", 40)
      .style("font-size", "20px")
      .text("Bands widen dramatically during volatile periods.");
  }

  svg.append("g")
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yClose));
}

d3.csv("AAPL.csv").then(function(data) {

  const parseDate = d3.timeParse("%m/%d/%Y");

  data.forEach(function(d) {
    d.date = parseDate(d.Date);
    d.close = +d["Close(t)"];
  });

  for (let i = 0; i < data.length; i++) {

    if (i < 20) {
      data[i].ma20 = data[i].close;
      data[i].sd20 = 0;
    } else {

      let window = data.slice(i - 19, i + 1);
      let closes = window.map(d => d.close);

      let mean = closes.reduce((a, b) => a + b, 0) / 20;

      let variance = closes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
      let sd = Math.sqrt(variance);

      data[i].ma20 = mean;
      data[i].sd20 = sd;
    }

    data[i].upper = data[i].ma20 + (2 * data[i].sd20);
    data[i].lower = data[i].ma20 - (2 * data[i].sd20);
  }

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
