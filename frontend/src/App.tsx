import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/users/login" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/users/register" element={<Register/>}/>
            <Route path="/users/:id" element={<UserProfile/>}/>
            <Route path="/users/:id/edit" element={<EditProfile/>}/>
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;