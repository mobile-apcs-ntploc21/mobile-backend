import mongoose, { Error, ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";

import DateTime from "@/graphql/scalars/DateTime";
import UserModel from "@/models/user";
import PackageModel from "@/models/payment/packages";

const getPackages = async () => {
  try {
    // Retrieve all packages with is_hidden set to false
    const packages = await PackageModel.find({ is_hidden: false });

    return packages;
  } catch (error) {
    throw error;
  }
};

const getPackage = async (id: string) => {
  try {
    const _package = await PackageModel.findById(id);

    if (!_package) {
      throw new UserInputError("Invalid package id!");
    }

    return _package;
  } catch (error) {
    throw error;
  }
};

const createPackage = async (
  name: string,
  description: string,
  base_price: number,
  is_on_sale: boolean,
  sale_details: any,
  duration: number,
  features_list: any
) => {
  if (is_on_sale && !sale_details) {
    throw new ValidationError("Sale details required for on sale packages!");
  }

  if (is_on_sale && sale_details.end_date < new Date()) {
    throw new ValidationError("Sale end date must be in the future!");
  }

  if (
    is_on_sale &&
    (sale_details.discount > 100 || sale_details.discount < 0)
  ) {
    throw new ValidationError(
      "Invalid discount percentage. Must be in range from 0 to 100!"
    );
  }

  if (!is_on_sale) {
    sale_details = {
      discount: 0,
      end_date: null,
    };
  }

  try {
    const _package = new PackageModel({
      name,
      description,
      base_price,
      is_on_sale,
      sale_details,
      duration,
      features_list,
    });

    await _package.save();
    return _package;
  } catch (error) {
    throw error;
  }
};

const updatePackage = async (
  id: string,
  name: string,
  description: string,
  base_price: number,
  is_on_sale: boolean,
  sale_details: any,
  duration: number,
  features_list: any,
  is_hidden: boolean
) => {
  if (is_on_sale && !sale_details) {
    throw new ValidationError("Sale details required for on sale packages!");
  }

  if (is_on_sale && sale_details.end_date < new Date()) {
    throw new ValidationError("Sale end date must be in the future!");
  }

  if (
    is_on_sale &&
    (sale_details.discount > 100 || sale_details.discount < 0)
  ) {
    throw new ValidationError(
      "Invalid discount percentage. Must be in range from 0 to 100!"
    );
  }

  try {
    const _package = PackageModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        base_price,
        is_on_sale,
        sale_details,
        duration,
        features_list,
        is_hidden,
      },
      { new: true }
    );

    return _package;
  } catch (error) {
    throw error;
  }
};

const deletePackage = async (id: string) => {
  try {
    const _package = await PackageModel.findByIdAndDelete(id);

    if (!_package) {
      throw new UserInputError("Invalid package id!");
    }

    return _package;
  } catch (error) {
    throw error;
  }
};

const deleteAllPackages = async (confirm: boolean) => {
  if (!confirm) {
    throw new ValidationError("Confirmation required to delete all packages!");
  }

  try {
    await PackageModel.deleteMany();
    return true;
  } catch (error) {
    throw error;
  }
};

const APIResolver: IResolvers = {
  DateTime,
  Query: {
    packages: async () => getPackages(),
    package: async (_, { id }) => getPackage(id),
  },
  Mutation: {
    createPackage: async (
      _,
      {
        name,
        description,
        base_price,
        is_on_sale,
        sale_details,
        duration,
        features_list,
      }
    ) =>
      createPackage(
        name,
        description,
        base_price,
        is_on_sale,
        sale_details,
        duration,
        features_list
      ),
    updatePackage: async (
      _,
      {
        id,
        name,
        description,
        base_price,
        is_on_sale,
        sale_details,
        duration,
        features_list,
        is_hidden,
      }
    ) =>
      updatePackage(
        id,
        name,
        description,
        base_price,
        is_on_sale,
        sale_details,
        duration,
        features_list,
        is_hidden
      ),
    deletePackage: async (_, { id }) => deletePackage(id),
    deleteAllPackages: async (_, { confirm }) => deleteAllPackages(confirm),
  },
};

export default { API: APIResolver };
