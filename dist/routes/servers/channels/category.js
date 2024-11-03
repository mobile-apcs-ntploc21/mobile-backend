"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_permission_1 = __importDefault(require("./category_permission"));
const checkCategoryExistenceMiddleware_1 = require("../../../utils/checkCategoryExistenceMiddleware");
const checkCategoryPermissionMiddleware_1 = require("../../../utils/checkCategoryPermissionMiddleware");
const permissions_1 = require("../../../constants/permissions");
const categoryCtrl = __importStar(require("../../../controllers/servers/channels/category"));
const categoryRouter = (0, express_1.Router)({ mergeParams: true });
categoryRouter.patch("/move", (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.MANAGE_CHANNEL]), categoryCtrl.moveAllCategory);
categoryRouter.use("/:categoryId", checkCategoryExistenceMiddleware_1.checkCategoryExistenceMiddleware, category_permission_1.default);
categoryRouter.get("/", (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.VIEW_CHANNEL]), categoryCtrl.getCategories);
categoryRouter.post("/", (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.MANAGE_CHANNEL]), categoryCtrl.createCategory);
categoryRouter.patch("/:categoryId", checkCategoryExistenceMiddleware_1.checkCategoryExistenceMiddleware, (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.MANAGE_CHANNEL]), categoryCtrl.updateCategory);
categoryRouter.delete("/:categoryId", checkCategoryExistenceMiddleware_1.checkCategoryExistenceMiddleware, (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.MANAGE_CHANNEL]), categoryCtrl.deleteCategory);
categoryRouter.patch("/:categoryId/move", checkCategoryExistenceMiddleware_1.checkCategoryExistenceMiddleware, (0, checkCategoryPermissionMiddleware_1.checkCategoryPermissionMiddleware)([permissions_1.CategoryPermissions.MANAGE_CHANNEL]), categoryCtrl.moveCategory);
exports.default = categoryRouter;
