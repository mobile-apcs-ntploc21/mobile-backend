import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "@models/modelNames";

interface IPackages {
  name: string;
  description: string;

  base_price: number; // In VND, before discount
  is_on_sale: boolean;
  sale_details: {
    discount: number; // In percentage
    end_date: Date;
  };

  duration: number; // In days
  features_list: any;
}

const packageSchema = new Schema<IPackages>(
  {
    name: {
      type: String,
      minlength: [1, "Package name must be at least 1 characters long!"],
      maxlength: [100, "Package name must be at most 100 characters long!"],
      required: [true, "Package name is required!"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
    },
    base_price: {
      type: Number,
      required: [true, "Base price is required!"],
      validate: {
        validator: (value: number) => value > 0,
        message: "Base price must be greater than 0!",
      },
    },

    is_on_sale: {
      type: Boolean,
      default: false,
    },
    sale_details: {
      discount: {
        type: Number,
        validate: {
          validator: (value: number) => value >= 0 && value <= 100,
          message: "Discount must be between 0 and 100!",
        },
      },
      end_date: {
        type: Date,
      },
    },

    duration: {
      type: Number,
      required: [true, "Duration is required!"],
      validate: {
        validator: (value: number) => value > 0,
        message: "Duration must be greater than 0!",
      },
    },
    features_list: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Packages = model<IPackages>(ModelNames.Packages, packageSchema);

export default Packages;
