let scene = 1;

function updateButtons( ) 
{
  const backBtn = document.getElementById("back");
  const nextBtn = document.getElementById("next");

  backBtn.classList.remove("disabled");
  nextBtn.classList.remove("disabled");

  if (scene === 1) backBtn.classList.add("disabled");
  if (scene === 3) nextBtn.classList.add("disabled");
  if (scene === 4) nextBtn.classList.add("disabled");
}

function drawScene(scene, data) 
{

  d3.select("#chart").selectAll("*").remove();

  const w = 1200;
  const h = 650;
  const margin = { top: 60, right: 60, bottom: 60, left: 80 };

  let sceneData = data;

  if (scene === 3) 
  {
    sceneData = data.filter(d => d.date >= new Date("2020-03-15") && d.date <= new Date("2020-03-31"));
  }

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  const x = d3.scaleTime( )
    .domain(d3.extent(sceneData, d => d.date))
    .range([margin.left, w - margin.right]);

  const yClose = d3.scaleLinear()
    .domain([
      d3.min(sceneData, d => d.lower),
      d3.max(sceneData, d => d.upper)
    ])
    .range([h - margin.bottom, margin.top]);

  const tooltip = d3.select("#tooltip");
  const bisectDate = d3.bisector(d => d.date).left;

  const hoverCircle = svg.append("circle")
    .attr("r", 6)
    .attr("class", "tooltip-circle")
    .style("display", "none");

  const hoverCircleVol = svg.append("circle")
    .attr("r", 6)
    .attr("class", "tooltip-circle")
    .style("fill", "orange")
    .style("display", "none");

  svg.append("rect")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mousemove", function(event) 
    {
      const mouseX = d3.pointer(event)[0];
      const mouseY = d3.pointer(event)[1];
      const xDate = x.invert(mouseX);
      const i = bisectDate(sceneData, xDate);

      const d = sceneData[i];
      if (!d) return;

      let hoveredColor = "steelblue";
      let hoveredY = yClose(d.close);

      if (scene >= 2) 
      {
        const yVol = d3.scaleLinear()
          .domain(d3.extent(sceneData, d => d.SD20))
          .range([h - margin.bottom, margin.top]);

        const distClose = Math.abs(yClose(d.close) - mouseY);
        const distVol = Math.abs(yVol(d.SD20) - mouseY);

        if (distVol < distClose) 
        {
          hoveredColor = "orange";
          hoveredY = yVol(d.SD20);

          hoverCircleVol
            .style("display", "")
            .attr("cx", x(d.date))
            .attr("cy", hoveredY);

          hoverCircle.style("display", "none");
        }
        else 
        {
          hoverCircle
            .style("display", "")
            .attr("cx", x(d.date))
            .attr("cy", hoveredY);

          hoverCircleVol.style("display", "none");
        }
      }
      else 
      {
        hoverCircle
          .style("display", "")
          .attr("cx", x(d.date))
          .attr("cy", hoveredY);
      }

      let html = "<strong>" + d.date.toLocaleDateString() + "</strong><br>" +
                 "Close: " + d.close.toFixed(2);

      if (scene >= 2) 
      {
        html += "<br>SD20: " + d.SD20.toFixed(2);
      }

      if (scene === 3 || scene === 4) 
      {
        html += "<br>Upper: " + d.upper.toFixed(2) +
                "<br>Lower: " + d.lower.toFixed(2);
      }

      tooltip
        .style("display", "block")
        .style("border-left", "6px solid " + hoveredColor)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 20) + "px")
        .html(html);
    })
    .on("mouseout", function() 
    {
      hoverCircle.style("display", "none");
      hoverCircleVol.style("display", "none");
      tooltip.style("display", "none");
    });

  const drawClose = () => {
    const lineClose = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.close));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", lineClose);
  };

  const drawVol = () => {
    const yVol = d3.scaleLinear()
      .domain(d3.extent(sceneData, d => d.SD20))
      .range([h - margin.bottom, margin.top]);

    const lineVol = d3.line()
      .x(d => x(d.date))
      .y(d => yVol(d.SD20));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 3)
      .attr("d", lineVol);
  };

  const drawBands = () => {
    const lineMA20 = d3.line()
      .x(d => x(d.date))
      .y(d => yClose(d.MA20));

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "none")
      .attr("stroke", "lightgreen")
      .attr("stroke-width", 3)
      .attr("d", lineMA20);

    svg.append("path")
      .datum(sceneData)
      .attr("fill", "rgba(255,0,0,0.20)")
      .attr("stroke", "none")
      .attr("pointer-events", "none")
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
  };

  const drawTrendline = () => {
    const first = sceneData[0];
    const last = sceneData[sceneData.length - 1];
    svg.append("line")
      .attr("x1", x(first.date))
      .attr("y1", yClose(first.close))
      .attr("x2", x(last.date))
      .attr("y2", yClose(last.close))
      .attr("stroke", "black")
      .attr("stroke-width", 3);
  };

  const drawCompare = () => {
    const first = sceneData[0];
    const last = sceneData[sceneData.length - 1];
    svg.append("circle")
      .attr("cx", x(first.date))
      .attr("cy", yClose(first.close))
      .attr("r", 8)
      .attr("fill", "green");
    svg.append("circle")
      .attr("cx", x(last.date))
      .attr("cy", yClose(last.close))
      .attr("r", 8)
      .attr("fill", "red");
  };

  if (scene === 1) drawClose();
  if (scene === 2) { drawClose(); drawVol(); }
  if (scene === 3) { drawClose(); drawBands(); }

  if (scene === 4) 
  {
    drawClose();
    if (document.getElementById("show-bands").checked) drawBands();
    if (document.getElementById("show-volatility").checked) drawVol();
    if (document.getElementById("draw-trendline").checked) drawTrendline();
    if (document.getElementById("compare-dates").checked) drawCompare();
  }

  svg.append("g")
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yClose));

  if (scene === 3) 
  {
    document.getElementById("bb-button").style.display = "inline-block";
  }
  else 
  {
    document.getElementById("bb-button").style.display = "none";
    document.getElementById("bb-info").style.display = "none";
  }

  if (scene === 4)
  {
    document.getElementById("explore-controls").style.display = "block";
  }
  else
  {
    document.getElementById("explore-controls").style.display = "none";
  }

  updateButtons();

