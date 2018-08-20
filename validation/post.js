const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validatePostInput(data) {
  let errors = {};

  // data.name checks using validator, if not empty will be whatever it is, if is empty will be empty string 
  data.text = !isEmpty(data.text) ? data.text : '';

  if (!Validator.isLength(data.text, {
      min: 10,
      max: 300
    })) {
    errors.text = 'Post must be between 10 and 300 characters'
  }

  // If validator of email is empty, show invalid email
  if (!Validator.isEmpty(data.text)) {
    errors.text = 'Text field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};