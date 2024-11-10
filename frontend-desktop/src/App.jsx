import { useState } from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Profile from './components/Profile'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from './components/Main'

function App() {

  return (
    <>
      
      <Router>
        <Routes>
          <Route path='/register' element={<Register/>}> </Route>
          <Route path='/' element={<Login/>}> </Route>
          <Route path='/profile' element={<Profile/>}> </Route>
          <Route path='/Main' element={<Main/>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
