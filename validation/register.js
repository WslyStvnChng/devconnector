const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validateRegisterInput(data) {
  let errors = {};

  // data.name checks using validator, if not empty will be whatever it is, if is empty will be empty string 
  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  // TESTING

  // If length of validator takes in data.name(above) will have a minimum of 2 and maximum of 30 characters
  if (!Validator.isLength(data.name, {
      min: 2,
      max: 30
    })) {
    errors.name = 'Name must be between 2 and 30 characters'
  }
  // If validator of name is empty, show error message
  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }
  // If validator of email is empty, show error message
  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }
  // If validator of email is empty, show invalid email
  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }
  // If validator of password is empty, show error message
  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }
  // If validator of password is <6, show error message 
  if (!Validator.isLength(data.password, {
      min: 6,
      max: 30
    })) {
    errors.password = 'Password must be at least 6 characters';
  }
  // If validator of password2 is empty, show error message
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirm Password field is required';
  }
  // If validator of both passwords don't match, will show error message
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};