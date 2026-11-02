const stations = [
  "Aluva","Pulinchodu","Companypady","Ambattukavu","Muttom","Kalamassery",
  "Cochin University","Pathadipalam","Edapally","Changampuzha Park","Palarivattom",
  "JLN Stadium","Kaloor","Town Hall","M.G. Road","Maharaja's College","Ernakulam South",
  "Kadavanthra","Elamkulam","Vyttila","Thaikoodam","Petta","Vadakkekotta","SN Junction",
  "Tripunithura Terminal"
];

const origin = document.querySelector("#origin");
const destination = document.querySelector("#destination");
const stopsContainer = document.querySelector("#stopsContainer");
const addStopButton = document.querySelector("#addStop");
const validation = document.querySelector("#validation");
const result = document.querySelector("#journeyResult");
let stops = [];

function stationOptions(selected, placeholder) {
  return `<option value="">${placeholder}</option>` + stations.map(name => `<option value="${name}" ${name === selected ? "selected" : ""}>${name}</option>`).join("");
}

function initializeEndpoints() {
  origin.innerHTML = stationOptions("Aluva", "Choose entry station");
  destination.innerHTML = stationOptions("M.G. Road", "Choose exit station");
}

function renderStops() {
  stopsContainer.innerHTML = stops.map((value, index) => `
    <div class="station-row stop-row" data-index="${index}">
      <span class="route-node stop-node" aria-hidden="true"></span>
      <label for="stop-${index}">Stop ${index + 1}</label>
      <div class="select-wrap">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-12a6 6 0 1 0-12 0c0 6.8 6 12 6 12Z"/><circle cx="12" cy="9" r="2"/></svg>
        <select id="stop-${index}" data-stop-index="${index}">${stationOptions(value, "Choose stop")}</select>
      </div>
      <div class="stop-actions" aria-label="Stop ${index + 1} controls">
        <button type="button" data-action="up" aria-label="Move stop ${index + 1} up" title="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" aria-label="Move stop ${index + 1} down" title="Move down" ${index === stops.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="remove-stop" data-action="remove" aria-label="Remove stop ${index + 1}" title="Remove">×</button>
      </div>
    </div>`).join("");
  addStopButton.disabled = stops.length >= 3;
}

addStopButton.addEventListener("click", () => {
  if (stops.length >= 3) return;
  stops.push("");
  renderStops();
  document.querySelector(`#stop-${stops.length - 1}`).focus();
});

stopsContainer.addEventListener("change", event => {
  if (!event.target.matches("select[data-stop-index]")) return;
  stops[Number(event.target.dataset.stopIndex)] = event.target.value;
  validation.textContent = "";
});

stopsContainer.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest(".stop-row");
  const index = Number(row.dataset.index);
  const action = button.dataset.action;
  if (action === "remove") stops.splice(index, 1);
  if (action === "up" && index > 0) [stops[index - 1], stops[index]] = [stops[index], stops[index - 1]];
  if (action === "down" && index < stops.length - 1) [stops[index + 1], stops[index]] = [stops[index], stops[index + 1]];
  renderStops();
});

function validateRoute(route) {
  if (!origin.value || !destination.value) return "Choose both an entry and exit station.";
  if (stops.some(stop => !stop)) return "Choose a station for every added stop, or remove the empty stop.";
  const duplicate = route.find((name, index) => route.indexOf(name) !== index);
  if (duplicate) return `${duplicate} is already in your route. Choose a different station.`;
  return "";
}

function estimateJourney(route) {
  let segments = 0;
  for (let i = 1; i < route.length; i++) segments += Math.abs(stations.indexOf(route[i]) - stations.indexOf(route[i - 1]));
  const passengers = Number(document.querySelector("#passengers").value);
  const roundTrip = document.querySelector("#travelType").value === "round";
  const baseFare = Math.min(60, Math.max(10, Math.ceil(segments / 3) * 10));
  return { duration: Math.max(7, segments * 2 + stops.length * 4), fare: baseFare * passengers * (roundTrip ? 2 : 1), passengers, roundTrip };
}

document.querySelector("#getFare").addEventListener("click", () => {
  const route = [origin.value, ...stops, destination.value];
  const error = validateRoute(route);
  validation.textContent = error;
  if (error) return;
  const estimate = estimateJourney(route);
  document.querySelector("#routeSummary").innerHTML = route.map(name => `<span class="summary-station"><i class="summary-dot"></i>${name}</span>`).join("");
  document.querySelector("#duration").textContent = `${estimate.duration} min`;
  document.querySelector("#stopCount").textContent = stops.length;
  document.querySelector("#fare").textContent = `₹${estimate.fare}`;
  document.querySelector("#tripLabel").textContent = `${estimate.roundTrip ? "Round trip" : "One way"} · ${estimate.passengers} passenger${estimate.passengers > 1 ? "s" : ""}`;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#editJourney").addEventListener("click", () => document.querySelector(".booking-card").scrollIntoView({ behavior: "smooth", block: "center" }));
document.querySelector("#resetRoute").addEventListener("click", () => {
  stops = [];
  initializeEndpoints();
  document.querySelector("#travelType").value = "one";
  document.querySelector("#passengers").value = "1";
  validation.textContent = "";
  result.hidden = true;
  renderStops();
});

initializeEndpoints();
renderStops();
