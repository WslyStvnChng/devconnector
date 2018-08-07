const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validateEducationInput(data) {
  let errors = {};

  // data.name checks using validator, if not empty will be whatever it is, if is empty will be empty string 
  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';


  // TESTING
  if (Validator.isEmail(data.school)) {
    errors.school = 'School field is required';
  }
  if (Validator.isEmail(data.degree)) {
    errors.degree = 'Degree field is required';
  }
  if (Validator.isEmail(data.fieldofstudy)) {
    errors.fieldofstudy = 'Field of study date field is required';
  }
  if (Validator.isEmail(data.from)) {
    errors.from = 'From date field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};