const Validator = require('validator');

// Custom isEmpty
const isEmpty = require('./is-empty');


module.exports = function validateProfileInput(data) {

  // Errors show in object
  let errors = {};

  // If null or undefine will make it to an empty string and send to validator
  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';

  // If validator of the length is NOT between 2 & 4
  if (!Validator.isLength(data.handle, {
      min: 2,
      max: 40
    })) {
    errors.handle = 'Handle needs to between 2 and 4 characters';
  }

  // If validator is empty show these message
  if (Validator.isEmpty(data.handle)) {
    errors.handle = 'Profile handle is required';
  }

  if (Validator.isEmpty(data.status)) {
    errors.status = 'Profile status is required';
  }

  if (Validator.isEmpty(data.skills)) {
    errors.skills = 'Profile skills is required';
  }

  // Check to see if NOT Empty 
  if (!isEmpty(data.website)) {
    // If not check the validator 
    if (!Validator.isURL(data.website)) {
      errors.website = ' Not a valid URL';
    }
  }

  if (!isEmpty(data.youtube)) {
    // If not check the validator 
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = ' Not a valid URL';
    }
  }

  if (!isEmpty(data.twitter)) {
    // If not check the validator 
    if (!Validator.isURL(data.twitter)) {
      errors.twitter = ' Not a valid URL';
    }
  }

  if (!isEmpty(data.facebook)) {
    // If not check the validator 
    if (!Validator.isURL(data.facebook)) {
      errors.facebook = ' Not a valid URL';
    }
  }

  if (!isEmpty(data.linkedin)) {
    // If not check the validator 
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = ' Not a valid URL';
    }
  }

  if (!isEmpty(data.instagram)) {
    // If not check the validator 
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = ' Not a valid URL';
    }
  }

  // Return all the errors if valid
  return {
    errors,
    isValid: isEmpty(errors)
  };
};