"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAllCategory = exports.moveCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const graphql_1 = __importDefault(require("../../../utils/graphql"));
const queries_1 = require("../../../graphql/queries");
const mutations_1 = require("../../../graphql/mutations");
const _getCategory = async (category_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverCategoryQueries.GET_CATEGORY, {
        category_id,
    });
    return response.getCategory;
};
const _getCategories = async (server_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverCategoryQueries.GET_CATEGORIES, {
        server_id,
    });
    const categories = response.getCategories.map((category) => {
        return category;
    });
    categories.sort((a, b) => a.position - b.position);
    return categories;
};
const getCategories = async (req, res, next) => {
    const server_id = res.locals.server_id;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const categories = await _getCategories(server_id).catch(() => null);
        res.status(200).json({ categories });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
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
        const response = await (0, graphql_1.default)().request(mutations_1.categoryMutations.CREATE_CATEGORY, {
            server_id,
            input: { name },
        });
        res.status(200).json({ category: response.createCategory });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    if (!categoryId) {
        res.status(400).json({ message: "Category ID is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.categoryMutations.UPDATE_CATEGORY, {
            category_id: categoryId,
            input: { name },
        });
        res.status(200).json({ category: response.updateCategory });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
        res.status(400).json({ message: "Category ID is required." });
        return;
    }
    try {
        await (0, graphql_1.default)().request(mutations_1.categoryMutations.DELETE_CATEGORY, {
            category_id: categoryId,
        });
        res.status(200).json({ message: "Category deleted." });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteCategory = deleteCategory;
const moveCategory = async (req, res, next) => {
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
        const response = await (0, graphql_1.default)().request(mutations_1.categoryMutations.MOVE_CATEGORY, {
            category_id: categoryId,
            new_position,
        });
        res.status(200).json({ category: response.moveCategory });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.moveCategory = moveCategory;
const moveAllCategory = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const { categories } = req.body;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!categories) {
        res.status(400).json({
            message: "Input of array of categories is required. Eg., categories: [category_id, position].",
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
        const response = await (0, graphql_1.default)().request(mutations_1.categoryMutations.MOVE_ALL_CATEGORY, {
            server_id,
            input: categories,
        });
        res.status(200).json({ categories: response.moveAllCategory });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.moveAllCategory = moveAllCategory;
