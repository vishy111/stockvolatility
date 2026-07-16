console.log("JS loaded");

d3.csv("AAPL.csv").then(function(data) {
  console.log("COLUMN NAMES:", Object.keys(data[0]));
  console.log("FIRST ROW:", data[0]);
});
