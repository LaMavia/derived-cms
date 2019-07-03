type Json = String

export abstract class DbInterface {
  models: HashMap<Model>
  constructor(models: HashMap<Model>) {
    this.models = models
  }

  public abstract find(collection: string, filters?: HashMap): Promise<Json>
  public abstract find_one(collection: string, filters?: HashMap): Promise<Json>

  public abstract update(
    collection: string,
    filters: HashMap,
    values: HashMap
  ): Promise<Json>
  public abstract update_one(
    collection: string,
    filters: HashMap,
    values: HashMap
  ): Promise<Json>

  public abstract delete(collection: string, filters?: HashMap): Promise<Json>
  public abstract delete_one(
    collection: string,
    filters?: HashMap
  ): Promise<Json>

  public abstract insert(collection: string, values: HashMap): Promise<Json>

  public abstract collection_new(name: string, schema: Schema): Promise<Json>
  public abstract collection_delete(name: string): Promise<Json>
  public abstract collection_cleanse(name: string): Promise<Json>

  public abstract field_new<T = any>(
    collection: string,
    key: string,
    type: FieldType,
    defaultValue: T
  ): Promise<Json>
  public abstract field_delete(collection: string, key: string): Promise<Json>
  public abstract field_rename(
    collection: string,
    key: string,
    newKey: string
  ): Promise<Json>

  public abstract connect(): Promise<void>
}
