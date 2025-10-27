export interface BaseRepository<T> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: string, item: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
  }