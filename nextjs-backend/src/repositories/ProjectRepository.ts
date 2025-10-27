import { BaseRepository } from './BaseRepository';
import { Project } from '../types';
import { pool } from '../config/database';

export class ProjectRepository implements BaseRepository<Project> {
  async findAll(): Promise<Project[]> {
    const result = await pool.query(`
      SELECT id, name, description, status, start_date as "startDate", 
             end_date as "endDate", manager_id as "managerId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM projects
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async findById(id: string): Promise<Project | null> {
    const result = await pool.query(`
      SELECT id, name, description, status, start_date as "startDate", 
             end_date as "endDate", manager_id as "managerId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM projects 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const result = await pool.query(`
      INSERT INTO projects (name, description, status, start_date, end_date, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, status, start_date as "startDate", 
                end_date as "endDate", manager_id as "managerId", 
                created_at as "createdAt", updated_at as "updatedAt"
    `, [
      projectData.name,
      projectData.description,
      projectData.status || 'planned',
      projectData.startDate,
      projectData.endDate,
      projectData.managerId
    ]);
    
    return result.rows[0];
  }

  async update(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (projectData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(projectData.name);
    }
    if (projectData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(projectData.description);
    }
    if (projectData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(projectData.status);
    }
    if (projectData.startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(projectData.startDate);
    }
    if (projectData.endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(projectData.endDate);
    }
    if (projectData.managerId !== undefined) {
      updates.push(`manager_id = $${paramCount++}`);
      values.push(projectData.managerId);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, status, start_date as "startDate", 
                end_date as "endDate", manager_id as "managerId", 
                created_at as "createdAt", updated_at as "updatedAt"
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  async findByStatus(status: Project['status']): Promise<Project[]> {
    const result = await pool.query(`
      SELECT id, name, description, status, start_date as "startDate", 
             end_date as "endDate", manager_id as "managerId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM projects 
      WHERE status = $1
      ORDER BY created_at DESC
    `, [status]);
    
    return result.rows;
  }

  async findByManager(managerId: string): Promise<Project[]> {
    const result = await pool.query(`
      SELECT id, name, description, status, start_date as "startDate", 
             end_date as "endDate", manager_id as "managerId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM projects 
      WHERE manager_id = $1
      ORDER BY created_at DESC
    `, [managerId]);
    
    return result.rows;
  }
}