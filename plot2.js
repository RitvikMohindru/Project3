import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

d3.csv("./plots_data/fig2.csv").then((data) => {
  const svg = d3
    .select("#chart2")
    .append("svg")
    .attr("width", 800)
    .attr("height", 600);

  const maleData = data
    .filter((d) => d.gender === "Male")
    .map((d) => +d.activity);
  const femaleData = data
    .filter((d) => d.gender === "Female")
    .map((d) => +d.activity);

  const xScale = d3
    .scaleBand()
    .domain(["Male", "Female"])
    .range([100, 700])
    .padding(0.3);

  const yScale = d3.scaleLinear().domain([15, 30]).range([550, 50]);

  const boxStats = (data) => {
    const q1 = d3.quantile(data, 0.25);
    const median = d3.quantile(data, 0.5);
    const q3 = d3.quantile(data, 0.75);
    const min = d3.min(data);
    const max = d3.max(data);
    return { min, q1, median, q3, max };
  };

  const maleStats = boxStats(maleData);
  const femaleStats = boxStats(femaleData);

  svg
    .append("rect")
    .attr("x", xScale("Male"))
    .attr("y", yScale(maleStats.q3))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale(maleStats.q1) - yScale(maleStats.q3))
    .attr("fill", "#4e8bc4");

  svg
    .append("rect")
    .attr("x", xScale("Female"))
    .attr("y", yScale(femaleStats.q3))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale(femaleStats.q1) - yScale(femaleStats.q3))
    .attr("fill", "#DA4167");

  svg
    .append("line")
    .attr("x1", xScale("Male"))
    .attr("x2", xScale("Male") + xScale.bandwidth())
    .attr("y1", yScale(maleStats.median))
    .attr("y2", yScale(maleStats.median))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", xScale("Female"))
    .attr("x2", xScale("Female") + xScale.bandwidth())
    .attr("y1", yScale(femaleStats.median))
    .attr("y2", yScale(femaleStats.median))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", xScale("Male") + xScale.bandwidth() / 2)
    .attr("x2", xScale("Male") + xScale.bandwidth() / 2)
    .attr("y1", yScale(maleStats.min))
    .attr("y2", yScale(maleStats.q1))
    .attr("stroke", "black");

  svg
    .append("line")
    .attr("x1", xScale("Male") + xScale.bandwidth() / 2)
    .attr("x2", xScale("Male") + xScale.bandwidth() / 2)
    .attr("y1", yScale(maleStats.q3))
    .attr("y2", yScale(maleStats.max))
    .attr("stroke", "black");

  svg
    .append("line")
    .attr("x1", xScale("Female") + xScale.bandwidth() / 2)
    .attr("x2", xScale("Female") + xScale.bandwidth() / 2)
    .attr("y1", yScale(femaleStats.min))
    .attr("y2", yScale(femaleStats.q1))
    .attr("stroke", "black");

  svg
    .append("line")
    .attr("x1", xScale("Female") + xScale.bandwidth() / 2)
    .attr("x2", xScale("Female") + xScale.bandwidth() / 2)
    .attr("y1", yScale(femaleStats.q3))
    .attr("y2", yScale(femaleStats.max))
    .attr("stroke", "black");

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g").attr("transform", "translate(0, 550)").call(xAxis);
  svg.append("g").attr("transform", "translate(100, 0)").call(yAxis);

  svg
    .append("text")
    .attr("x", 400)
    .attr("y", 590)
    .attr("text-anchor", "middle")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "16px")
    .text("Gender");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -300)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "16px")
    .text("Activity Level");

  svg
    .append("text")
    .attr("x", 400)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Distribution of Hourly Activity Levels for Male and Female Mice")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "18px");

  const legend = svg.append("g").attr("transform", "translate(600, 50)");

  legend
    .append("circle")
    .attr("cx", 65)
    .attr("cy", 30)
    .attr("r", 4)
    .attr("fill", "#4e8bc4");

  legend
    .append("text")
    .attr("x", 75)
    .attr("y", 34)
    .text("Male")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "14px");

  const legend2 = svg.append("g").attr("transform", "translate(600, 70)");

  legend2
    .append("circle")
    .attr("cx", 65)
    .attr("cy", 30)
    .attr("r", 4)
    .attr("fill", "#DA4167");

  legend2
    .append("text")
    .attr("x", 75)
    .attr("y", 34)
    .text("Female")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "14px");

  const legendTitle = svg.append("g").attr("transform", "translate(700, 60)");

  legendTitle
    .append("text")
    .attr("x", -50)
    .attr("y", 5)
    .text("Mouse Gender")
    .style("font-family", "'Roboto', sans-serif")
    .style("font-size", "15px");
});
