const mongoose = require("mongoose");
const { Schema } = mongoose;
const FollowerSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  follows: {
    type: String,
    required: true
  }
});
FollowerSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    username: this.username,
    follows: this.follows
  };
};
mongoose.model("Follower", FollowerSchema);
