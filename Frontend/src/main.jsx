import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"

import Layout from './Layout.jsx'
import Landing from './Pages/Landing.jsx'
import Login from './Pages/Login.jsx'

import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import Signup from './Pages/Signup.jsx'
import ChannelDashboard from './Pages/Dashboard.jsx'
import EditDetails from './Pages/EditDetails.jsx'
import YourVideos from './Pages/YourVideos.jsx'
import UploadVideo from './Pages/UploadVideo.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path='/channelDashboard' element={<ChannelDashboard />} />
      <Route path='/editchannel' element={<EditDetails />} />
      <Route path='/yourvideos'element={<YourVideos />} />
      <Route path='/uploadvideo'element={<UploadVideo />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>

      <RouterProvider router={router}/>
      
  </StrictMode>,
)
