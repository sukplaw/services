import React from "react";


// utils/auth.js
export const clearAuthData = () => {
  ["token", "permission"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};
