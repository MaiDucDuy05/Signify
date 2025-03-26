import User from "../postgres/models/User.js";

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const getUsers = async () => {
    return await User.findAll();
};

export const getUserById = async (id) => {
    return await User.findByPk(id);
};
