import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../utils/graphql';
import {serverCategoryQueries} from '../graphql/queries';

export const checkCategoryExistenceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { categoryId } = req.params;

  console.log(categoryId);

  try {
    const { getCategory: category } = await graphQLClient().request(
      serverCategoryQueries.GET_CATEGORY,
      {
        category_id: categoryId,
      }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.locals.category_id = categoryId;
    next();
  } catch (error) {
    return next(error);
  }
};
