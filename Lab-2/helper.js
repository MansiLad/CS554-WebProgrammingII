const {ObjectId} = require('mongodb');


const checkId = (id) => {
  if (!id)
    throw { Status: "400", Message: "You must provide an id to search for" };
  if (typeof id !== "string")
    throw { Status: "400", Message: "Id must be a string" };
  if (id.trim().length === 0)
    throw {
      Status: "400",
      Message: "id cannot be an empty string or just spaces",
    };
  id = id.trim();
  if (!ObjectId.isValid(id))
    throw { Status: "400", Message: "invalid object ID" };
  return id;
};