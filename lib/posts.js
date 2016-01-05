Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) { return ownsDocument(userId, post); },
	remove: function(userId, post) { return ownsDocument(userId, post); },
});

Meteor.methods({
	postInsert: function(postAttributes) {
		// that userId is a String
		check(Meteor.userId(), String);

		// check that postAttributes follows this format
		check(postAttributes, {
			title: String,
			url: String
		});

		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		// if postWithSameLink exists in database, return a flag indicating
		// it exists and the id of the post
		if (postWithSameLink) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}

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
});