const User = require("../models/user");

module.exports.index = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("wishlist")
    .populate({
      path: "wishlist",
      options: { sort: { createdAt: -1 } },
    });

  res.render("users/wishlist.ejs", {
    listings: user.wishlist,
  });
};

module.exports.toggle = async (req, res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.id;

  const isSaved = user.wishlist.includes(listingId);

  if (isSaved) {
    user.wishlist.pull(listingId);
  } else {
    user.wishlist.push(listingId);
  }

  await user.save();

  res.json({ saved: !isSaved });
};
