import { BaseDAO } from './BaseDAO.js';

export class ReadingListDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'reading');
  }

  getDefaultData() {
    return { version: 1, books: [] };
  }

  async updateBookStatus(configKey, status, progressNote = null, rating = null) {
    const data = await this.getData();
    let book = data.books.find((b) => b.config_key === configKey);
    if (!book) {
      book = { config_key: configKey, status: 'next', started_at: null, finished_at: null, progress_note: null, rating: null };
      data.books.push(book);
    }
    book.status = status;
    if (status === 'reading' && !book.started_at) book.started_at = new Date().toISOString().split('T')[0];
    if (status === 'finished') book.finished_at = new Date().toISOString().split('T')[0];
    if (progressNote !== null) book.progress_note = progressNote;
    if (rating !== null) book.rating = rating;
    await this.saveData(data);
    return book;
  }

  async getBookStatus(configKey) {
    const data = await this.getData();
    return data.books.find((b) => b.config_key === configKey) || null;
  }

  async getAllBooks() {
    const data = await this.getData();
    return data.books;
  }
}
