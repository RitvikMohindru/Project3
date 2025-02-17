import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

d3.csv("./plots_data/fig3.csv")
  .then((data) => {
    data.forEach((d) => {
      d.day = parseFloat(d.day);
      d.activity = parseFloat(d.activity);
    });

    const svgWidth = 1000;
    const svgHeight = 600;
    const margin = { top: 50, right: 100, bottom: 100, left: 100 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3
      .select("#plot")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const maleData = data.filter((d) => d.gender === "male");
    const femaleData = data.filter((d) => d.gender === "female");

    const xScale = d3.scaleLinear().domain([0.5, 14.5]).range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.activity) + 0.5])
      .range([height, 0]);

    const lineMale = d3
      .line()
      .defined((d) => !isNaN(d.activity))
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.activity));

    const lineFemale = d3
      .line()
      .defined((d) => !isNaN(d.activity))
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.activity));

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    chartGroup
      .append("path")
      .datum(maleData)
      .attr("d", lineMale)
      .attr("fill", "none")
      .attr("stroke", "#4e8bc4")
      .attr("stroke-width", 2);

    chartGroup
      .append("path")
      .datum(femaleData)
      .attr("d", lineFemale)
      .attr("fill", "none")
      .attr("stroke", "#DA4167")
      .attr("stroke-width", 2);

    chartGroup
      .selectAll("circle.male")
      .data(maleData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.day))
      .attr("cy", (d) => yScale(d.activity))
      .attr("r", 4)
      .attr("fill", "#4e8bc4");

    chartGroup
      .selectAll("circle.female")
      .data(femaleData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.day))
      .attr("cy", (d) => yScale(d.activity))
      .attr("r", 4)
      .attr("fill", "#DA4167");

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "14px");

    chartGroup
      .append("g")
      .call(yAxis)
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "14px");

    chartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "16px")
      .text("Day");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "16px")
      .text("Activity Level");

    svg
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "18px")
      .text("How Do Daily Activity Levels Vary Between Male and Female Mice?");

    const legend = svg.append("g").attr("transform", "translate(850, 50)");

    legend
      .append("circle")
      .attr("cx", -30)
      .attr("cy", 41)
      .attr("r", 4)
      .attr("fill", "#4e8bc4");

    legend
      .append("text")
      .attr("x", -20)
      .attr("y", 45)
      .text("Male")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "14px");

    const legend2 = svg.append("g").attr("transform", "translate(850, 70)");

    legend2
      .append("circle")
      .attr("cx", -30)
      .attr("cy", 41)
      .attr("r", 4)
      .attr("fill", "#DA4167");

    legend2
      .append("text")
      .attr("x", -20)
      .attr("y", 45)
      .text("Female")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "14px");

    const legendTitle = svg.append("g").attr("transform", "translate(850, 70)");

    legendTitle
      .append("text")
      .attr("x", -50)
      .attr("y", 5)
      .text("Mouse Gender")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "15px");

    // Add interactive circles
    addCircles(maleData, "male", "#4e8bc4");
    addCircles(femaleData, "female", "#DA4167");

    function addCircles(data, genderClass, color) {
      chartGroup
        .selectAll(`circle.${genderClass}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", genderClass)
        .attr("cx", (d) => xScale(d.day))
        .attr("cy", (d) => yScale(d.activity))
        .attr("r", 5)
        .attr("fill", color)
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>Day:</strong> ${d.day} <br> <strong>Activity:</strong> ${d.activity}`
            )
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("visibility", "hidden");

    // Add vertical line and tooltips for activity levels
    const verticalLine = chartGroup
      .append("line")
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4")
      .attr("y1", 0)
      .attr("y2", height)
      .style("visibility", "hidden");

    const activityTooltip = chartGroup
      .append("text")
      .attr("x", 10)
      .attr("y", 10)
      .attr("fill", "black")
      .style("font-family", "'Roboto', sans-serif")
      .style("font-size", "12px")
      .style("visibility", "hidden");

    svg
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX - margin.left);
        const closestDay = Math.round(x0);

        const maleActivity = maleData.find(
          (d) => d.day === closestDay
        )?.activity;
        const femaleActivity = femaleData.find(
          (d) => d.day === closestDay
        )?.activity;

        if (maleActivity !== undefined && femaleActivity !== undefined) {
          verticalLine
            .attr("x1", xScale(closestDay))
            .attr("x2", xScale(closestDay))
            .style("visibility", "visible");

          activityTooltip
            .attr("x", xScale(closestDay) + 10)
            .attr("y", 10)
            .html(
              `Day: ${closestDay}<br>Male Activity: ${maleActivity}<br>Female Activity: ${femaleActivity}`
            )
            .style("visibility", "visible");
        } else {
          verticalLine.style("visibility", "hidden");
          activityTooltip.style("visibility", "hidden");
        }
      })
      .on("mouseout", () => {
        verticalLine.style("visibility", "hidden");
        activityTooltip.style("visibility", "hidden");
      });
  })
  .catch((error) => {
    console.error("Error loading the CSV file:", error);
  });
