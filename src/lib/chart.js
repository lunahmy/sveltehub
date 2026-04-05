import * as d3 from "d3";

export function initChart(containerNode) {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const container = d3.select(containerNode);
  const stickyWrapper = container.select(".chart-sticky");

  // --- SVG ---
  const svg = stickyWrapper.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Tooltip ---
  const tooltip = stickyWrapper
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "6px")
    .style("background", "white")
    .style("border", "1px solid #999")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("z-index", 1000);

  let circles, stacked1, stacked2, x, y, r;

  // --- Load CSVs ---
  Promise.all([
    d3.csv("/data/data1.csv"),
    d3.csv("/data/data2.csv")
  ])
  .then(([raw1, raw2]) => {

    // --- DATASET 1 ---
    raw1.forEach(d => {
      d.year = +d.year;
      d.name = d.name?.trim();
    });

    stacked1 = [];
    d3.rollups(
      raw1,
      v => v.map(d => ({
        incident_id: d.incident_id,
        name: d.name
      })),
      d => d.year
    ).forEach(([year, items]) => {
      items.forEach((item, i) => {
        stacked1.push({ year, ...item, stack: i });
      });
    });

    // --- DATASET 2 ---
    raw2.forEach(d => {
      d.year = +d.year;
      d.killed = +d.killed;
      d.injured = +d.injured;
      d.Total = +d.Total;
      d.name = d.name?.trim();
    });

    stacked2 = [];
    d3.rollups(
      raw2,
      v => v.map(d => ({ ...d })),
      d => d.year
    ).forEach(([year, items]) => {
      items.forEach((item, i) => {
        stacked2.push({ ...item, stack: i });
      });
    });

    // --- SCALES ---
    x = d3.scaleLinear()
      .domain(d3.extent([...stacked1, ...stacked2], d => d.year))
      .range([0, width]);

    y = d3.scaleLinear()
      .domain([0, d3.max([...stacked1, ...stacked2], d => d.stack) + 1])
      .range([height, 0]);

    r = d3.scaleSqrt()
      .domain([0, d3.max(stacked2, d => d.Total)])
      .range([3, 15]);

    // --- AXIS ---
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // --- CIRCLES (INITIAL STATE) ---
    circles = svg.selectAll("circle")
      .data(stacked1, d => d.incident_id || d.name)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.stack))
      .attr("r", 5)
      .attr("fill", "purple")
      .attr("opacity", 0.6);

    // --- TOOLTIP ---
    circles
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            d.Total
              ? `School: ${d.name}<br>Year: ${d.year}<br>Killed: ${d.killed}<br>Injured: ${d.injured}`
              : `School: ${d.name}<br>Year: ${d.year}`
          );
      })
      .on("mousemove", (event) => {
        const [xPos, yPos] = d3.pointer(event, stickyWrapper.node());
        tooltip
          .style("left", `${xPos}px`)
          .style("top", `${yPos}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

  })
  .catch(err => console.error("Failed to load CSV:", err));

  // --- SCROLLER UPDATE FUNCTION ---
  function update(t) {
    if (!circles || !stacked2) return;

    t = Math.max(0, Math.min(1, t));

    circles.each(function(d, i) {
      const d2 = stacked2[i] || {};

      const cx = d2.year != null
        ? d3.interpolateNumber(x(d.year), x(d2.year))(t)
        : x(d.year);

      const cy = d2.stack != null
        ? d3.interpolateNumber(y(d.stack), y(d2.stack))(t)
        : y(d.stack);

      const radius1 = d.Total ? r(d.Total) : 5;
      const radius2 = d2.Total ? r(d2.Total) : radius1;
      const rInterp = d3.interpolateNumber(radius1, radius2)(t);

      const fill1 = d.Total
        ? `rgb(${Math.round(255*d.killed/d.Total)},0,${Math.round(255*d.injured/d.Total)})`
        : "purple";

      const fill2 = d2.Total
        ? `rgb(${Math.round(255*d2.killed/d2.Total)},0,${Math.round(255*d2.injured/d2.Total)})`
        : fill1;

      const fillInterp = d3.interpolateRgb(fill1, fill2)(t);

      d3.select(this)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", rInterp)
        .attr("fill", fillInterp);
    });
  }

  return { svg, tooltip, update };
}