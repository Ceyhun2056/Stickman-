const Joi = require('joi');

// User registration validation
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data);
};

// User login validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data);
};

// Comment validation
const commentValidation = (data) => {
  const schema = Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 1000 characters',
        'any.required': 'Comment content is required'
      }),
    rating: Joi.number()
      .min(1)
      .max(10)
      .optional()
      .messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating cannot exceed 10'
      })
  });

  return schema.validate(data);
};

// Movie ID validation
const movieIdValidation = (movieId) => {
  const schema = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Movie ID must be a number',
      'number.integer': 'Movie ID must be an integer',
      'number.positive': 'Movie ID must be positive',
      'any.required': 'Movie ID is required'
    });

  return schema.validate(movieId);
};

// Search query validation
const searchValidation = (data) => {
  const schema = Joi.object({
    query: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Search query cannot be empty',
        'string.max': 'Search query cannot exceed 100 characters',
        'any.required': 'Search query is required'
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    genre: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'Genre must be a number',
        'number.integer': 'Genre must be an integer'
      }),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .optional()
      .messages({
        'number.base': 'Year must be a number',
        'number.integer': 'Year must be an integer',
        'number.min': 'Year must be after 1900',
        'number.max': `Year cannot be more than ${new Date().getFullYear() + 5}`
      })
  });

  return schema.validate(data);
};

// Validation middleware factory
const validate = (validationFunction) => {
  return (req, res, next) => {
    const { error } = validationFunction(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = {
  registerValidation,
  loginValidation,
  commentValidation,
  movieIdValidation,
  searchValidation,
  validate
};