document.getElementById("summary1").style.display = scene === 1 ? "block" : "none";
document.getElementById("summary2").style.display = scene === 2 ? "block" : "none";
document.getElementById("summary3").style.display = scene === 3 ? "block" : "none";
document.getElementById("summary4").style.display = scene === 4 ? "block" : "none";

document.getElementById("annotation1").style.display = scene === 1 ? "block" : "none";
document.getElementById("annotation2").style.display = scene === 2 ? "block" : "none";
document.getElementById("annotation3").style.display = scene === 3 ? "block" : "none";
document.getElementById("annotation4").style.display = scene === 4 ? "block" : "none";
}

d3.csv("AAPL.csv").then(function(data) {

  const parseDate = d3.timeParse("%Y-%m-%d");

  data.forEach(function(d) {
    d.date = parseDate(d.Date);
    d.close = +d["Close(t)"];
    d.SD20 = +d.SD20;
    d.MA20 = +d.MA20;
    d.upper = d.MA20 + (2 * d.SD20);
    d.lower = d.MA20 - (2 * d.SD20);
  });

  window.globalData = data;
  
  drawScene(scene, data);
});

document.getElementById("next").onclick = () => {
  if (scene < 4) 
  {
    scene++;
    drawScene(scene, window.globalData);
  }
};

document.getElementById("back").onclick = () => {
  if (scene > 1) 
  {
    scene--;
    drawScene(scene, window.globalData);
  }
};

document.getElementById("bb-button").onclick = () => {
  const box = document.getElementById("bb-info");
  box.style.display = box.style.display === "none" ? "block" : "none";
};

document.getElementById("reset-view").onclick = () => {
  drawScene(4, window.globalData);
};
