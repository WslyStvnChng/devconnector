// Function to check for undefined, mull, object and string
const isEmpty = (value) =>

  //If value === undefined
  value === undefined ||

  //If value === null
  value === null ||

  //If the value === object and keys value length is empty object
  (typeof value === 'object' && Object.keys(value).length === 0) ||

  //typeof value checks type of data
  (typeof value === 'string' && value.trim().length === 0);

module.exports = isEmpty;