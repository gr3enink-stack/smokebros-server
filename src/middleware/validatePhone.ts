import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validate Ghana phone number
export const validatePhone = [
  body('phone')
    .matches(/^\+233\d{9}$/)
    .withMessage('Please provide a valid Ghana phone number (+233XXXXXXXXX)'),
];

// Validate registration input
export const validateRegister = [
  body('phone')
    .matches(/^\+233\d{9}$/)
    .withMessage('Please provide a valid Ghana phone number (+233XXXXXXXXX)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validate login input
export const validateLogin = [
  body('phone')
    .matches(/^\+233\d{9}$/)
    .withMessage('Please provide a valid Ghana phone number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Check validation results
export const checkValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }
  next();
};
