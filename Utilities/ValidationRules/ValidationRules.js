
const Joi = require('joi');

const registerSchema = Joi.object().keys({
    Email: Joi.string().email(),
    Password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/),
    Mobile: [Joi.string(), Joi.number()]
});


module.exports={
    registerSchema:registerSchema
};