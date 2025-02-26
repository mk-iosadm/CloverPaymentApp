import Joi from 'joi';

export const generatePaymentSchema = Joi.object({
  orderId: Joi.string()
    .required()
    .min(3)
    .max(50)
    .pattern(/^[A-Za-z0-9\-_]+$/),
  
  customer: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(100)
      .pattern(/^[A-Za-z\s]+$/),
    
    email: Joi.string()
      .required()
      .email()
      .max(255)
  }).required(),
  
  amount: Joi.number()
    .required()
    .positive()
    .precision(2)
    .max(999999.99),
  
  currency: Joi.string()
    .length(3)
    .uppercase()
    .default('USD')
});

export const validateGeneratePayment = (req, res, next) => {
  const { error } = generatePaymentSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};
