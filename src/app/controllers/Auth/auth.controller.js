// @ts-nocheck
const Validator = require('validatorjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('../../../config/nodemailer.config');

const User = require('../../models/user.model');

/**
 * * Login
 * 
 * @param email
 * @param password
 * @returns loggedIn User
 */
exports.login = async (req, res, next) => {

	let rules = {
		email: 'required|email',
		password: 'required'
	}

	let validation = new Validator(req.body, rules);

	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}

	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('user_not_found');
			error.statusCode = 401;
			throw error;
		}
		loadedUser = user;
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('wrong_password');
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign(
			{
				userId: loadedUser._id
			},
			'somesupersecretsecret'
		);
		loadedUser['confirmationCode'] = token;
		await loadedUser.save()
		res.status(200).json(loadedUser);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

/**
 * * Register New User
 * 
 * @param email
 * @param password
 * @param username
 * @returns Object message, User ID
 */
exports.register = async (req, res, next) => {

	let rules = {
		email: 'required|email',
		password: 'required',
		firstName: 'required',
		lastName: 'required',
	}

	let validation = new Validator(req.body, rules);

	if (validation.fails()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = validation.errors.all();
		throw error;
	}

	try {
		const userExist = await User.findOne({email: req.body.email});
		if (!userExist) {
			const token = jwt.sign({email: req.body.email}, "somesupersecretsecret");

			const user = new User({
				email: req.body.email,
				password: await bcrypt.hash(req.body.password, 12),
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				tagName: `@${req.body.firstName.substring(0,1).toLowerCase()}${req.body.lastName.toLowerCase()}`,
				confirmationCode: token
			});
			const result = await user.save();
			res.status(201).json({ message: 'confirmation_msg'});
			nodemailer.sendConfirmationEmail(result.firstName, result.email, result.confirmationCode);
			
		} else {
			res.status(200).json({message: 'user_exist'});
		}
		
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

/**
 * * Get LoggedIn User Details
 * 
 * @param userId
 * @returns LoggedIn User Object
 */
exports.details = async (req, res, next) => {
	try {
		const authUser = await User.findOne({'_id': req.userId});
		if (!authUser) {
			const error = new Error('User Not found');
			error.statusCode = 401;
			throw error;
		}
		res.status(200).json(authUser);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.verifyUser = async (req, res, next) => {
	try {
		const user = await User.findOne({confirmationCode: req.params.confirmationCode});
		if (!user) {
			res.status(404).send({ message: "User Not found." });
		} else {
			user.status = "Active";
			await user.save();
			res.status(200).send({ message: "Verification Success" });
		}
	} catch (error) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
}
