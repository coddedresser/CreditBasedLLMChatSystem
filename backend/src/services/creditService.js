const User = require('../models/User');

exports.calculateCredits = (content) => {
  // Approximate: 1 credit per 4 characters (similar to tokens)
  return Math.ceil(content.length / 4);
};

exports.checkAndDeductCredits = async (userId, amount) => {
  try {
    const result = await User.deductCredits(userId, amount);
    return result ? result.credits : null;
  } catch (error) {
    console.error('Credit deduction error:', error);
    return null;
  }
};

exports.addCredits = async (userId, amount) => {
  try {
    const result = await User.updateCredits(userId, amount);
    return result.credits;
  } catch (error) {
    console.error('Add credits error:', error);
    return null;
  }
};