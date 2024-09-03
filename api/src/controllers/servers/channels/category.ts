import express from "express";

import graphQLClient from "../../../utils/graphql";
import { serverCategoryQueries } from "../../../graphql/queries";
import { categoryMutations } from "../../../graphql/mutations";

const _getCategory = async (category_id: string) => {
  const response = await graphQLClient().request(
    serverCategoryQueries.GET_CATEGORY,
    {
      category_id,
    }
  );

  return response.getCategory;
};

const _getCategories = async (server_id: string) => {
  const response = await graphQLClient().request(
    serverCategoryQueries.GET_CATEGORIES,
    {
      server_id,
    }
  );

  // Convert response into array list
  const categories = response.getCategories.map((category: any) => {
    return category;
  });

  // Sort categories by position
  categories.sort((a: any, b: any) => a.position - b.position);

  return categories;
};

// =========================

export const getCategories = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const categories = await _getCategories(server_id).catch(() => null);
    return res.status(200).json({ categories });
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const { name } = req.body;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.CREATE_CATEGORY,
      {
        server_id,
        input: { name },
      }
    );

    return res.status(200).json({ category: response.createCategory });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.UPDATE_CATEGORY,
      {
        category_id: categoryId,
        input: { name },
      }
    );

    return res.status(200).json({ category: response.updateCategory });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    await graphQLClient().request(categoryMutations.DELETE_CATEGORY, {
      category_id: categoryId,
    });

    return res.status(200).json({ message: "Category deleted." });
  } catch (error) {
    return next(error);
  }
};

export const moveCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { categoryId } = req.params;
  const { new_position } = req.body;

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  if (new_position === undefined) {
    return res.status(400).json({ message: "New position is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.MOVE_CATEGORY,
      {
        category_id: categoryId,
        new_position,
      }
    );

    return res.status(200).json({ category: response.moveCategory });
  } catch (error) {
    return next(error);
  }
};
