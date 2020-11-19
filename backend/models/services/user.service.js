const config = require('./config.json');
const bcrypt = require('bcryptjs');
const userEntity = require('../entities/user.entity');
const Q = require('q');
const mongo = require('mongoose');
const userFactory = require('../entities/user.entity');

const db = mongo.connect(config.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000
}).then(
    () => {console.log("MongoDB Running")},
    err => {console.log("DB Connection Failed")}
);

var service = {};

service.authenticate = authenticate;
service.getByName = getByName;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;


module.exports = service;

async function authenticate(userParam){
    try {
        //if login via username
        let password = userParam.password;
        if (userParam.username) {
            let loginResult = await userFactory.loginByName(userParam.username, password);
            if (loginResult) {
                return "successful login";
            }
            return "wrong username password combination"
        }
        else {
            let loginResult = await userFactory.loginById(userParam.accountId, password);
            if (loginResult) {
                return "successful login";
            }
            return "wrong username password combination"
        }

    } catch (err) {
        return err;
    }
}

async function create(userParam) {
    let queryName =await userFactory.findByName(userParam.username);
    let queryId = await userFactory.findById(userParam.accountId);
    //if user not found in database
    //TODO: implement security feature on password (bcrypt)
    if (queryName == null && queryId == null) {
        let user = userParam.username;
        let pass = userParam.password;
        let id = userParam.accountId;
        let token = userFactory.register(user, pass, id);
        if (token) {
            await userFactory.setEmail(id, userParam.email);
            await userFactory.setGender(id, userParam.gender);
            return "successful registration";
        }
        return "unknown err when saving to database";
    }
    if (queryName != null && queryId != null) {
        return "duplicate accountId and username";
    }
    else if (queryName != null) {
        return "duplicate username";
    }
    else {
        return "duplicate accountID";
    }
}

function getById() {}
function getByName() {}
function update() {}
function _delete() {}

//notes: why not just write all code in user.service.js?
//       isn't that what this class is for? we already have a controller class...
/*
    well traditionally, model layer actually handles all the request with model
    so user.service is really *not* another layer of controller,
    it mixes or utilizes variety of functions in entity to fulfill request from
    the controller class.

    This is in fact MVC 2 (MVC + S) where service is another layer inside the model
 */

//TODO: read TODO in user.entity.js first
//  1. write function update(), _delete() (be sure to use async if possible)
//  2. implement any functions you may need in user.entity.js
//  3. implement controller function in users.controller.js
//  4. test three functions together for bugs, correctness, robustness before push


