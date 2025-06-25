import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, addToWatchHistory, clearWatchHistory ,getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewire.js"
import verifyJwt from "../middlewares/auth.middlewire.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar", 
        maxCount: 1
    },
    {
        name: "coverphoto", 
        maxCount: 1
    }
]), registerUser)

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJwt ,logoutUser);

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJwt, changeCurrentPassword)

router.route("/update-account").patch(verifyJwt, updateAccountDetails)

router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/update-avatar").patch(verifyJwt, upload.single("file"), updateUserAvatar)

router.route("/update-cover").patch(verifyJwt, upload.single("file"), updateUserCoverImage)

router.route("/c/:username").get(verifyJwt, getUserChannelProfile)

router
  .route("/history")
  .get(verifyJwt, getWatchHistory)
  .delete(verifyJwt, clearWatchHistory)
  .post(verifyJwt, addToWatchHistory); 

export default router;  













// router.get("/user/:id", async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).select("-password");
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.status(200).json({ data: user });
//     } catch (error) {
//       res.status(500).json({ error: "Server error" });
//     }
//   });
  

