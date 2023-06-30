const Joi = require('joi');

const ExportPayloadSchema = Joi.object({
    targetEmail: Joi.string().email().required(),
});

module.exports = {
    ExportPayloadSchema,
};
