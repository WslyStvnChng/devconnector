const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validateLoginInput(data) {
  let errors = {};

  // data.name checks using validator, if not empty will be whatever it is, if is empty will be empty string 
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  // TESTING
  // If validator of email is empty, show invalid email
  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }
  // If validator of email is empty, show error message
  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }
  // If validator of password is empty, show error message
  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};