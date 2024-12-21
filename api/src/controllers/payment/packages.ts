import express from "express";

import graphQLClient from "../../utils/graphql";

import { packagesQueries } from "@/graphql/queries";

export const _getPackages = async () => {
  const response = await graphQLClient().request(
    packagesQueries.GET_PACKAGES,
    {}
  );

  console.log(response);

  return response.packages;
};

// ========================================

export const getPackages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const packages = await _getPackages()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    res.status(200).json({
      packages: packages,
    });
  } catch (error) {
    next(error);
  }
};
