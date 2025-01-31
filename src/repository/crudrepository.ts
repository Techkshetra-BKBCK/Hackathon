import { ICrudRepository } from "../types/repository/crudrepository";
export class CrudRepository<T, K = any> implements ICrudRepository<T, K> {
  private model: any;

  constructor(model: any) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async find(
    args: Partial<K>,
    options?: Record<string, unknown>
  ): Promise<T[]> {
    return this.model.find(args, null, options).exec();
  }

  async findOne(
    args: string | Partial<K>,
    options?: Record<string, unknown>
  ): Promise<T | null> {
    const query = typeof args === "string" ? { email: args } : args;
    return this.model.findOne(query, null, options).exec();
  }

  async findById(
    id: string,
    fields?: string[],
    options?: Record<string, unknown>
  ): Promise<T | null> {
    return this.model.findById(id, fields?.join(" "), options).exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<T>,
    options?: Record<string, unknown>
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, {
        new: true,
        ...options,
      })
      .exec();
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateMany(
    args: Partial<K>,
    data: Partial<T>,
    options?: Record<string, unknown>
  ): Promise<number> {
    const result = await this.model.updateMany(args, data, options).exec();
    return result.modifiedCount;
  }

  async deleteMany(
    args: Partial<K>,
    options?: Record<string, unknown>
  ): Promise<number> {
    const result = await this.model.deleteMany(args, options).exec();
    return result.deletedCount;
  }

  async count(args?: Partial<K>): Promise<number> {
    return this.model.countDocuments(args).exec();
  }

  async exists(args: Partial<K>): Promise<boolean> {
    return this.model.exists(args).exec() !== null;
  }

  async aggregate(
    pipeline: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async paginate(
    args: Partial<K>,
    options?: { page: number; limit: number }
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(args).skip(skip).limit(limit).exec(),
      this.model.countDocuments(args).exec(),
    ]);

    return { data, total, page, limit };
  }
}
