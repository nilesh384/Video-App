import Subscription from "../models/subscription.model.js";
import apiResponse from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const toogleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!subscription) {
    const newSubscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new apiResponse(200, newSubscription, "Subscribed successfully"));
  }

  await subscription.deleteOne();

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Unsubscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new apiError(400, "Invalid channel ID");
  }
  // Count total number of subscribers
  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });

  // Fetch subscriber user details (optional)
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "fullname username avatar")
    .select("subscriber -_id");

  return res.status(200).json(
    new apiResponse(
      200,
      {
        count: subscriberCount,
        subscribers: subscribers.map((sub) => sub.subscriber), // flatten
      },
      "Fetched channel subscriber data successfully"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new apiError(400, "Invalid subscriber ID");
  }

  // Step 1: Fetch all subscriptions where the user is the subscriber
  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "fullname username avatar") // Populate basic channel info
    .select("channel -_id");

  if (!subscriptions.length) {
    return res
      .status(200)
      .json(new apiResponse(200, [], "No subscribed channels found"));
  }

  // Step 2: Return the populated channels
  const channels = subscriptions.map((sub) => sub.channel);

  return res
    .status(200)
    .json(
      new apiResponse(200, channels, "Fetched subscribed channels successfully")
    );
});

export { toogleSubscription, getUserChannelSubscribers, getSubscribedChannels };
