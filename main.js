import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

d3.csv("./plots_data/fig3.csv")
  .then((data) => {
    data.forEach((d) => {
      d.day = parseFloat(d.day);
      d.activity = parseFloat(d.activity);
    });

    const svgWidth = 1100;
    const svgHeight = 750;
    const margin = { top: 100, right: 125, bottom: 80, left: 100 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3
      .select("#plot")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const svgSmall = d3
      .select("#small-plot-svg")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

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

    const xAxis = d3.axisBottom(xScale).tickSize(7);
    const yAxis = d3.axisLeft(yScale).tickSize(7);

    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-family", "'Merriweather'")
      .style("font-size", "15px");

    chartGroup
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-family", "'Merriweather'")
      .style("font-size", "15px");

    chartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "20px")
      .text("Day");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "20px")
      .text("Activity Level");

    svg
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "30px")
      .style("font-weight", "bolder")
      .text("How Do Daily Activity Levels Vary Between Male and Female Mice?");

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

    const verticalLine = chartGroup
      .append("line")
      .attr("stroke", "#5B5B5B")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 10")
      .attr("y1", 0)
      .attr("y2", height)
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

          tooltip
            .style("visibility", "visible")
            .html(
              `Day: ${closestDay}<br>Male Activity: ${maleActivity}<br>Female Activity: ${femaleActivity}`
            )
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);
        } else {
          verticalLine.style("visibility", "hidden");
          tooltip.style("visibility", "hidden");
        }
      })
      .on("mouseout", () => {
        verticalLine.style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
      });

    const legend = svg.append("g").attr("transform", "translate(1020, 90)");

    legend
      .append("circle")
      .attr("cx", -30)
      .attr("cy", 41)
      .attr("r", 5)
      .attr("fill", "#4e8bc4");

    legend
      .append("text")
      .attr("x", -20)
      .attr("y", 45)
      .text("Male")
      .style("font-family", "'Merriweather'")
      .style("font-size", "17px");

    const legend2 = svg.append("g").attr("transform", "translate(1020, 115)");

    legend2
      .append("circle")
      .attr("cx", -30)
      .attr("cy", 41)
      .attr("r", 5)
      .attr("fill", "#DA4167");

    legend2
      .append("text")
      .attr("x", -20)
      .attr("y", 45)
      .text("Female")
      .style("font-family", "'Merriweather'")
      .style("font-size", "17px");

    const legendTitle = svg
      .append("g")
      .attr("transform", "translate(1010, 105)");

    legendTitle
      .append("text")
      .attr("x", -50)
      .attr("y", 5)
      .text("Mouse Gender")
      .style("font-weight", "bold")
      .style("font-family", "'Merriweather'")
      .style("font-size", "18px");

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

    document.getElementById("slider").step = "1";
    const value = document.querySelector("#day-num");
    const input = document.querySelector("#slider");
    value.textContent = input.value;
    input.addEventListener("input", (event) => {
      const day = event.target.value;
      value.textContent = day;
      updateSmallGraph(day);
    });

    updateSmallGraph(1);
  })
  .catch((error) => {
    console.error("Error loading the CSV file:", error);
  });

  function updateSmallGraph(day) {
    const filePath = `./plots_data/day${day}.csv`; // Adjust the path as needed

      d3.csv(`./plots_data/day${day}.csv`)
  .then((smallData) => {
    smallData.forEach((d) => {
      d.hour = parseFloat(d.hour);
      d.activity = parseFloat(d.activity);
    });
  
      const smallWidth = 500; // Adjust as needed
      const smallHeight = 300;
      const smallMargin = { top: 50, right: 50, bottom: 50, left: 50 };
      const innerWidth = smallWidth - smallMargin.left - smallMargin.right;
      const innerHeight = smallHeight - smallMargin.top - smallMargin.bottom;
  
      const xSmallScale = d3.scaleLinear()
        .domain([1, 24])
        .range([0, innerWidth]);
  
      const ySmallScale = d3.scaleLinear()
        .domain([0, 60])
        .range([innerHeight, 0]);
  
      // Define line function
      const lineSmall = d3.line()
        .x((d) => xSmallScale(d.hour))
        .y((d) => ySmallScale(d.activity))
        .curve(d3.curveMonotoneX); // Smooth line
  
      // Clear previous graph
      d3.select("#small-plot-svg svg").remove();
  
      // Create new SVG
      const smallSvg = d3.select("#small-plot-svg")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${smallWidth} ${smallHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

        smallSvg
      .append("text")
      .attr("x", smallWidth / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "18px")
      .style("font-weight", "bolder")
      .text("Hourly Activity Levels for Male and Female Mice");

      smallSvg
  .append("text")
  .attr("x", smallWidth / 2)
  .attr("y", 30) // Adjust the y position for the second line
  .attr("text-anchor", "middle")
  .style("font-family", "'Merriweather'")
  .style("font-size", "18px")
  .style("font-weight", "bolder")
  .text("on Day " + day);
  
      const smallChartGroup = smallSvg.append("g")
        .attr("transform", `translate(${smallMargin.left}, ${smallMargin.top})`);
  
        // Filter data for male and female
      const maleSmallData = smallData.filter((d) => d.gender === "male");
      const femaleSmallData = smallData.filter((d) => d.gender === "female");
      
      // Append male line
      smallChartGroup.append("path")
        .datum(maleSmallData)
        .attr("fill", "none")
        .attr("stroke", "#4e8bc4")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);

      // Append female line
      smallChartGroup.append("path")
        .datum(femaleSmallData)
        .attr("fill", "none")
        .attr("stroke", "#DA4167")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);
  
      // Add axes
      const xAxisSmall = d3.axisBottom(xSmallScale).ticks(5);
      const yAxisSmall = d3.axisLeft(ySmallScale).ticks(5);
  
      smallChartGroup.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxisSmall);
  
      smallChartGroup.append("g").call(yAxisSmall);

      smallChartGroup
      .selectAll("circle.male")
      .data(maleSmallData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xSmallScale(d.hour))
      .attr("cy", (d) => ySmallScale(d.activity))
      .attr("r", 3)
      .attr("fill", "#4e8bc4");

      smallChartGroup
      .selectAll("circle.female")
      .data(femaleSmallData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xSmallScale(d.hour))
      .attr("cy", (d) => ySmallScale(d.activity))
      .attr("r", 3)
      .attr("fill", "#DA4167");
  
      // Axis labels
      smallChartGroup.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Hour");
  
      smallChartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Activity Level");
    })
    .catch((error) => console.error(`Error loading ${filePath}:`, error));
  }
  