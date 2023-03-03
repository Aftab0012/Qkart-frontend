import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useState } from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";
import { InputAdornment, TextField } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    // history.push("/");
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>

      {children}

      {hasHiddenAuthButtons ? (
        <Box>
          {" "}
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={() => history.push("/")}
          >
            Back to explore
          </Button>
        </Box>
      ) : localStorage.getItem("username") ? (
        <Stack gap={1} direction="row" alignItems="center">
          {/* <Box> */}
          <Avatar src="avatar.png" alt="crio.do" className="profile-image" />

          <Box className="header-info">{localStorage.getItem("username")}</Box>

          <Button variant="text" onClick={logout}>
            logout
          </Button>
          {/* </Box> */}
        </Stack>
      ) : (
        <Box>
          <Button
            className="login-button"
            variant="text"
            onClick={() => {
              history.push("/login");
            }}
          >
            Login
          </Button>
          <Button
            className="register-button"
            variant="contained"
            onClick={() => {
              history.push("/register");
            }}
          >
            Register
          </Button>
        </Box>
      )}

      {/* Here's a pseudo-code logic:

if (!hasHiddenAuthButtons) {
    show the "Back to explore" button
} else if (window.localStorage.getItem("username")) {
    show user avatar, username and logout button
} else {
    show login and register buttons
}
This hasHiddenAuthButtons is a prop that has been passed from the Products Component to the Header component. It is a boolean prop. */}
      {/* Remember to pass the hasHiddenAuthButton as a prop from the Products.js component.
<Header hasHiddenAuthButtons={true}>
    
      </Header> */}
    </Box>
  );
};

export default Header;
