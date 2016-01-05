Template.postsList.helpers({
	posts: function() {
		return Posts.find({}, {sorted: {submitted: -1}});
	}
});