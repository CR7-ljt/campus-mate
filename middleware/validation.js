const Joi = require('joi');
const { AppError } = require('./errorHandler');

const schemas = {
    register: Joi.object({
        nickname: Joi.string().min(2).max(20).required().messages({
            'string.min': '昵称至少需要2个字符',
            'string.max': '昵称不能超过20个字符',
            'any.required': '昵称是必填项'
        }),
        password: Joi.string().min(6).max(30).required().messages({
            'string.min': '密码至少需要6个字符',
            'string.max': '密码不能超过30个字符',
            'any.required': '密码是必填项'
        }),
        grade: Joi.string().required().messages({
            'any.required': '年级是必填项'
        }),
        major: Joi.string().max(50).required().messages({
            'string.max': '专业名称不能超过50个字符',
            'any.required': '专业是必填项'
        }),
        campus: Joi.string().max(50).allow(''),
        bio: Joi.string().max(200).allow('')
    }),
    
    login: Joi.object({
        nickname: Joi.string().required().messages({
            'any.required': '昵称是必填项'
        }),
        password: Joi.string().required().messages({
            'any.required': '密码是必填项'
        })
    }),
    
    competition: Joi.object({
        title: Joi.string().min(5).max(100).required().messages({
            'string.min': '标题至少需要5个字符',
            'string.max': '标题不能超过100个字符',
            'any.required': '标题是必填项'
        }),
        type: Joi.string().valid('math_modeling', 'internet_plus', 'challenge_cup', 'innovation', 'programming', 'english', 'culture', 'other').required(),
        maxMembers: Joi.number().integer().min(1).max(20).required().messages({
            'number.min': '组队人数至少1人',
            'number.max': '组队人数不能超过20人',
            'any.required': '组队人数是必填项'
        }),
        currentMembers: Joi.number().integer().min(0).required().messages({
            'number.min': '当前人数不能为负数',
            'any.required': '当前人数是必填项'
        }),
        skills: Joi.string().max(200).required().messages({
            'string.max': '擅长技能不能超过200个字符',
            'any.required': '擅长技能是必填项'
        }),
        requirements: Joi.string().max(500).required().messages({
            'string.max': '招募要求不能超过500个字符',
            'any.required': '招募要求是必填项'
        }),
        deadline: Joi.date().required().messages({
            'any.required': '比赛时间是必填项'
        }),
        contact: Joi.string().max(50).required().messages({
            'string.max': '联系方式不能超过50个字符',
            'any.required': '联系方式是必填项'
        })
    }),
    
    meal: Joi.object({
        title: Joi.string().min(5).max(100).required().messages({
            'string.min': '标题至少需要5个字符',
            'string.max': '标题不能超过100个字符',
            'any.required': '标题是必填项'
        }),
        type: Joi.string().valid('canteen', 'restaurant', 'milk_tea', 'night_snack', 'weekend').required(),
        time: Joi.string().valid('today', 'tomorrow', 'weekend').required(),
        location: Joi.string().max(100).required().messages({
            'string.max': '地点不能超过100个字符',
            'any.required': '地点是必填项'
        }),
        taste: Joi.string().max(50).allow(''),
        dietaryRestrictions: Joi.string().max(100).allow(''),
        contact: Joi.string().max(50).required().messages({
            'string.max': '联系方式不能超过50个字符',
            'any.required': '联系方式是必填项'
        })
    }),
    
    hobby: Joi.object({
        title: Joi.string().min(5).max(100).required().messages({
            'string.min': '标题至少需要5个字符',
            'string.max': '标题不能超过100个字符',
            'any.required': '标题是必填项'
        }),
        type: Joi.string().valid('basketball', 'running', 'badminton', 'movie', 'reading', 'gaming', 'photography', 'cycling', 'craft', 'study').required(),
        duration: Joi.string().valid('short', 'long').required(),
        description: Joi.string().max(500).required().messages({
            'string.max': '描述不能超过500个字符',
            'any.required': '描述是必填项'
        }),
        contact: Joi.string().max(50).required().messages({
            'string.max': '联系方式不能超过50个字符',
            'any.required': '联系方式是必填项'
        })
    })
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return next(new AppError('验证schema不存在', 500));
        }
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return next(new AppError(errors.join('; '), 400));
        }
        
        next();
    };
};

module.exports = validate;