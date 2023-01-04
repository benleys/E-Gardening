const Joi = require("joi");

const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const signupSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(10).required(),
    confirmPassword: Joi.ref('password'),
});

const updateSchema = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string().email(),
});
exports.validateSignup = validator(signupSchema);
exports.validateUpdate = validator(updateSchema);