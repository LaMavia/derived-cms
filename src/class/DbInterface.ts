type Json = Array<HashMap<any>> | HashMap<any>

export abstract class DbInterface {
  models: HashMap<Model>
  constructor(models: HashMap<Model>) {
    this.models = models
  }

  public abstract find(collection: string, filters?: HashMap): Promise<any>
  public abstract find_one(collection: string, filters?: HashMap): Promise<any>

  public abstract update(
    collection: string,
    filters: HashMap,
    values: HashMap
  ): Promise<any>
  public abstract update_one(
    collection: string,
    filters: HashMap,
    values: HashMap
  ): Promise<any>

  public abstract delete(collection: string, filters?: HashMap): Promise<any>
  public abstract delete_one(
    collection: string,
    filters?: HashMap
  ): Promise<any>

  public abstract insert(collection: string, values: HashMap): Promise<any>

  public abstract collection_new(name: string, schema: Schema): Promise<any>
  public abstract collection_delete(name: string): Promise<any>
  public abstract collection_cleanse(name: string): Promise<any>

  public abstract field_new<T = any>(
    collection: string,
    key: string,
    type: FieldType,
    defaultValue: T
  ): Promise<any>
  public abstract field_delete(collection: string, key: string): Promise<any>
  public abstract field_rename(
    collection: string,
    key: string,
    newKey: string
  ): Promise<any>

  public abstract save_schemas(): Promise<void>

  public abstract connect(): Promise<void>
}
