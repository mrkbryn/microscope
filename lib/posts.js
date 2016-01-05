Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) { return ownsDocument(userId, post); },
	remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
	update: function(userId, post, fieldNames) {
		// may only edit the following two fields:
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});

Posts.deny({
	update: function(userId, post, fieldNames, modifier) {
		var errors = validatePost(modifier.$set);
		return errors.title || errors.url;
	}
});

validatePost = function(post) {
	var errors = {};
	if (!post.title)
		errors.title = "Please fill in a headline";
	if (!post.url)
		errors.url = "Please fill in a URL";
	return errors;
}

Meteor.methods({
	postInsert: function(postAttributes) {
		// that userId is a String
		check(Meteor.userId(), String);

		// check that postAttributes follows this format
		check(postAttributes, {
			title: String,
			url: String
		});

		var errors = validatePost(postAttributes);
		if (errors.title || errors.url)
			throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

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