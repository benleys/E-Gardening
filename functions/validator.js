const Joi = require("joi");

const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const myCustomJoi = Joi.extend(require('joi-phone-number'));

const signupSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    phonenumber: myCustomJoi.string().min(9).max(9).phoneNumber({ defaultCountry: 'BE', format: 'international' }).required(),
    password: Joi.string().min(3).max(10).required(),
    confirmPassword: Joi.ref('password'),
});

const updateSchema = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string().email(),
    phonenumber: myCustomJoi.string().min(9).max(9).phoneNumber({ defaultCountry: 'BE', format: 'international' }),
});

const feedbackSchema = Joi.object({
    rating: Joi.number().integer().min(0).max(5).required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
});

const updateFeedbackSchema = Joi.object({
    rating: Joi.number().integer().min(0).max(5),
    title: Joi.string(),
    description: Joi.string(),
});

exports.validateSignup = validator(signupSchema);
exports.validateUpdate = validator(updateSchema);
exports.validateFeedback = validator(feedbackSchema);
exports.validateUpdateFeedback = validator(updateFeedbackSchema);