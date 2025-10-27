import { BaseRepository } from './BaseRepository';
import { Comment } from '../types';
import { pool } from '../config/database';

export class CommentRepository implements BaseRepository<Comment> {
  async findAll(): Promise<Comment[]> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async create(commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const result = await pool.query(`
      INSERT INTO comments (task_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, task_id as "taskId", user_id as "userId", content,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [
      commentData.taskId,
      commentData.userId,
      commentData.content
    ]);
    
    return result.rows[0];
  }

  async update(id: string, commentData: Partial<Omit<Comment, 'id' | 'createdAt'>>): Promise<Comment | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (commentData.taskId !== undefined) {
      updates.push(`task_id = $${paramCount++}`);
      values.push(commentData.taskId);
    }
    if (commentData.userId !== undefined) {
      updates.push(`user_id = $${paramCount++}`);
      values.push(commentData.userId);
    }
    if (commentData.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(commentData.content);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE comments 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, task_id as "taskId", user_id as "userId", content,
                created_at as "createdAt", updated_at as "updatedAt"
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  // Comment-specific methods
  async findByTaskId(taskId: string): Promise<Comment[]> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments 
      WHERE task_id = $1
      ORDER BY created_at DESC
    `, [taskId]);
    
    return result.rows;
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    return result.rows;
  }

  async getCommentsByDateRange(startDate: string, endDate: string): Promise<Comment[]> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments 
      WHERE created_at >= $1 AND created_at <= $2
      ORDER BY created_at DESC
    `, [startDate, endDate]);
    
    return result.rows;
  }

  async deleteCommentsByTaskId(taskId: string): Promise<number> {
    const result = await pool.query(
      'DELETE FROM comments WHERE task_id = $1',
      [taskId]
    );
    
    return result.rowCount ?? 0;
  }

  async getCommentCountByTask(taskId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE task_id = $1',
      [taskId]
    );
    
    return parseInt(result.rows[0].count);
  }

  async getRecentComments(limit: number = 10): Promise<Comment[]> {
    const result = await pool.query(`
      SELECT id, task_id as "taskId", user_id as "userId", content,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM comments 
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }
}