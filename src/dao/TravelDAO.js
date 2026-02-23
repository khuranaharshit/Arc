import { BaseDAO } from './BaseDAO.js';

export class TravelDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'travel');
  }

  getDefaultData() {
    return { version: 1, trips: [] };
  }

  async addTrip({ destination, startDate, endDate, places, notes }) {
    const data = await this.getData();
    const trip = {
      id: crypto.randomUUID(),
      destination,
      start_date: startDate,
      end_date: endDate || null,
      status: new Date(startDate) > new Date() ? 'upcoming' : 'completed',
      places: places || [],
      photo_album_url: '',
      notes: notes || '',
    };
    data.trips.push(trip);
    await this.saveData(data);
    return trip;
  }

  async updateTrip(id, updates) {
    const data = await this.getData();
    const trip = data.trips.find((t) => t.id === id);
    if (!trip) return;
    Object.assign(trip, updates);
    await this.saveData(data);
  }

  async deleteTrip(id) {
    const data = await this.getData();
    data.trips = data.trips.filter((t) => t.id !== id);
    await this.saveData(data);
  }

  async getTrips() {
    const data = await this.getData();
    return data.trips;
  }
}
