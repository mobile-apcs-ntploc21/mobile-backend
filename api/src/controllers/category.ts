import express from "express";

import graphQLClient from "../utils/graphql";
import { categoryQueries } from "../graphql/queries";
import { categoryMutations } from "../graphql/mutations";

const _getCategory = async (category_id: string) => {
  const response = await graphQLClient().request(categoryQueries.GET_CATEGORY, {
    category_id,
  });

  return response.getCategory;
};

const _getCategories = async (server_id: string) => {
  const response = await graphQLClient().request(
    categoryQueries.GET_CATEGORIES,
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

const _getCategoryPermissions = async (category_id: string) => {
  const response = await graphQLClient().request(
    categoryQueries.GET_CATEGORY_PERMISSIONS,
    {
      category_id,
    }
  );

  return response.getCategoryPermissions;
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
  const { category_id } = req.params;
  const { name } = req.body;

  if (!category_id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.UPDATE_CATEGORY,
      {
        category_id,
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
  const { category_id } = req.params;

  if (!category_id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    await graphQLClient().request(categoryMutations.DELETE_CATEGORY, {
      id: category_id,
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
  const { category_id } = req.params;
  const { new_position } = req.body;

  if (!category_id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  if (!new_position) {
    return res.status(400).json({ message: "New position is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.MOVE_CATEGORY,
      {
        category_id,
        new_position,
      }
    );

    return res.status(200).json({ category: response.moveCategory });
  } catch (error) {
    return next(error);
  }
};

// ========== PERMISSIONS ==========

export const getCategoryPermissions = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { category_id } = req.params;

  if (!category_id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    const permissions = await _getCategoryPermissions(category_id).catch(
      () => null
    );
    return res.status(200).json({ permissions });
  } catch (error) {
    return next(error);
  }
};

export const createCategoryPermission = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { category_id } = req.params;
  const { server_role_id, user_id, is_user, allow, deny } = req.body;

  if (!category_id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  if (!allow) {
    return res.status(400).json({ message: "Allow is required." });
  }

  if (!deny) {
    return res.status(400).json({ message: "Deny is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.CREATE_CATEGORY_PERMISSION,
      {
        category_id,
        input: { server_role_id, user_id, is_user, allow, deny },
      }
    );

    return res
      .status(200)
      .json({ permission: response.createCategoryPermission });
  } catch (error) {
    return next(error);
  }
};

export const updateCategoryPermission = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { permission_id } = req.params;
  const { allow, deny } = req.body;

  if (!permission_id) {
    return res.status(400).json({ message: "Permission ID is required." });
  }

  try {
    const response = await graphQLClient().request(
      categoryMutations.UPDATE_CATEGORY_PERMISSION,
      {
        permission_id,
        input: { allow, deny },
      }
    );

    return res
      .status(200)
      .json({ permission: response.updateCategoryPermission });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategoryPermission = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Permission ID is required." });
  }

  try {
    await graphQLClient().request(
      categoryMutations.DELETE_CATEGORY_PERMISSION,
      {
        id,
      }
    );

    return res.status(200).json({ message: "Permission deleted." });
  } catch (error) {
    return next(error);
  }
};
