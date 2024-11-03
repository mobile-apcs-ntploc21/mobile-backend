"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCategoryExistenceMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const checkCategoryExistenceMiddleware = async (req, res, next) => {
    const { categoryId } = req.params;
    if (res.locals.category_id === categoryId) {
        return next();
    }
    try {
        const { getCategory: category } = await (0, graphql_1.default)().request(queries_1.serverCategoryQueries.GET_CATEGORY, {
            category_id: categoryId,
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.locals.category_id = categoryId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkCategoryExistenceMiddleware = checkCategoryExistenceMiddleware;
