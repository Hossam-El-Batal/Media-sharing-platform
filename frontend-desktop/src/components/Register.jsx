import React, { useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css"
import axios from 'axios';

// Validation functions
const validatePassword = (pwd) => {
    const upperCasePattern = /[A-Z]/;
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!upperCasePattern.test(pwd))
    return "Password must include at least one uppercase letter.";
    if (!specialCharPattern.test(pwd))
    return "Password must include at least one special character.";
    return "";
};

const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? "" : "Please enter a valid email address.";
};

const Register = () => {
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: "",
      repeatPassword: ""
    });
    const [formErrors, setFormErrors] = useState({
      emailError: "",
      passwordError: "",
      repeatPasswordError: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    // const navigate = useNavigate();

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
  
      if (name === "email") {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          emailError: validateEmail(value),
        }));
      }
  
      if (name === "password") {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          passwordError: validatePassword(value),
        }));
      }
  
      if (name === "repeatPassword") {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          repeatPasswordError:
            value !== formData.password ? "Passwords do not match." : "",
        }));
    }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
      
        if (
          formErrors.emailError ||
          formErrors.passwordError ||
          formErrors.repeatPasswordError
        ) {
          console.error("Fix validation errors before submitting.");
          return;
        }
      
        try {
          const response = await axios.post("http://localhost:3000/api/register", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });
      
          console.log("User registered successfully:", response.data);
        } catch (error) {
          console.error("Sign up failed:", error.response ? error.response.data : error.message);
          alert("Registration failed, please try again.");
        }
      };
  
    return (
      <div className=" cont">
        <div className="img">
          <div className="img__btn">
            <span className="login-span span-4 m--in">Login</span>
          </div>
        </div>
        <form className="form sign-up" onSubmit={handleSignUp}>
          <h2 className="h2-4">Welcome,please register a new user</h2>
  
          <label className="login-label label-4">
            <span className="login-span span-4">Username</span>
            <input
             className="input-4"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            />
        </label>

        <label className="login-label label-4">
            <span className="login-span">Email</span>
            <input
            className="input-4"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            />
            {formErrors.emailError && (
            <p className="error-message">{formErrors.emailError}</p>
            )}
        </label>

        <label className="login-label password-field">
            <span className="login-span span-4">Password</span>
            <input
            className="input-4"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            />
            <span
            className="login-span eye-icon"
            onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? <VscEye /> : <VscEyeClosed />}
            </span>
            {formErrors.passwordError && (
            <p className="error-message">{formErrors.passwordError}</p>
            )}
        </label>

        <label className="login-label password-field">
            <span className="login-span">Repeat Password</span>
            <input
            className="input-4"
            type={showRepeatPassword ? "text" : "password"}
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={handleChange}
            required
            />
            <span
            className="login-span eye-icon"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
            {showRepeatPassword ? <VscEye /> : <VscEyeClosed />}
            </span>
            {formErrors.repeatPasswordError && (
            <p className="error-message">{formErrors.repeatPasswordError}</p>
            )}
        </label>
    
        <div className="login-button bottom-buttons">
            <button type="submit" className="login-button submit-4">
            Sign Up
            </button>
            <button className=" sign-up1">Sign In</button>
        </div>
        </form>
    </div>
    );
};

export default Register;