// Mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize

import { MapTerrain } from "../../map/map-terrain";

// - Array or 2D array for putTilesAt
const TILE_MAPPING = {
  GROUND: [
    { index: MapTerrain.grass, weight: 7 },
    { index: MapTerrain.sand, weight: 2 },
    { index: MapTerrain.marsh, weight: 1 },
    { index: MapTerrain.shrubbery, weight: 1 },
    { index: MapTerrain.tree, weight: 1 }
  ]
};
  
export default TILE_MAPPING;