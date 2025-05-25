import React, { useRef, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';

const NodeMarker = React.memo(({ node, position, icon, onDragEnd }) => {
  const markerRef = useRef(null);

  // Al arrastrar, actualizamos de forma imperativa la posición del marcador.
  const handleDrag = (e) => {
    // No actualizamos estado, solo dejamos que Leaflet mueva el marcador.
    // markerRef.current ya refleja la posición en la UI.
  };

  const handleDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    onDragEnd(node.id, [lat, lng]);
  };

  return (
    <Marker
      ref={markerRef}
      key={node.id}
      position={position}
      icon={icon}
      draggable={true}
      eventHandlers={{
        drag: handleDrag,
        dragend: handleDragEnd,
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
                  <li key={`${index}-${key}`}>
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
  );
});

export default NodeMarker;