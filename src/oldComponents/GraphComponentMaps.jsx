import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración de icono circular con un estilo más elegante
const circleIcon = L.divIcon({
  html: `<div style="
    width: 24px; 
    height: 24px; 
    background: linear-gradient(135deg, #FFB3BA, #FFDFBA);
    border: 2px solid #FFDFBA; 
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  "></div>`,
  iconSize: [28, 28],
  className: '',
});

// Función para calcular la distancia entre dos coordenadas usando la fórmula de Haversine.
const computeDistance = (coord1, coord2) => {
  const toRad = (x) => x * Math.PI / 180;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371e3; // radio de la Tierra en metros
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const dφ = toRad(lat2 - lat1);
  const dλ = toRad(lon2 - lon1);
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distancia en metros
};

const Graph = ({ nodes, links }) => {
  const basePosition = [1.213, -77.281];

  const initialPositions = {};
  nodes.forEach((node, index) => {
    initialPositions[node.id] = [
      basePosition[0] + index * 0.0001,
      basePosition[1] + index * 0.0001,
    ];
  });

  const [nodePositions, setNodePositions] = useState(initialPositions);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);
  const [activeLink, setActiveLink] = useState(null);
  // Nuevo estado para el centro del mapa
  const [mapCenter, setMapCenter] = useState(Object.values(nodePositions)[0] || basePosition);

  const updateMarkerPosition = (nodeId, event) => {
    const marker = event.target;
    const { lat, lng } = marker.getLatLng();
    setNodePositions((prev) => ({
      ...prev,
      [nodeId]: [lat, lng],
    }));
  };

  const MeasureTool = () => {
    useMapEvents({
      click(e) {
        if (measureMode && measurePoints.length < 2) {
          const newPoint = [e.latlng.lat, e.latlng.lng];
          const newPoints = [...measurePoints, newPoint];
          if (newPoints.length === 2) {
            const dist = computeDistance(newPoints[0], newPoints[1]);
            setMeasuredDistance(dist);
          }
          setMeasurePoints(newPoints);
        }
      },
    });
    return null;
  };

  const getMidPoint = (pos1, pos2) => [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];

  const updateMeasurePoint = (index, event) => {
    const point = [event.target.getLatLng().lat, event.target.getLatLng().lng];
    setMeasurePoints((prev) => {
      const newPoints = [...prev];
      newPoints[index] = point;
      if (newPoints.length === 2) {
        const dist = computeDistance(newPoints[0], newPoints[1]);
        setMeasuredDistance(dist);
      }
      return newPoints;
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={mapCenter} zoom={20} style={{ width: '82vw', height: '80vh' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {measureMode && <MeasureTool />}

        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={nodePositions[node.id]}
            icon={circleIcon}
            draggable={true}
            eventHandlers={{
              drag: (e) => updateMarkerPosition(node.id, e),
              dragend: (e) => updateMarkerPosition(node.id, e),
            }}
          >
            <Popup>
              <div>
                <h3>{node.label}</h3>
                {node.characteristics && node.characteristics.length > 0 ? (
                  <ul>
                    {node.characteristics.map((charac, index) => (
                      <li key={index}>{charac}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin características</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {links.map((link, index) => {
          const sourcePos = nodePositions[link.source];
          const targetPos = nodePositions[link.target];
          if (sourcePos && targetPos) {
            const midPoint = getMidPoint(sourcePos, targetPos);
            return (
              <React.Fragment key={`link-${index}`}>
                <Polyline
                  positions={[sourcePos, targetPos]}
                  color="#AEC6CF"
                  weight={5}
                  eventHandlers={{
                    click: () => setActiveLink(activeLink === index ? null : index),
                  }}
                />
                {activeLink === index && (
                  <Marker
                    position={midPoint}
                    icon={L.divIcon({
                      className: 'invisible-marker',
                      html: '',
                      iconSize: [0, 0],
                    })}
                  >
                    <Tooltip permanent direction="center" opacity={1} offset={[0, 0]}>
                      <span>{link.label}</span>
                    </Tooltip>
                  </Marker>
                )}
              </React.Fragment>
            );
          }
          return null;
        })}

        {measurePoints.map((point, idx) => (
          <Marker
            key={`measure-${idx}`}
            position={point}
            draggable={true}
            eventHandlers={{
              drag: (e) => updateMeasurePoint(idx, e),
              dragend: (e) => updateMeasurePoint(idx, e),
            }}
          >
            <Tooltip permanent direction="top" opacity={1} offset={[0, -10]}>
              <span>{`${point[0].toFixed(4)}, ${point[1].toFixed(4)}`}</span>
            </Tooltip>
          </Marker>
        ))}

        {measurePoints.length === 2 && (
          <>
            <Polyline positions={measurePoints} color="black" dashArray="5, 5" weight={3} />
            <Marker
              position={getMidPoint(measurePoints[0], measurePoints[1])}
              icon={L.divIcon({
                className: 'invisible-marker',
                html: '',
                iconSize: [0, 0],
              })}
            >
              <Tooltip permanent direction="center" opacity={1} offset={[0, 0]}>
                <span>{(measuredDistance / 1000).toFixed(2)} km</span>
              </Tooltip>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Botón para medir distancia */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => {
            setMeasureMode(!measureMode);
            setMeasurePoints([]);
            setMeasuredDistance(null);
          }}
          style={{
            padding: '10px',
            backgroundColor: measureMode ? '#AEC6CF' : '#FFB3BA',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          {measureMode ? 'Cerrar Medición' : 'Medir Distancia'}
        </button>
        {/* Nuevo botón para cambiar el centro del mapa */}
        <button
          onClick={() => {
            if (measurePoints.length === 2) {
              setMapCenter(getMidPoint(measurePoints[0], measurePoints[1]));
            } else if (measurePoints.length === 1) {
              setMapCenter(measurePoints[0]);
            }
          }}
          style={{
            padding: '10px',
            backgroundColor: '#C3E6CB',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Cambiar Centro
        </button>
      </div>
    </div>
  );
};

export default Graph;