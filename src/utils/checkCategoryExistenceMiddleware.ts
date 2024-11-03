import { NextFunction, Request, Response } from "express";
import graphQLClient from "../utils/graphql";
import { serverCategoryQueries } from "../graphql/queries";
import { log } from "@/utils/log";

export const checkCategoryExistenceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { categoryId } = req.params;

  // If the category_id is already in the locals object, we don't need to make a request to the server
  if (res.locals.category_id === categoryId) {
    return next();
  }

  try {
    const { getCategory: category } = await graphQLClient().request(
      serverCategoryQueries.GET_CATEGORY,
      {
        category_id: categoryId,
      }
    );

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.locals.category_id = categoryId;
    next();
  } catch (error) {
    next(error);
  }
};
