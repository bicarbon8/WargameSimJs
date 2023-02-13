import { TerrainTileManager } from './terrain-tile-manager';

describe('MapGenerator', () => {
  it('should be a static instance', () => {
    expect(TerrainTileManager).toBeTruthy();
  });
});
