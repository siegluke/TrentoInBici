const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const tokenCheckerAdmin = function(req, res, next) {
	
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// if there is no token
	if (!token) {
        console.log("No token provided")
		return res.status(401).send({ 
			success: false,
			message: 'No token provided.'
		});
	}

	// decode token, verifies secret and checks exp
	jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
		if (err) {
            console.log("error"+ decoded.admin + decoded.email)
            console.log("Token admin failed authentication");
			return res.status(403).send({
				success: false,
				message: 'Failed to authenticate token admin.'
			});		
		} else {
            console.log(decoded.admin + decoded.email)
            if(decoded.admin){
                console.log("Token admin")
                // if everything is good, save to request for use in other routes
                req.loggedUser = decoded;
                next();
            }else{
                console.log("Token admin failed authentication");
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });	
            }
		}
	});
	
};

module.exports = tokenCheckerAdmin