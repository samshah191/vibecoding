"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class User {
    static async create(userData) {
        return prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    static async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    static async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    static async updateById(id, userData) {
        return prisma.user.update({
            where: { id },
            data: userData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    static async deleteById(id) {
        return prisma.user.delete({
            where: { id }
        });
    }
    static async getUserApps(userId) {
        return prisma.app.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map