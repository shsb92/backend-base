import { z } from 'zod';
import { Model, BaseModel } from '@core/database/base-model.js';

// Define the User schema with Zod
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password_hash: z.string(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});

// Create a type from the schema
export type User = z.infer<typeof UserSchema>;

// Create the User model class
export class UserModel extends Model<User> {
  constructor() {
    super('users', UserSchema);
  }

  // Add custom methods specific to users
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) return null;
    
    return this.schema.parse(result.rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE username = $1`,
      [username]
    );
    
    if (result.rows.length === 0) return null;
    
    return this.schema.parse(result.rows[0]);
  }
}

// Export a singleton instance
export const userModel = new UserModel(); 