class ZoneMap {
  constructor() {
    this.zones = new Map();
  }

  set(zoneId, data) {
    this.zones.set(zoneId, data);
  }

  get(zoneId) {
    return this.zones.get(zoneId);
  }

  getAll() {
    return Array.from(this.zones.values());
  }

  has(zoneId) {
    return this.zones.has(zoneId);
  }

  clear() {
    this.zones.clear();
  }
}

module.exports = ZoneMap;
