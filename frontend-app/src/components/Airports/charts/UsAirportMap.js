// import React from 'react';
// import Tooltip from '@mui/material/Tooltip';
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   Marker,
// } from 'react-simple-maps';

// // URL for fetching US states geography data
// // const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
// const usGeoUrl =
//   'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// const worldGeoUrl =
//   'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// /**
//  * Function for rendering a map of the United States with airport markers.
//  * @param {Array} markersData - Data containing airport markers with code, city, and coordinates.
//  */
// const UsAirportMap = ({ markersData }) => {
//   return (
//     <div style={{ height: '100%', width: 'fit-content', margin: '0 auto' }}>
//       <ComposableMap
//         style={{ width: 'auto', height: '100%' }}
//         projection='geoAlbersUsa'
//       >
//         <Geographies geography={geoUrl}>
//           {({ geographies }) => (
//             <>
//               {geographies.map((geo) => (
//                 <Geography
//                   key={geo.rsmKey}
//                   stroke='#fff'
//                   geography={geo}
//                   fill='#e6e6e6'
//                 />
//               ))}

//               {markersData.map(({ code, city, coordinates }) => {
//                 return (
//                   <Tooltip title={city} placement='top'>
//                     <Marker
//                       key={code}
//                       coordinates={coordinates}
//                       data-tip={code}
//                       data-for={`tooltip-${code}`}
//                     >
//                       <circle
//                         r={3}
//                         fill='#011638'
//                         stroke='#011638'
//                         strokeWidth={2}
//                       />
//                     </Marker>
//                   </Tooltip>
//                 );
//               })}
//             </>
//           )}
//         </Geographies>
//       </ComposableMap>
//     </div>
//   );
// };

// export default UsAirportMap;



import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

// Geography data sources
const usGeoUrl =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const worldGeoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/**
 * Renders a US map or a focused map for a US territory.
 * @param {Array} markersData - Airport markers with code, city, and coordinates.
 * @param {string} selectedState - Currently selected state or territory code.
 */
const UsAirportMap = ({ markersData, selectedState }) => {
  // Map settings for US territories
  const territorySettings = {
    PR: { center: [-66.6, 18.3], scale: 12000 },
    VI: { center: [-64.9, 18.0], scale: 16000 },
    GU: { center: [144.8, 13.5], scale: 12000 },
    AS: { center: [-170.7, 14.3], scale: 12000 },
  };

  // Check whether the selected location is a US territory
  const isTerritory = Object.prototype.hasOwnProperty.call(
    territorySettings,
    selectedState
  );

  const selectedMap = territorySettings[selectedState];

  // Display only markers belonging to the selected state or territory
  const visibleMarkers = markersData.filter(
    (marker) => marker.state === selectedState
  );

  return (
    <div
      style={{
        height: '100%',
        width: 'fit-content',
        margin: '0 auto',
      }}
    >
        <ComposableMap
          key={selectedState}
          style={{ width: 'auto', height: '100%' }}
          {...(isTerritory
            ? {
                projection: 'geoMercator',
                projectionConfig: {
                  center: selectedMap.center,
                  scale: selectedMap.scale,
                },
              }
            : {
                projection: 'geoAlbersUsa',
              })}
        >
        <Geographies
          geography={isTerritory ? worldGeoUrl : usGeoUrl}
        >
          {({ geographies }) => (
            <>
              {geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  stroke="#fff"
                  geography={geo}
                  fill="#e6e6e6"
                />
              ))}

              {visibleMarkers.map(({ code, city, coordinates }) => (
                <Tooltip
                  key={code}
                  title={city}
                  placement="top"
                >
                  <Marker
                    coordinates={coordinates}
                    data-tip={code}
                    data-for={`tooltip-${code}`}
                  >
                    <circle
                      r={3}
                      fill="#011638"
                      stroke="#011638"
                      strokeWidth={2}
                    />
                  </Marker>
                </Tooltip>
              ))}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default UsAirportMap;
