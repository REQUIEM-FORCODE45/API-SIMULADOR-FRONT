import React, { useRef, useEffect } from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const LinkLine = ({ link, sourcePos, targetPos, active, onClick }) => {
  const polylineRef = useRef(null);

  useEffect(() => {
    if (polylineRef.current) {
      // Actualizamos imperativamente la polyline con las nuevas posiciones
      polylineRef.current.setLatLngs([sourcePos, targetPos]);
    }
  }, [sourcePos, targetPos]);

  // Calcula el punto medio para posicionar el tooltip, si lo necesitas
  const midPoint = [
    (sourcePos[0] + targetPos[0]) / 2,
    (sourcePos[1] + targetPos[1]) / 2,
  ];

  return (
    <>
      <Polyline
        ref={polylineRef}
        positions={[sourcePos, targetPos]}
        color="#AEC6CF"
        weight={5}
        eventHandlers={{ click: onClick }}
      />
      {active && (
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
    </>
  );
};

export default React.memo(LinkLine);