import { BaseRepository } from './BaseRepository';
import { Task } from '../types';
import { pool } from '../config/database';

export class TaskRepository implements BaseRepository<Task> {
  async findAll(): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async findById(id: string): Promise<Task | null> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const result = await pool.query(`
      INSERT INTO tasks (phase_id, project_id, title, description, status, priority, 
                        assignee_id, reporter_id, due_date, estimated_hours, actual_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, phase_id as "phaseId", project_id as "projectId", title, description, 
                status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
                due_date as "dueDate", estimated_hours as "estimatedHours", 
                actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
    `, [
      taskData.phaseId,
      taskData.projectId,
      taskData.title,
      taskData.description,
      taskData.status || 'todo',
      taskData.priority || 'medium',
      taskData.assigneeId,
      taskData.reporterId,
      taskData.dueDate,
      taskData.estimatedHours,
      taskData.actualHours || null
    ]);
    
    return result.rows[0];
  }

  async update(id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (taskData.phaseId !== undefined) {
      updates.push(`phase_id = $${paramCount++}`);
      values.push(taskData.phaseId);
    }
    if (taskData.projectId !== undefined) {
      updates.push(`project_id = $${paramCount++}`);
      values.push(taskData.projectId);
    }
    if (taskData.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(taskData.title);
    }
    if (taskData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(taskData.description);
    }
    if (taskData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(taskData.status);
    }
    if (taskData.priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(taskData.priority);
    }
    if (taskData.assigneeId !== undefined) {
      updates.push(`assignee_id = $${paramCount++}`);
      values.push(taskData.assigneeId);
    }
    if (taskData.reporterId !== undefined) {
      updates.push(`reporter_id = $${paramCount++}`);
      values.push(taskData.reporterId);
    }
    if (taskData.dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(taskData.dueDate);
    }
    if (taskData.estimatedHours !== undefined) {
      updates.push(`estimated_hours = $${paramCount++}`);
      values.push(taskData.estimatedHours);
    }
    if (taskData.actualHours !== undefined) {
      updates.push(`actual_hours = $${paramCount++}`);
      values.push(taskData.actualHours);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, phase_id as "phaseId", project_id as "projectId", title, description, 
                status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
                due_date as "dueDate", estimated_hours as "estimatedHours", 
                actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  // Task-specific methods
  async findByProjectId(projectId: string): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [projectId]);
    
    return result.rows;
  }

  async findByPhaseId(phaseId: string): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE phase_id = $1
      ORDER BY created_at DESC
    `, [phaseId]);
    
    return result.rows;
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE assignee_id = $1
      ORDER BY due_date ASC
    `, [assigneeId]);
    
    return result.rows;
  }

  async findByStatus(status: Task['status']): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE status = $1
      ORDER BY due_date ASC
    `, [status]);
    
    return result.rows;
  }

  async findByPriority(priority: Task['priority']): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE priority = $1
      ORDER BY due_date ASC
    `, [priority]);
    
    return result.rows;
  }

  async updateStatus(id: string, status: Task['status']): Promise<Task | null> {
    const result = await pool.query(`
      UPDATE tasks 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, phase_id as "phaseId", project_id as "projectId", title, description, 
                status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
                due_date as "dueDate", estimated_hours as "estimatedHours", 
                actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
    `, [status, id]);
    
    return result.rows[0] || null;
  }

  async updateAssignee(id: string, assigneeId: string): Promise<Task | null> {
    const result = await pool.query(`
      UPDATE tasks 
      SET assignee_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, phase_id as "phaseId", project_id as "projectId", title, description, 
                status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
                due_date as "dueDate", estimated_hours as "estimatedHours", 
                actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
    `, [assigneeId, id]);
    
    return result.rows[0] || null;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, phase_id as "phaseId", project_id as "projectId", title, description, 
             status, priority, assignee_id as "assigneeId", reporter_id as "reporterId",
             due_date as "dueDate", estimated_hours as "estimatedHours", 
             actual_hours as "actualHours", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE due_date < CURRENT_DATE AND status != 'completed'
      ORDER BY due_date ASC
    `);
    
    return result.rows;
  }
}