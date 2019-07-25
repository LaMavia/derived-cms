type Json = Array<HashMap<any>> | HashMap<any>

export interface CollectionStats {
  size: [number, string]
  count: number
}

export interface CollectionModel {
  collection: string
  schema: Array<[string, string]>
}

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

  public abstract field_new(
    collection: string,
    key: string,
    type: FieldType,
  ): Promise<any>
  public abstract field_delete(collection: string, key: string): Promise<any>
  public abstract field_rename(
    collection: string,
    key: string,
    newKey: string
  ): Promise<any>

  public abstract stats(collection: string): Promise<CollectionStats>

  public abstract collections_wschemas(
    collections?: string[]
  ): Promise<CollectionModel[]>
  /**
   * @returns {String[]} Returns names of all collections
   */
  public abstract collections_all_labels(): Promise<string[]>

  public abstract save_schemas(): Promise<void>

  public abstract connect(): Promise<void>
}
