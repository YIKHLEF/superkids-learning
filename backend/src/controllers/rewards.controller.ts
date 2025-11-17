import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { ActivityRewardPayload } from '../types';

export const getRewardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rewardService = ServiceFactory.getRewardService();
    const { childId } = req.params;
    const data = await rewardService.getRewardSummary(childId);

    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const awardActivityReward = async (req: Request<{}, {}, ActivityRewardPayload>, res: Response, next: NextFunction) => {
  try {
    const rewardService = ServiceFactory.getRewardService();
    const data = await rewardService.awardForActivity(req.body);

    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
