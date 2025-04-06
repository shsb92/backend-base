import { z } from 'zod';
import pool from './connection.js';

export interface BaseModel {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export class Model<T extends BaseModel> {
  protected tableName: string;
  protected schema: z.ZodType<T>;
  protected pool = pool;

  constructor(tableName: string, schema: z.ZodType<T>) {
    this.tableName = tableName;
    this.schema = schema;
  }

  async findById(id: number): Promise<T | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    return this.schema.parse(result.rows[0]);
  }

  async findAll(): Promise<T[]> {
    const result = await this.pool.query(`SELECT * FROM ${this.tableName}`);
    return result.rows.map(row => this.schema.parse(row));
  }

  async create(data: Omit<T, keyof BaseModel>): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (${columns}, created_at, updated_at) 
       VALUES (${placeholders}, NOW(), NOW()) 
       RETURNING *`,
      values
    );
    
    return this.schema.parse(result.rows[0]);
  }

  async update(id: number, data: Partial<Omit<T, keyof BaseModel>>): Promise<T | null> {
    const entries = Object.entries(data);
    if (entries.length === 0) return null;
    
    const setClause = entries
      .map((_, i) => `${entries[i][0]} = $${i + 1}`)
      .join(', ');
    
    const values = [...Object.values(data), id];
    
    const result = await this.pool.query(
      `UPDATE ${this.tableName} 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length} 
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) return null;
    
    return this.schema.parse(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
} 