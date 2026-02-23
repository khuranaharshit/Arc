import { BaseDAO } from './BaseDAO.js';

export class PeopleDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'people');
  }

  getDefaultData() {
    return { version: 1, people: [] };
  }

  async addPerson({ name, relationship, birthday, notes, tags }) {
    const data = await this.getData();
    const person = {
      id: crypto.randomUUID(),
      name,
      relationship: relationship || '',
      last_contacted: null,
      birthday: birthday || null,
      notes: notes || '',
      tags: tags || [],
      fun_facts: [],
    };
    data.people.push(person);
    await this.saveData(data);
    return person;
  }

  async updatePerson(id, updates) {
    const data = await this.getData();
    const person = data.people.find((p) => p.id === id);
    if (!person) return;
    Object.assign(person, updates);
    await this.saveData(data);
  }

  async markContacted(id) {
    const data = await this.getData();
    const person = data.people.find((p) => p.id === id);
    if (!person) return;
    person.last_contacted = new Date().toISOString().split('T')[0];
    await this.saveData(data);
  }

  async deletePerson(id) {
    const data = await this.getData();
    data.people = data.people.filter((p) => p.id !== id);
    await this.saveData(data);
  }

  async getPeople() {
    const data = await this.getData();
    return data.people;
  }
}
