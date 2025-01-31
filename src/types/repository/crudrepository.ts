export interface ICrudRepository<T, K = any> {
  create(data: Partial<T>): Promise<T>;

  find(args: Partial<K>, options?: Record<string, unknown>): Promise<T[]>;
  findOne(
    args: Partial<K>,
    options?: Record<string, unknown>
  ): Promise<T | null>;
  findById(
    id: string,
    fields?: string[],
    options?: Record<string, unknown>
  ): Promise<T | null>;

  findByIdAndUpdate(
    id: string,
    data: Partial<T>,
    options?: Record<string, unknown>
  ): Promise<T | null>;
  findByIdAndDelete(id: string): Promise<boolean>;

  updateMany(
    args: Partial<K>,
    data: Partial<T>,
    options?: Record<string, unknown>
  ): Promise<number>;
  deleteMany(
    args: Partial<K>,
    options?: Record<string, unknown>
  ): Promise<number>;

  count(args?: Partial<K>): Promise<number>;
  exists(args: Partial<K>): Promise<boolean>;

  aggregate(
    pipeline: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]>;
  paginate(
    args: Partial<K>,
    options?: { page: number; limit: number }
  ): Promise<{ data: T[]; total: number; page: number; limit: number }>;
}
