export function create_legend() {
  var colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061",
  ];

  // Create a legend element
  var legend = document.createElement("div");
  legend.id = "legend";

  // Create a legend title
  var title = document.createElement("p");
  title.innerHTML = "Color Legend";
  title.style.fontWeight = "bold";
  legend.appendChild(title);

  // Create a legend item for each color in the array
  for (var i = 0; i < colors.length; i++) {
    var item = document.createElement("div");
    item.style.backgroundColor = colors[i];
    item.style.width = "50px";
    item.style.height = "50px";
    item.style.display = "inline-block";
    item.style.marginRight = "5px";

    var value = document.createElement("span");
    value.innerHTML = ">" + i * 10 + ""; // Calculate the legend value based on the color index
    value.style.marginLeft = "5px";
    value.style.color = "white";
    item.appendChild(value);

    legend.appendChild(item);
  }

  // Add the legend to the page
  document.body.appendChild(legend);

  // Raise the legend to the highest level above other objects
  legend.style.zIndex = "9999";

  // Set the position of the legend to fixed and top right of the screen
  legend.style.position = "fixed";
  legend.style.top = "0";
  legend.style.right = "0";
}
