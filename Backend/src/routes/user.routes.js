import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewire.js"

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
  

export default router;  