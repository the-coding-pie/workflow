import React from "react";

const EmailNotVerified = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div
        className="card bg-white shadow p-8 flex items-center justify-center"
        style={{
          minWidth: "400px",
          minHeight: "200px",
        }}
      >
        Please verify your email in order to use this application
      </div>
    </div>
  );
};

export default EmailNotVerified;
