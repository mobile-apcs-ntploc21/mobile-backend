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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  try {
    const categories = await _getCategories(server_id).catch(() => null);
    res.status(200).json({ categories });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!name) {
    res.status(400).json({ message: "Name is required." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.CREATE_CATEGORY,
      {
        server_id,
        input: { name },
      }
    );

    res.status(200).json({ category: response.createCategory });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Category ID is required." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.UPDATE_CATEGORY,
      {
        category_id: categoryId,
        input: { name },
      }
    );

    res.status(200).json({ category: response.updateCategory });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const deleteCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    res.status(400).json({ message: "Category ID is required." });
    return;
  }

  try {
    await graphQLClient().request(categoryMutations.DELETE_CATEGORY, {
      category_id: categoryId,
    });

    res.status(200).json({ message: "Category deleted." });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Category ID is required." });
    return;
  }

  if (new_position === undefined) {
    res.status(400).json({ message: "New position is required." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.MOVE_CATEGORY,
      {
        category_id: categoryId,
        new_position,
      }
    );

    res.status(200).json({ category: response.moveCategory });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const moveAllCategory = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const { categories } = req.body;

  if (!server_id) {
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!categories) {
    res.status(400).json({
      message:
        "Input of array of categories is required. Eg., categories: [category_id, position].",
    });
    return;
  }

  if (!Array.isArray(categories)) {
    res
      .status(400)
      .json({ message: "Input of array of categories must be an array." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.MOVE_ALL_CATEGORY,
      {
        server_id,
        input: categories,
      }
    );

    res.status(200).json({ categories: response.moveAllCategory });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
