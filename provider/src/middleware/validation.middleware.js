const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details = error.details.reduce((acc, curr) => {
        acc[curr.path.join('.')] = curr.message;
        return acc;
      }, {});

      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details
      });
    }
    
    next();
  };
};

// Simple validation rules without external dependencies
const validateAuthorization = (req, res, next) => {
  const { cardNumber, expiryMonth, expiryYear, cvv, amount, currency, merchantId } = req.body;
  const errors = {};

  if (!cardNumber || !/^\d{13,19}$/.test(cardNumber)) {
    errors.cardNumber = 'Card number must be 13-19 digits';
  }

  if (!expiryMonth || !/^\d{2}$/.test(expiryMonth) || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
    errors.expiryMonth = 'Expiry month must be 01-12';
  }

  if (!expiryYear || !/^\d{4}$/.test(expiryYear)) {
    errors.expiryYear = 'Expiry year must be in YYYY format';
  }

  if (!cvv || !/^\d{3,4}$/.test(cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits';
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Currency must be a 3-letter ISO code';
  }

  if (!merchantId || typeof merchantId !== 'string') {
    errors.merchantId = 'Merchant ID is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: errors
    });
  }

  next();
};

const validateSettlement = (req, res, next) => {
  const { transactionId, authorizationCode, amount, currency } = req.body;
  const errors = {};

  if (!transactionId || typeof transactionId !== 'string') {
    errors.transactionId = 'Transaction ID is required';
  }

  if (!authorizationCode || typeof authorizationCode !== 'string') {
    errors.authorizationCode = 'Authorization code is required';
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Currency must be a 3-letter ISO code';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: errors
    });
  }

  next();
};

const validateRefund = (req, res, next) => {
  const { transactionId, amount, currency, reason } = req.body;
  const errors = {};

  if (!transactionId || typeof transactionId !== 'string') {
    errors.transactionId = 'Transaction ID is required';
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Currency must be a 3-letter ISO code';
  }

  if (!reason || typeof reason !== 'string' || reason.length < 1 || reason.length > 500) {
    errors.reason = 'Reason is required and must be 1-500 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateRequest,
  validateAuthorization,
  validateSettlement,
  validateRefund
};
