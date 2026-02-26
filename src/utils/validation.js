const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isCategory = (value) => value === 'internal' || value === 'external';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function validateRegister(body) {
  const errors = [];
  if (!isNonEmptyString(body.fullname)) {
    errors.push('fullname is required');
  }
  if (!isEmail(body.email)) {
    errors.push('email is invalid');
  }
  if (!isNonEmptyString(body.password) || body.password.trim().length < 6) {
    errors.push('password must be at least 6 characters');
  }
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!isEmail(body.email)) {
    errors.push('email is invalid');
  }
  if (!isNonEmptyString(body.password)) {
    errors.push('password is required');
  }
  return errors;
}

function validateDevice(body) {
  const errors = [];
  if (!isNonEmptyString(body.name)) {
    errors.push('name is required');
  }
  if (!isCategory(body.category)) {
    errors.push("category must be 'internal' or 'external'");
  }
  if (!isNonEmptyString(body.description)) {
    errors.push('description is required');
  }
  if (body.image !== undefined && !isNonEmptyString(body.image)) {
    errors.push('image must be a string');
  }
  if (body.specs !== undefined && !isPlainObject(body.specs)) {
    errors.push('specs must be an object');
  }
  return errors;
}

function validateDeviceUpdate(body) {
  const errors = [];
  const hasAny =
    body.name !== undefined ||
    body.category !== undefined ||
    body.description !== undefined ||
    body.image !== undefined ||
    body.specs !== undefined;

  if (!hasAny) {
    errors.push('at least one field is required');
    return errors;
  }

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }
  if (body.category !== undefined && !isCategory(body.category)) {
    errors.push("category must be 'internal' or 'external'");
  }
  if (body.description !== undefined && !isNonEmptyString(body.description)) {
    errors.push('description must be a non-empty string');
  }
  if (body.image !== undefined && !isNonEmptyString(body.image)) {
    errors.push('image must be a string');
  }
  if (body.specs !== undefined && !isPlainObject(body.specs)) {
    errors.push('specs must be an object');
  }
  return errors;
}

function validateTest(body) {
  const errors = [];
  if (!isNonEmptyString(body.deviceId)) {
    errors.push('deviceId is required');
  }
  if (!isNonEmptyString(body.question)) {
    errors.push('question is required');
  }
  if (!Array.isArray(body.options) || body.options.length < 2) {
    errors.push('options must be an array of at least 2 items');
  } else if (!body.options.every((opt) => isNonEmptyString(opt))) {
    errors.push('options must be non-empty strings');
  }
  if (!Number.isInteger(body.correctAnswer)) {
    errors.push('correctAnswer must be an integer index');
  } else if (
    Array.isArray(body.options) &&
    (body.correctAnswer < 0 || body.correctAnswer >= body.options.length)
  ) {
    errors.push('correctAnswer is out of range');
  }
  return errors;
}

function validateTestUpdate(body) {
  const errors = [];
  const hasAny =
    body.deviceId !== undefined ||
    body.question !== undefined ||
    body.options !== undefined ||
    body.correctAnswer !== undefined;
  if (!hasAny) {
    errors.push('at least one field is required');
    return errors;
  }
  if (body.deviceId !== undefined && !isNonEmptyString(body.deviceId)) {
    errors.push('deviceId must be a non-empty string');
  }
  if (body.question !== undefined && !isNonEmptyString(body.question)) {
    errors.push('question must be a non-empty string');
  }
  if (body.options !== undefined) {
    if (!Array.isArray(body.options) || body.options.length < 2) {
      errors.push('options must be an array of at least 2 items');
    } else if (!body.options.every((opt) => isNonEmptyString(opt))) {
      errors.push('options must be non-empty strings');
    }
  }
  if (body.correctAnswer !== undefined && !Number.isInteger(body.correctAnswer)) {
    errors.push('correctAnswer must be an integer index');
  }
  return errors;
}

function validateResultInput(body) {
  const errors = [];
  if (!isNonEmptyString(body.deviceId)) {
    errors.push('deviceId is required');
  }
  if (!Array.isArray(body.answers)) {
    errors.push('answers must be an array');
  } else {
    body.answers.forEach((item, index) => {
      if (!item || !isNonEmptyString(item.testId)) {
        errors.push(`answers[${index}].testId is required`);
      }
      if (
        item &&
        item.answerIndex !== null &&
        item.answerIndex !== undefined &&
        !Number.isInteger(item.answerIndex)
      ) {
        errors.push(`answers[${index}].answerIndex must be integer or null`);
      }
    });
  }
  return errors;
}

module.exports = {
  isNonEmptyString,
  isEmail,
  isCategory,
  validateRegister,
  validateLogin,
  validateDevice,
  validateDeviceUpdate,
  validateTest,
  validateTestUpdate,
  validateResultInput
};
