import { CommentRepository } from '../repositories/CommentRepository';
import { Comment } from '../types';

export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async getAllComments(): Promise<Comment[]> {
    return this.commentRepository.findAll();
  }

  async getCommentById(id: string): Promise<Comment | null> {
    return this.commentRepository.findById(id);
  }

  async createComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    // Validate required fields
    if (!commentData.content || !commentData.taskId || !commentData.userId) {
      throw new Error('Content, taskId, and userId are required');
    }

    // Validate content length
    if (commentData.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (commentData.content.length > 1000) {
      throw new Error('Comment content cannot exceed 1000 characters');
    }

    return this.commentRepository.create(commentData);
  }

  async updateComment(id: string, commentData: Partial<Omit<Comment, 'id' | 'createdAt'>>): Promise<Comment | null> {
    const existing = await this.commentRepository.findById(id);
    if (!existing) {
      throw new Error('Comment not found');
    }

    // Validate content if provided
    if (commentData.content) {
      if (commentData.content.trim().length === 0) {
        throw new Error('Comment content cannot be empty');
      }

      if (commentData.content.length > 1000) {
        throw new Error('Comment content cannot exceed 1000 characters');
      }
    }

    return this.commentRepository.update(id, commentData);
  }

  async deleteComment(id: string): Promise<boolean> {
    const existing = await this.commentRepository.findById(id);
    if (!existing) {
      throw new Error('Comment not found');
    }

    return this.commentRepository.delete(id);
  }

  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    return this.commentRepository.findByTaskId(taskId);
  }

  async getCommentsByUser(userId: string): Promise<Comment[]> {
    return this.commentRepository.findByUserId(userId);
  }

  async getCommentsByDateRange(startDate: string, endDate: string): Promise<Comment[]> {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    return this.commentRepository.getCommentsByDateRange(startDate, endDate);
  }

  async deleteCommentsByTask(taskId: string): Promise<number> {
    return this.commentRepository.deleteCommentsByTaskId(taskId);
  }

  async getCommentCountByTask(taskId: string): Promise<number> {
    return this.commentRepository.getCommentCountByTask(taskId); // Changed from calculating length
  }

  async getRecentComments(limit: number = 10): Promise<Comment[]> {
    const allComments = await this.getAllComments();
    return allComments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}