const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    //similar to work from previous lessons
    // able to skip over parents and args params
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      return await User.findById(user._id);
    },
  },

  Mutation: {
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { user, token };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { user, token };
    },

    saveBook: async (_, { bookId, authors, description, title, image, link }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { savedBooks: { bookId, authors, description, title, image, link } } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;