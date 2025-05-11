const User = require("../models/User");

/**
 * Update user status (online/offline)
 * @param {string} userId - The user ID
 * @param {string} status - The new status ('online' or 'offline')
 * @return {Promise<Object>} Updated user object
 */
async function updateUserStatus(userId, status) {
  try {
    const update = {
      status,
      lastActive: Date.now(),
    };

    return await User.findByIdAndUpdate(userId, update, { new: true });
  } catch (error) {
    throw new Error(`Error updating user status: ${error.message}`);
  }
}

/**
 * Get all users
 * @return {Promise<Array>} Array of user objects
 */
async function getAllUsers() {
  try {
    return await User.find({}, "name status lastActive");
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}

/**
 * Get user by ID
 * @param {string} userId - The user ID
 * @return {Promise<Object>} User object
 */
async function getUserById(userId) {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
}

module.exports = {
  updateUserStatus,
  getAllUsers,
  getUserById,
};
