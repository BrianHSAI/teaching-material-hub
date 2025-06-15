
import React from "react";

const LOGO = "/lovable-uploads/2d41b264-180a-4c74-85c9-2ba41083cd1e.png";

export const AuthLogo = () => (
  <img
    src={LOGO}
    alt="Logo"
    className="h-28 w-28 mb-6 rounded shadow-md border-2 border-blue-200 bg-white"
    style={{ objectFit: "contain" }}
  />
);
