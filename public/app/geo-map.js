import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { useGeographic } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import geoCities from './assets/geo-cities.js';
import { convertStringToFieldParams } from 'https://saasufy.com/node_modules/saasufy-components/utils.js';

let countryLookup = {};

for (let [ country, cityCoordsInfo ] of Object.entries(geoCities || {})) {
  for (let [ city ] of Object.entries(cityCoordsInfo || {})) {
    countryLookup[city] = country;
  }
}

const MAX_CIRCLE_DIAMETER = 25;
const MIN_DENOMINATOR = 25;

useGeographic();

class GeoMap extends HTMLElement {
  constructor() {
    super();
    this.isReady = false;
    this.hasUserInteractedWithMap = false;
    this.cityScores = {};
  }

  static get observedAttributes() {
    return [
      'city-scores',
      'default-zoom',
      'default-longitude',
      'default-latitude'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isReady) return;
    if (name === 'city-scores') {
      this.renderFeatures();
      return;
    }
    this.render();
  }

  connectedCallback() {
    this.isReady = true;
    this.render();
  }

  disconnectedCallback() {
    this.map && this.map.dispose();
  }

  renderFeatures() {
    let cityScoresValue = this.getAttribute('city-scores');
    if (cityScoresValue == null) return;
    let { fieldValues: cityScores } = convertStringToFieldParams(cityScoresValue);

    let cityScoreEntries = Object.entries(cityScores).map(
      ([city, scoreString]) => [ city, Number(scoreString || 0) ]
    );

    this.cityScores = Object.fromEntries(cityScoreEntries);

    for (let [ city, score ] of cityScoreEntries) {
      let cityParts = city.split('.');
      if (cityParts.length === 1) {
        let city = cityParts[0];
        let cityMatches = city.match(/(.+) Area/i);
        if (cityMatches) {
          city = cityMatches[1];
          if (city) {
            city = city.replace(/^Greater /, '');
          }
        }
        let country = countryLookup[city];
        if (country != null) {
          let fullCity = `${country}.${city}`;
          if (this.cityScores[fullCity] == null) {
            this.cityScores[fullCity] = score;
          } else {
            this.cityScores[fullCity] += score;
          }
          delete this.cityScores[city];
        }
      }
    }

    cityScoreEntries = Object.entries(this.cityScores);

    let maxScore = 0;
    for (let [ city, score ] of cityScoreEntries) {
      if (score > maxScore) {
        maxScore = score;
      }
    }
    if (maxScore) {
      cityScoreEntries = cityScoreEntries.map(([ city, score ]) => [ city, score / Math.max(MIN_DENOMINATOR, maxScore) ]);
    }

    let mapFeatures = [];
    let sumCoords = [ 0, 0 ];
    let countCoords = 0;

    let minLong = Infinity;
    let maxLong = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (let [ city, score ] of cityScoreEntries) {
      let parts = city.split('.');
      let country;
      let cityName;
      let coords;
      if (parts.length > 1) {
        country = parts[0] || '';
        cityName = parts.slice(1).join('.');
        coords = geoCities?.[country]?.[cityName]?.coords;
      } else {
        country = '';
        cityName = parts[0];
        coords = null;
      }
      if (!coords) continue;
      let long = coords[0];
      let lat = coords[1];
      sumCoords[0] += long;
      sumCoords[1] += lat;
      if (long < minLong) {
        minLong = long
      }
      if (long > maxLong) {
        maxLong = long;
      }
      if (lat < minLat) {
        minLat = lat
      }
      if (lat > maxLat) {
        maxLat = lat;
      }
      countCoords++;
      let cityFeature = new Feature({
        geometry: new Point(coords),
        name: city
      });
      cityFeature.setStyle(
        new Style({
          image: new Circle({
            radius: Math.max(4, Math.round(score * MAX_CIRCLE_DIAMETER)),
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'white', width: 2 })
          })
        })
      );
      mapFeatures.push(cityFeature);
    }

    let vectorLayer = this.map.getLayers().getArray().find(layer => layer instanceof VectorLayer);
    let vectorLayerSource = vectorLayer.getSource();
    vectorLayerSource.clear();
    vectorLayerSource.addFeatures(mapFeatures);

    let avgCoords = countCoords ? [ sumCoords[0] / countCoords, sumCoords[1] / countCoords ] : sumCoords;
    let maxLongDist = maxLong - minLong;
    let maxLatDist = maxLat - minLat;
    let maxDist = Math.max(maxLongDist, maxLatDist);

    if (!this.hasUserInteractedWithMap && countCoords) {
      let view = this.map.getView();
      view.setCenter(avgCoords);
      if (maxDist > 200) {
        view.setZoom(2);
      } else if (maxDist > 100) {
        view.setZoom(2.5);
      }
    }
  }

  render() {
    let defaultZoomString = this.getAttribute('default-zoom');
    let defaultZoom = Number(defaultZoomString == null ? 3.5 : defaultZoomString);
    let defaultLatitude = Number(this.getAttribute('default-latitude') || 0);
    let defaultLongitude = Number(this.getAttribute('default-longitude') || 0);
    let defaultCenter = [ defaultLatitude, defaultLongitude ];

    this.innerHTML = `
      <div class="map" style="width: 100%; height: 100%;"></div>
      <div class="popup ol-popup">
        <div class="popup-content"></div>
      </div>
    `;

    let vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: []
      })
    });
    
    this.map = new OLMap({
      target: this.querySelector('.map'),
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        zoom: defaultZoom,
        center: defaultCenter
      }),
      controls: []
    });

    this.renderFeatures();

    this.map.on('pointermove', (event) => {
      if (event.dragging) {
        this.hasUserInteractedWithMap = true;
      }
    });

    this.map.getView().on('change:resolution', (event) => {
      this.hasUserInteractedWithMap = true;
    });

    let popup = new Overlay({
      element: this.querySelector('.popup'),
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    });
    this.map.addOverlay(popup);

    this.map.on('click', (event) => {
      let dataLabel = this.getAttribute('data-label');
      let feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      let cityName = feature && feature.get('name');
      let cityScore = this.cityScores[cityName];
      if (cityScore) {
        let content = this.querySelector('.popup-content');
        content.innerHTML = `${dataLabel || 'Matches'}: ${cityScore}`;
        popup.setPosition(event.coordinate);
      } else {
        popup.setPosition(undefined);
      }
    });
  }
}

window.customElements.define('geo-map', GeoMap);