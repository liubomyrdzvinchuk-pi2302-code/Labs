// Координати Коледжу (глобальна змінна)
const ourCoords = {
  latitude: 48.94321,
  longitude: 24.73380
};

let watchId = null;
let map = null;
let lastCoords = null;
let destMarker = null;

window.onload = getMyLocation;

function getMyLocation() {
  initMap();

  document.getElementById('destinationForm').onsubmit = showDestination;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(displayLocation, displayError);
    const watchButton = document.getElementById('watch');
    watchButton.onclick = watchLocation;
    const clearWatchButton = document.getElementById('clearWatch');
    clearWatchButton.onclick = clearWatch;
  } else {
    alert('Oops, no geolocation support');
  }
}

function displayLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const div = document.getElementById('location');
  div.innerHTML = `You are at Latitude: ${latitude}, Longitude: ${longitude}`;
  div.innerHTML += ` (with ${position.coords.accuracy} meters accuracy)`;

  const km = computeDistance(position.coords, ourCoords);
  const distance = document.getElementById('distance');
  distance.innerHTML = `You are ${km} km from the College`;

  lastCoords = position.coords;
  addPositionMarker(position);
}

function displayError(error) {
  const errorTypes = {
    0: 'Unknown error',
    1: 'Permission denied by user',
    2: 'Position is not available',
    3: 'Request timed out'
  };
  let errorMessage = errorTypes[error.code];
  if (error.code === 0 || error.code === 2) {
    errorMessage = errorMessage + ' ' + error.message;
  }
  const div = document.getElementById('location');
  div.innerHTML = errorMessage;
}

// Формула гаверсинуса
function computeDistance(startCoords, destCoords) {
  const startLatRads = degreesToRadians(startCoords.latitude);
  const startLongRads = degreesToRadians(startCoords.longitude);
  const destLatRads = degreesToRadians(destCoords.latitude);
  const destLongRads = degreesToRadians(destCoords.longitude);

  const Radius = 6371; // радіус Землі в км

  const distance = Math.acos(
    Math.sin(startLatRads) * Math.sin(destLatRads) +
    Math.cos(startLatRads) * Math.cos(destLatRads) *
    Math.cos(startLongRads - destLongRads)
  ) * Radius;

  return distance;
}

function degreesToRadians(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return radians;
}

function watchLocation() {
  watchId = navigator.geolocation.watchPosition(displayLocation, displayError);
}

function clearWatch() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

// Карта (Leaflet)
function initMap() {
  if (typeof L === 'undefined') {
    document.getElementById('map').innerHTML = 'Карта не завантажилась (потрібен Інтернет).';
    return;
  }
  map = L.map('map').setView([ourCoords.latitude, ourCoords.longitude], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
}

// Маркер із координатами та часом визначення
function addPositionMarker(position) {
  if (!map) return;
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const time = new Date(position.timestamp).toLocaleTimeString();
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`Координати: ${lat}, ${lon}<br>Час: ${time}`).openPopup();
  map.setView([lat, lon], 15);
}

// Пункт призначення
function showDestination(event) {
  event.preventDefault();
  const lat = parseFloat(document.getElementById('destLat').value.replace(',', '.'));
  const lon = parseFloat(document.getElementById('destLon').value.replace(',', '.'));
  const info = document.getElementById('destination');

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    info.innerHTML = 'Введіть коректні координати';
    return;
  }

  info.innerHTML = `Пункт призначення: ${lat}, ${lon}`;
  if (lastCoords) {
    const km = computeDistance(lastCoords, { latitude: lat, longitude: lon });
    info.innerHTML += `. Відстань від вас: ${km.toFixed(2)} km`;
  }

  if (map) {
    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker([lat, lon]).addTo(map);
    destMarker.bindPopup(`Пункт призначення: ${lat}, ${lon}`).openPopup();
    map.flyTo([lat, lon], 15);
  }
}
