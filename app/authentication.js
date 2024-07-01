const express = require('express');
const router = express.Router();
require('dotenv').config()

const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const User = mongoose.model('users', new Schema({ 
	id: String,
    email: String,
    password: String,
}));

router.post('', async function(req, res) {

	var user = {};
	var admin=false;

	//Non è stato ancora implementato l'uso di Google per l'autenticazione
	if ( req.body.googleToken ) {
		const payload = await verify( req.body.googleToken ).catch(console.error);
		console.log(payload);

		user = await User.findOne({ email: payload['email'] }).exec();
		if ( ! user ) {
			user = new Student({
				email: payload['email'],
				password: 'default-google-password-to-be-changed'
			});
			await user.save().exec();
			console.log('Student created after login with google');	
		}		
	}
	else {
		// find the user in the local db
		user = await User.findOne({
			email: req.body.email
		}).exec();
	
		// local user not found
		if (!user) {
			res.status(400).json({ success: false, message: 'Authentication failed. User not found.' });
			return;
		}
	
		// check if password matches
		if (user.password != req.body.password) {
			res.status(400).json({ success: false, message: 'Authentication failed. Wrong password.' });
			return;
		}
	}

	if(user.email=='admin'){
		admin=true;
	}
	// if user is found or created create a token
	var payload = {
		email: user.email,
		id: user._id,
		admin: admin
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 600, // 10 minuti
	}
	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	res.status(200).json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: user.email,
		id: user._id,
		admin: admin,
		sessionTime: options.expiresIn,
		self: "api/v2/" + user._id
	});

});

module.exports = router;