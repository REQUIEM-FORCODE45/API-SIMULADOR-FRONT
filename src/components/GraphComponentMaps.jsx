import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ThemeContext } from '../context/ThemeContext';
import simuladorNode from '../api/SimuladorNodes';

// Icon circular estilizado
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

// Función que convierte un valor (0 a 1.5) en un color
const getHeatMapColor = (value) => {
  const min = 0, max = 1.5;
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);

  // Turbo colormap approximation
  const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 - 4 * Math.abs(t - 0.75))));
  const g = Math.round(255 * Math.min(1, Math.max(0, 1.5 - 4 * Math.abs(t - 0.5))));
  const b = Math.round(255 * Math.min(1, Math.max(0, 1.5 - 4 * Math.abs(t - 0.25))));

  return `rgb(${r},${g},${b})`;
};

// Función para crear un icono circular
const getCircleIcon = (value) => {
  const color = getHeatMapColor(value);
  return L.divIcon({
    html: `<div style="
        width: 24px;
        height: 24px;
        background: radial-gradient(circle, ${color} 50%, #ffffff 100%);
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease-in-out;
    " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></div>`,
    iconSize: [28, 28],
    className: '',
  });
};

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


const Graph = ({ nodes, links, id_network, maps2 }) => {
  const { theme } = useContext(ThemeContext);

  const markerRefs = useRef({});
  const polylineRefs = useRef({});

  /*
  const initialColors = {};
  nodes.forEach((node, index) => {
    initialColors[node.id] = getCircleIcon((node.characteristics.length > 0) ? node.characteristics[0].voltage_A : 0);
  });*/
  
  const base = [1.213, -77.281];
  const [nodePositions, setNodePositions] = useState(() => {
    const pos = {};
    nodes.forEach((node, i) => {
      pos[node.id] = [node.x || base[0], node.y || base[1]];
    });
    return pos;
  });
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);
  const [mapCenter, setMapCenter] = useState(Object.values(nodePositions)[0] || basePosition); 
  const [activeLink, setActiveLink] = useState(null);
  const [activeMap, setActiveMap] = useState('osm');
  const [maxZoomValue, setMaxZoomValue] = useState(18);
  const [initialColors, setInitialColors] = useState(() => {
    const colors = {}; 
    nodes.forEach((node) => {
      colors[node.id] = getCircleIcon((node.characteristics.length > 0) ? parseFloat(node.characteristics[0].voltage_A): 0);
    });
    return colors;
  });

  const toggleVoltage = (index,voltage) => {
    const colors = {};
    nodes.forEach((node) => {
      colors[node.id] = getCircleIcon((node.characteristics.length > 0) ? node.characteristics[index][voltage] : 0);
    });
    setInitialColors(colors);
  }

  const toggleMap = () => {
    setActiveMap(prev => prev === 'otm' ? 'osm' : 'otm');
    setMaxZoomValue(prev => prev === 17 ? 18 : 17);
  };

  const getMidPoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  const handleDrag = useCallback(
    (nodeId) => (e) => {
      const leafletMarker = markerRefs.current[nodeId];
      const { lat, lng } = e.target.getLatLng();
      leafletMarker.setLatLng([lat, lng]);
      links.forEach((link, idx) => {
        if (link.source === nodeId || link.target === nodeId) {
          const otherId = link.source === nodeId ? link.target : link.source;
          const otherMarker = markerRefs.current[otherId];
          const otherLatLng = otherMarker.getLatLng();
          const coords =
            link.source === nodeId
              ? [[lat, lng], [otherLatLng.lat, otherLatLng.lng]]
              : [[otherLatLng.lat, otherLatLng.lng], [lat, lng]];
          polylineRefs.current[idx].setLatLngs(coords);
        }
      });
    },
    [links]
  );

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

  const positionSave = async () => {
    try {
      Swal.fire({
        title: 'Guardando posiciones',
        text: 'Por favor, espere...',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      let newnodes = [...nodes];
      nodes.forEach((node, i) => {
        newnodes[i].x = nodePositions[node.id][0];
        newnodes[i].y = nodePositions[node.id][1];
      });
      const response = await simuladorNode.put(`nodelinks/${id_network}`, { nodes: newnodes, links });
      console.log(response);

      Swal.close();
      Swal.fire({
        title: 'Éxito',
        text: 'Posiciones guardadas correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      console.error('Error al guardar las posiciones:', error);
      Swal.close();
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar las posiciones. Por favor, inténtelo nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  const handleDragEnd = useCallback(
    (nodeId) => async (e) => {
      const { lat, lng } = e.target.getLatLng();
      setNodePositions((prev) => ({
        ...prev,
        [nodeId]: [lat, lng],
      }));
    },
    []
  );

  /*
  useEffect( () => {
    async function fetchAndInitialize() {
      try {
        const response = await axios.get(`http://localhost:3000/nodelinks/${id_network}`);
        const pos1 = nodePositions;
        nodes.forEach((node, i) => {
          const resultado = response.data.nodes.find(item => item.guid === node.guid);
          pos1[node.id] = [resultado.x, resultado.y];
        });

        setNodePositions(pos1);

      } catch (error) {
        console.error('Error fetching nodes:', error);
        const fallback = {};
        nodes.forEach((node, i) => {
          fallback[node.id] = mapCenter;
        });
        setNodePositions(fallback);
      }
    }
    fetchAndInitialize();
  }, [id_network, nodes, links, maps2]);*/


  return (
    <div style={{ position: 'relative' }} className={theme === 'light' ? '' : 'map-dark'}>
      <style>{`
        .map-dark .leaflet-tile {
          filter: brightness(0.7);
        }
      `}</style>
      <MapContainer center={mapCenter} zoom={20} maxZoom={maxZoomValue} style={{ width: '82vw', height: '80vh'  }}>

        {activeMap === 'osm' ? (
          <TileLayer
            attribution={ "&copy; OpenStreetMap contributors"}
            url={ "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />
        ) : (
          <TileLayer
            attribution={'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, '}
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}

        {measureMode && <MeasureTool />}
        {/* Marcadores */}
        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={nodePositions[node.id]}
            icon={initialColors[node.id]}
            draggable
            ref={(el) => {
              if (el) markerRefs.current[node.id] = el;
            }}
            eventHandlers={{
              drag: handleDrag(node.id),
              dragend: handleDragEnd(node.id),
            }}
          >
            <Popup>
              <div>
                <h3>{node.label}</h3>
                {node.characteristics && node.characteristics.length > 0 ? (
                  <ul>
                    {node.characteristics.map((charac, index) => {
                      const entries = Object.entries(charac);
                      return entries.map(([key, value]) => (
                        <li key={`${index}-${key}`}
                            onClick={() => toggleVoltage(index,key)}
                        >
                          <strong>{key}:</strong> {value}
                        </li>
                      ));
                    })}
                  </ul>
                ) : (
                  <p>Sin características</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Enlaces */}
        {links.map((link, idx) => {
          const src = nodePositions[link.source];
          const tgt = nodePositions[link.target];
          if (!src || !tgt) return null;
          return (
            <React.Fragment key={idx}>
              <Polyline
                positions={[src, tgt]}
                color="#AEC6CF"
                weight={5}
                ref={(el) => {
                  if (el) polylineRefs.current[idx] = el;
                }}
                eventHandlers={{
                  click: () => setActiveLink(activeLink === idx ? null : idx),
                }}
              />
              {activeLink === idx && (
                <Marker
                  position={getMidPoint(src, tgt)}
                  icon={L.divIcon({
                    className: 'invisible-marker',
                    html: '',
                    iconSize: [0, 0],
                  })}
                >
                  <Tooltip
                    permanent
                    direction="center"
                    opacity={1}
                    offset={[0, 0]}
                  >
                    <span>{link.label}</span>
                  </Tooltip>
                </Marker>
              )}
            </React.Fragment>
          );
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
          onClick={toggleMap}
          style={{
            padding: '10px',
            backgroundColor: '#C3E6CB',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          {activeMap === 'otm' ? 'Cambiar a OSM' : 'Cambiar a OpenTopoMap'}
        </button>
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
        <button
          onClick={() => {
            let newCenter;
            if (measurePoints.length === 2) {
              newCenter = getMidPoint(measurePoints[0], measurePoints[1]);
            } else if (measurePoints.length === 1) {
              newCenter = measurePoints[0];
            } else {
              newCenter = mapCenter;
            }
            setMapCenter(newCenter);
            const updatedPositions = {};
            Object.keys(nodePositions).forEach((key) => {
              updatedPositions[key] = newCenter;
            });
            setNodePositions(updatedPositions);
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

        <button
          onClick={positionSave}
          style={{
            padding: '10px',
            backgroundColor: '#AEC6CF',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          save postions
        </button>        


      </div>      
    </div>
  );
};

export default Graph;
