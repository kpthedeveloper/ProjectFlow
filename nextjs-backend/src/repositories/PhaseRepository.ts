import { BaseRepository } from './BaseRepository';
import { Phase } from '../types';
import { pool } from '../config/database';

export class PhaseRepository implements BaseRepository<Phase> {
  async findAll(): Promise<Phase[]> {
    const result = await pool.query(`
      SELECT id, project_id as "projectId", name, description, "order", 
             start_date as "startDate", end_date as "endDate", status
      FROM phases
      ORDER BY "order" ASC
    `);
    return result.rows;
  }

  async findById(id: string): Promise<Phase | null> {
    const result = await pool.query(`
      SELECT id, project_id as "projectId", name, description, "order", 
             start_date as "startDate", end_date as "endDate", status
      FROM phases 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async create(phaseData: Omit<Phase, 'id'>): Promise<Phase> {
    const result = await pool.query(`
      INSERT INTO phases (project_id, name, description, "order", start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, project_id as "projectId", name, description, "order", 
                start_date as "startDate", end_date as "endDate", status
    `, [
      phaseData.projectId,
      phaseData.name,
      phaseData.description,
      phaseData.order,
      phaseData.startDate,
      phaseData.endDate,
      phaseData.status || 'not-started'
    ]);
    
    return result.rows[0];
  }

  async update(id: string, phaseData: Partial<Phase>): Promise<Phase | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (phaseData.projectId !== undefined) {
      updates.push(`project_id = $${paramCount++}`);
      values.push(phaseData.projectId);
    }
    if (phaseData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(phaseData.name);
    }
    if (phaseData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(phaseData.description);
    }
    if (phaseData.order !== undefined) {
      updates.push(`"order" = $${paramCount++}`);
      values.push(phaseData.order);
    }
    if (phaseData.startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(phaseData.startDate);
    }
    if (phaseData.endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(phaseData.endDate);
    }
    if (phaseData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(phaseData.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE phases 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, project_id as "projectId", name, description, "order", 
                start_date as "startDate", end_date as "endDate", status
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM phases WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  // Phase-specific methods
  async findByProjectId(projectId: string): Promise<Phase[]> {
    const result = await pool.query(`
      SELECT id, project_id as "projectId", name, description, "order", 
             start_date as "startDate", end_date as "endDate", status
      FROM phases 
      WHERE project_id = $1
      ORDER BY "order" ASC
    `, [projectId]);
    
    return result.rows;
  }

  async findByStatus(status: Phase['status']): Promise<Phase[]> {
    const result = await pool.query(`
      SELECT id, project_id as "projectId", name, description, "order", 
             start_date as "startDate", end_date as "endDate", status
      FROM phases 
      WHERE status = $1
      ORDER BY "order" ASC
    `, [status]);
    
    return result.rows;
  }

  async updateStatus(id: string, status: Phase['status']): Promise<Phase | null> {
    const result = await pool.query(`
      UPDATE phases 
      SET status = $1
      WHERE id = $2
      RETURNING id, project_id as "projectId", name, description, "order", 
                start_date as "startDate", end_date as "endDate", status
    `, [status, id]);
    
    return result.rows[0] || null;
  }

  async getNextOrder(projectId: string): Promise<number> {
    const result = await pool.query(`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order
      FROM phases 
      WHERE project_id = $1
    `, [projectId]);
    
    return result.rows[0].next_order;
  }
}