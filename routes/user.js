const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const User = require("../models/user");

const csrf = require("csurf");
const passport = require("passport");

router.get("/profile", isLoggedIn, (req, res, next) => {
	var email = req.user.email;
	var name = req.user.name;
	var adress = req.user.adress;
	var birth_date = req.user.birth_date;
	var bio = req.user.bio;
	// var orders = [];
	// Order.find({ user: req.user._id }, (err, result) => {
	// 	for (var i = 0; i < result.length; i++) {
	// 		orders.push(result[i]);
	// 	}
	res.render("user/profile", {
		title: "Profile",
		email: email,
		name: name || null,
		adress: adress || null,
		birth_date: birth_date || null,
		bio: bio || null
	});
	// });
});

// router.post("/remove_order", isLoggedIn, (req, res, next) => {
// 	var order_id = req.body.remove;
// 	Order.remove({ _id: order_id }, (err, result) => {
// 		res.redirect("/user/profile");
// 	});
// });

router.get("/change", isLoggedIn, (req, res, next) => {
	var email = req.user.email;
	var name = req.user.name;
	var adress = req.user.adress;
	var birth_date = req.user.birth_date;
	var bio = req.user.bio;
	res.render("user/change", {
		title: "Change info",
		email: email,
		name: name || null,
		adress: adress || null,
		birth_date: birth_date || null,
		bio: bio || null
	});
});

router.post("/change", isLoggedIn, (req, res, next) => {
	User.findOneAndUpdate(
		{
			_id: req.user._id
		},
		{
			$set: {
				email: req.body.email,
				name: req.body.name || "",
				adress: req.body.adress || "",
				birth_date: req.body.birth_date || "",
				bio: req.body.bio || ""
			}
		},
		(err, result) => {
			res.redirect("/user/profile");
		}
	);
});

router.get("/logout", (req, res, next) => {
	req.logout();
	res.redirect("/");
});

router.use("/", isNotLoggedIn, (req, res, next) => {
	next();
});

router.get("/signup", (req, res, next) => {
	var messeges = req.flash("error");
	res.render("user/signup", {
		csrfToken: req.csrfToken,
		messeges: messeges,
		hasErrors: messeges.length > 0,
		title: "Sign Up"
	});
});

router.post(
	"/signup",
	passport.authenticate("local.signup", {
		successRedirect: "/user/profile",
		failureRedirect: "/user/signup",
		failureFlash: true
	})
);

router.get("/login", (req, res, next) => {
	var messeges = req.flash("error");
	res.render("user/login", {
		messeges: messeges,
		hasErrors: messeges.length > 0,
		title: "Sign In"
	});
});

router.post(
	"/login",
	passport.authenticate("local.login", {
		successRedirect: "/user/profile",
		failureRedirect: "/user/login",
		failureFlash: true
	}),
	(req, res, next) => {
		console.log(req.body);
	}
);

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
}

function isNotLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
}
