// 1. Carte 2D avec OpenLayers
const map2D = new ol.Map({
  target: 'map2D',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
  center: ol.proj.fromLonLat([-7.650948, 33.547681]), // EHTP Casablanca précis
  zoom: 18
})

});

const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM() // Fond OSM
    }),
    new ol.layer.Tile({ // Couche WMS depuis GeoServer
      source: new ol.source.TileWMS({
        url: 'http://localhost:8081/geoserver/sig_ehtp/wms?',
        params: {
          'LAYERS': 'sig_ehtp:Batiments', // Remplace par ton nom exact de couche
          'TILED': true,
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'TRANSPARENT': true
        },
        serverType: 'geoserver'
      })
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-7.650948, 33.547681]), // Coordonnées EHTP Casablanca
    zoom: 17
  })
});


// 2. Vue 3D avec CesiumJS
const viewer3D = new Cesium.Viewer('map3D', {
  terrainProvider: Cesium.createWorldTerrain(),
  shouldAnimate: true,
});

// 3. Commutation entre les deux
function switchTo2D() {
  document.getElementById('map2D').style.display = 'block';
  document.getElementById('map3D').style.display = 'none';
}

function switchTo3D() {
  document.getElementById('map2D').style.display = 'none';
  document.getElementById('map3D').style.display = 'block';
  viewer3D.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-7.65, 33.56, 500),
  });
}

// 4. Export simple (screenshot)
function exportMap() {
  map2D.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas');
    const size = map2D.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const transform = canvas.style.transform;
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    const link = document.createElement('a');
    link.download = 'carte.png';
    link.href = mapCanvas.toDataURL();
    link.click();
  });
  map2D.renderSync();
}

