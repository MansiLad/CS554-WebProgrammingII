const mongoCollections = require("../config/mongoCollections")
const users = mongoCollections.users
const { ObjectId } = require('mongodb')
const { dbConnection, closeConnection } = require("../config/mongoConnections");
const bcrypt = require("bcryptjs");

const createUser = async (
    name, username, password
) => {
    const usersindb = await users()

    if (!username) 
      throw 'Provide a username';
    if (typeof username !== 'string') 
      throw 'Username must be a string';
    username = username.trim();
    if (username.length === 0)
      throw 'Username cannot be an empty string or just spaces';
    if(username.length < 3)
      throw 'Username must of atleast 3 characters'
    if(!/^[A-Za-z0-9]+$/.test(username))  
      throw 'Username should only contain letters and numbers and no spaces'
    username = username.toLowerCase()
  
    if(!password)
      throw 'Provide a Password'
    if (typeof password !== 'string') 
      throw 'Password must be a string';
    password = password.trim();
    if (password.length === 0)
      throw 'Password cannot be an empty string or just spaces';
  
    var password_check=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
    if(!password.match(password_check)) 
      throw 'Invalid Password: Password should contain 1 uppercase letter, 1 number, atleast 1 special character, no spaces and of length 6'
  
    const checkusername = await usersindb.findOne({username: username})
  
    if(checkusername !== null)  throw 'Username Exist! Enter a new one'
  
    const saltRounds = 16;
    const encryptpassword = await bcrypt.hash(password, saltRounds)
  
    const newuser = {name: name, username: username, password: encryptpassword}
  
    let flag = {insertedUser: true}
    const insertInfo = await usersindb.insertOne(newuser)
  
    if(insertInfo.insertedCount === 0) {
      throw 'Internal server error'
    } else {
      return flag
    }
}

const getUserById = async (userId) => {

  if (!userId) throw 'Error: You must provide an userId to search for';
  if (typeof userId !== 'string') throw 'Error: userId must be a string';
  userId = userId.trim();
  if (userId.length === 0)
    throw 'Error: userId cannot be an empty string or just spaces';
  if (!ObjectId.isValid(userId)) throw 'Error: invalid object ID';

  const userCol = await users()

  let id = ObjectId(userId)
  const user = await userCol.findOne({_id: id})
  if(!user) throw 'User not found'
  let showUSer = {
    id: id, username: user.username
  }
  return showUSer
}

const checkUser = async (username, password) => { 

    const usersindb = await users()
  
    if (!username) 
      throw 'Provide a username';
    if (typeof username !== 'string') 
      throw 'Username must be a string';
    username = username.trim();
    if (username.length === 0)
      throw 'Username cannot be an empty string or just spaces';
    if(username.length < 4)               
      throw 'username must of atleast 4 characters'
    if(!/^[A-Za-z0-9]+$/.test(username))  
      throw 'Username should only contain letters and numbers and no spaces'
    user_name = username.toLowerCase()
  
    if(!password)
      throw 'Provide a Password'
    if (typeof password !== 'string') 
      throw 'Password must be a string';
    password = password.trim();
    if (password.length === 0)
      throw 'Password cannot be an empty string or just spaces';
  
    const checkusername = await usersindb.findOne({username: user_name})
  
    if(!checkusername)  throw 'Either the username or password is invalid'
  
    const password_check = await bcrypt.compare(password, checkusername.password)
    let flag = {authenticatedUser: true}
  
    if(!password_check){
      throw 'Either the username or password is invalid'
    } 

    return await getUserById(checkusername._id.toString())
};
  
module.exports = {
    createUser, 
    checkUser,
    getUserById
};
  
