import { Request, Response } from 'express';

export const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;

  res.json({
    status: 'success',
    data: {
      messages: [
        {
          id: '1',
          senderId: 'educator-1',
          recipientId: userId,
          subject: 'Progrès de cette semaine',
          content: 'Excellent progrès cette semaine!',
          read: false,
          createdAt: new Date(),
          attachments: [],
        },
      ],
    },
  });
};

export const sendMessage = async (req: Request, res: Response) => {
  const { senderId, recipientId, subject, content } = req.body;

  res.json({
    status: 'success',
    data: {
      message: {
        id: 'new-message-id',
        senderId,
        recipientId,
        subject,
        content,
        read: false,
        createdAt: new Date(),
      },
    },
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  res.json({
    status: 'success',
    data: {
      message: {
        id: messageId,
        read: true,
      },
    },
  });
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  res.json({
    status: 'success',
    message: 'Message supprimé avec succès',
  });
};
