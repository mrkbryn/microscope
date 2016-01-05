Posts = new Mongo.Collection('posts');

Meteor.methods({
	postInsert: function(postAttributes) {
		// that userId is a String
		check(Meteor.userId(), String);

		// check that postAttributes follows this format
		check(postAttributes, {
			title: String,
			url: String
		});

		// extend the submitted postAttributes with the
		// userId, username, and the date of the user
		// who submitted this post to include these attributes
		// in our database
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date()
		});

		var postId = Posts.insert(post);

		// return the resulting _id to the client in a JavaScript object
		return {
			_id: postId
		};
	}
})