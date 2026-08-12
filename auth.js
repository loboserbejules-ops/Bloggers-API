const jwt = require("jsonwebtoken");

require("dotenv").config();

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
        username: user.username,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);
	let token = req.headers.authorization;
	if(typeof token === "undefined"){
		console.log ("No Token");
        return res.send({auth: "Failed. No Token"});
    }
    else{
    	token = token.slice(7,token.length);

    	//verifies that the token is really from the correct place. 
    	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
			if(err){
			    return res.send({
			        auth: "Failed",
			        message: err.message
			    })
			}
			else{
			    req.user = decodedToken;

			    next();
			}    
		});
	}
}

module.exports.verifyAdmin = (req, res, next) => {
	if(req.user.isAdmin == true){
		next();
	} else{
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		});
	}
}

module.exports.errorHandler = (err, req, res, next) => {
    const errorMessage = err.message || "Internal Server Error";

    let formattedError = {
        error: {
            message: errorMessage,
            errorCode: err.code || "SERVER_ERROR",
            details: err.details || null
        }
    };

    if(formattedError.error.message.includes("Course validation failed")){
        return res.send("You need to check your required fields if it has inputs")
    }
    else{
        return res.status(err.statusCode || 500).json(formattedError)
    }
}