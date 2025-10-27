import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';

export class CommentController {
  constructor(private commentService: CommentService) {}

  getAllComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const comments = await this.commentService.getAllComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const comment = await this.commentService.getCommentById(id);
      
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const commentData = req.body;
      const comment = await this.commentService.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const commentData = req.body;
      const comment = await this.commentService.updateComment(id, commentData);
      
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
      
      res.json(comment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.commentService.deleteComment(id);
      
      if (!success) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getCommentsByTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const comments = await this.commentService.getCommentsByTask(taskId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCommentsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const comments = await this.commentService.getCommentsByUser(userId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCommentsByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }

      const comments = await this.commentService.getCommentsByDateRange(
        startDate as string,
        endDate as string
      );
      res.json(comments);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deleteCommentsByTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const deletedCount = await this.commentService.deleteCommentsByTask(taskId);
      res.json({ deletedCount, message: `Deleted ${deletedCount} comments` });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCommentCountByTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const count = await this.commentService.getCommentCountByTask(taskId);
      res.json({ taskId, count });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getRecentComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const comments = await this.commentService.getRecentComments(limit);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}