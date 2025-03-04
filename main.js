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
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("transform", "translate(0, -30)");

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

        chartGroup.selectAll("circle").attr("r", 5);

        if (maleActivity !== undefined && femaleActivity !== undefined) {
          verticalLine
            .attr("x1", xScale(closestDay))
            .attr("x2", xScale(closestDay))
            .style("visibility", "visible");

          tooltip
            .style("visibility", "visible")
            .html(
              `Day: ${closestDay}<br>Male Activity: ${maleActivity.toFixed(
                2
              )}<br>Female Activity: ${femaleActivity.toFixed(2)}`
            )
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);

          chartGroup
            .selectAll("circle")
            .filter((d) => d.day === closestDay)
            .attr("r", 8);
        } else {
          verticalLine.style("visibility", "hidden");
          tooltip.style("visibility", "hidden");
          chartGroup.selectAll("circle").attr("r", 5);
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
      .attr("x", -40)
      .attr("y", 5)
      .text("Mouse Gender")
      .style("font-weight", "bold")
      .style("font-family", "'Merriweather'")
      .style("font-size", "18px");

    const legend3 = svg.append("g").attr("transform", "translate(1020, 185)");

    legend3
      .append("rect") // Change from circle to rect
      .attr("x", -45) // Adjust position (cx - r)
      .attr("y", 36) // Adjust position (cy - r)
      .attr("width", 25) // Make it square (2 * r)
      .attr("height", 10) // Make it square (2 * r)
      .attr("fill", "red")
      .attr("opacity", 0.5);

    legend3
      .append("text")
      .attr("x", -10)
      .attr("y", 45)
      .text("Yes")
      .style("font-family", "'Merriweather'")
      .style("font-size", "17px");

    const legend4 = svg.append("g").attr("transform", "translate(1020, 210)");

    legend4
      .append("rect") // Change from circle to rect
      .attr("x", -45) // Adjust position (cx - r)
      .attr("y", 36) // Adjust position (cy - r)
      .attr("width", 25) // Make it square (2 * r)
      .attr("height", 10) // Make it square (2 * r)
      .attr("fill", "orange")
      .attr("opacity", 0.4);

    legend4
      .append("text")
      .attr("x", -10)
      .attr("y", 45)
      .text("No")
      .style("font-family", "'Merriweather'")
      .style("font-size", "17px");

    const legendTitle2 = svg
      .append("g")
      .attr("transform", "translate(1010, 200)");

    legendTitle2
      .append("text")
      .attr("x", -40)
      .attr("y", 5)
      .text("Estrus")
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
          chartGroup.selectAll("circle").attr("r", 5);
        });
    }

    svg.on("mouseleave", () => {
      chartGroup.selectAll("circle").attr("r", 5); // Reset the size of all dots
    });

    const highlightLine = chartGroup
      .append("line")
      .attr("stroke", "orange")
      .attr("stroke-width", 40)
      .attr("stroke-opacity", 0.2)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("x1", xScale(1))
      .attr("x2", xScale(1))
      .style("visibility", "visible");

    document.getElementById("slider").step = "1";
    const value = document.querySelector("#day-num");
    const input = document.querySelector("#slider");
    value.textContent = input.value;
    input.addEventListener("input", (event) => {
      const day = event.target.value;
      value.textContent = day;
      updateSmallGraph(day);
      highlightLine
        .attr("x1", xScale(day))
        .attr("x2", xScale(day))
        .attr(
          "stroke",
          [2, 6, 10, 14].includes(parseInt(day)) ? "red" : "orange"
        )
        .style("visibility", "visible");
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
      const smallMargin = { top: 90, right: 50, bottom: 50, left: 50 };
      const innerWidth = smallWidth - smallMargin.left - smallMargin.right;
      const innerHeight = smallHeight - smallMargin.top - smallMargin.bottom;

      const xSmallScale = d3
        .scaleLinear()
        .domain([0.5, 24.5])
        .range([0, innerWidth]);

      const ySmallScale = d3
        .scaleLinear()
        .domain([0, 60])
        .range([innerHeight, 0]);

      // Define line function
      const lineSmall = d3
        .line()
        .x((d) => xSmallScale(d.hour))
        .y((d) => ySmallScale(d.activity));

      // Clear previous graph
      d3.select("#small-plot-svg svg").remove();

      // Create new SVG
      const smallSvg = d3
        .select("#small-plot-svg")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${smallWidth} ${smallHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      smallSvg
        .append("text")
        .attr("x", smallWidth / 2)
        .attr("y", smallHeight - 270)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "18px")
        .style("font-weight", "bolder")
        .text("Hourly Activity Levels of Male and Female Mice");

      smallSvg
        .append("text")
        .attr("x", smallWidth / 2)
        .attr("y", smallHeight - 242)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "18px")
        .style("font-weight", "bolder")
        .text("on Day " + day);

      const smallChartGroup = smallSvg
        .append("g")
        .attr(
          "transform",
          `translate(${smallMargin.left}, ${smallMargin.top})`
        );

      // Filter data for male and female
      const maleSmallData = smallData.filter((d) => d.gender === "male");
      const femaleSmallData = smallData.filter((d) => d.gender === "female");

      // Append male line
      smallChartGroup
        .append("path")
        .datum(maleSmallData)
        .attr("fill", "none")
        .attr("stroke", "#4e8bc4")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);

      // Append female line
      smallChartGroup
        .append("path")
        .datum(femaleSmallData)
        .attr("fill", "none")
        .attr("stroke", "#DA4167")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);

      // Add axes
      const xAxisSmall = d3.axisBottom(xSmallScale).ticks(12);
      const yAxisSmall = d3.axisLeft(ySmallScale).ticks(5);

      smallChartGroup
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxisSmall)
        .selectAll("text")
        .style("font-family", "'Merriweather'");

      smallChartGroup
        .append("g")
        .call(yAxisSmall)
        .selectAll("text")
        .style("font-family", "'Merriweather'");

      const smallTooltip = d3
        .select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("visibility", "hidden");

      const smallVerticalLine = smallChartGroup
        .append("line")
        .attr("stroke", "#5B5B5B")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5 10")
        .attr("y1", 0)
        .attr("y2", 165)
        .style("visibility", "hidden")
        .style("pointer-events", "none");

      smallSvg
        .append("rect")
        .attr("width", smallWidth) // Ensure it covers the full width
        .attr("height", smallHeight) // Ensure it covers the full height
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", (event) => {
          const [mouseX] = d3.pointer(event, smallSvg.node());
          let closestHour = Math.round(
            xSmallScale.invert(mouseX - smallMargin.left)
          );
          closestHour = Math.max(1, Math.min(24, closestHour));

          const maleSmallActivity = maleSmallData.find(
            (d) => d.hour === closestHour
          )?.activity;
          const femaleSmallActivity = femaleSmallData.find(
            (d) => d.hour === closestHour
          )?.activity;

          smallChartGroup.selectAll("circle").attr("r", 3);

          if (
            maleSmallActivity !== undefined &&
            femaleSmallActivity !== undefined
          ) {
            smallVerticalLine
              .attr("x1", xSmallScale(closestHour))
              .attr("x2", xSmallScale(closestHour))
              .style("visibility", "visible");

            smallTooltip
              .style("visibility", "visible")
              .html(
                `Hour: ${closestHour}<br>Male Activity: ${maleSmallActivity.toFixed(
                  2
                )}<br>Female Activity: ${femaleSmallActivity.toFixed(2)}`
              )
              .style("top", `${event.pageY - 30}px`)
              .style("left", `${event.pageX + 10}px`);

            smallChartGroup
              .selectAll("circle")
              .filter((d) => d.hour === closestHour)
              .attr("r", 6);
          } else {
            smallVerticalLine.style("visibility", "hidden");
            smallTooltip.style("visibility", "hidden");
          }
        })
        .on("mouseout", () => {
          smallVerticalLine.style("visibility", "hidden");
          smallTooltip.style("visibility", "hidden");
          smallChartGroup.selectAll("circle").attr("r", 3);
        });

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
      smallChartGroup
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Hour");

      smallChartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Activity Level");

      // Add legend
      const legend = smallSvg
        .append("g")
        .attr(
          "transform",
          `translate(${smallWidth - 100}, ${smallMargin.top})`
        );

      legend
        .append("text")
        .attr("x", 5)
        .attr("y", 3)
        .style("font-family", "'Merriweather'")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Mouse Gender");

      legend
        .append("circle")
        .attr("cx", 30)
        .attr("cy", 15)
        .attr("r", 4)
        .attr("fill", "#4e8bc4");

      legend
        .append("text")
        .attr("x", 40)
        .attr("y", 20)
        .style("font-family", "'Merriweather'")
        .style("font-size", "12px")
        .text("Male");

      legend
        .append("circle")
        .attr("cx", 30)
        .attr("cy", 33)
        .attr("r", 4)
        .attr("fill", "#DA4167");

      legend
        .append("text")
        .attr("x", 40)
        .attr("y", 38)
        .style("font-family", "'Merriweather'")
        .style("font-size", "12px")
        .text("Female");
    })
    .catch((error) => console.error(`Error loading ${filePath}:`, error));
}

const description = d3
  .select("#description-box")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 28 29`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("transform", "translate(0, 100)");

const textContent =
  "The visualizations use line charts to compare the activity levels of male (blue) and female (red) mice. Days of estrus are highlighted in light red to indicate when female mice are in this phase, while regular days are highlighted in orange. The main plot shows daily activity trends by averaging the data for male and female mice each day. The smaller subplot breaks it down further, showing hourly activity patterns for each gender.";

const wrapText = (text, width) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (testLine.length <= width) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  lines.push(currentLine);
  return lines;
};

const lines = wrapText(textContent, 75);

// Calculate the total height of the text
const lineHeight = 3.9; // Adjust as needed
const totalTextHeight = lines.length * lineHeight;

// Calculate the starting y position to center the text vertically
const boxHeight = 29; // Height of the viewBox
const startY = (boxHeight - totalTextHeight) / 2 + lineHeight / 2;

let yPosition = startY;
lines.forEach((line) => {
  description
    .append("text")
    .attr("x", 14)
    .attr("y", yPosition)
    .attr("text-anchor", "middle")
    .style("font-family", "'Merriweather'")
    .style("font-size", "2px")
    .text(line);

  yPosition += lineHeight;
});
