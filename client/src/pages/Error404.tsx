import React from "react";
import { Link } from "react-router-dom";
import Astronaut from "../assets/astronaut.png";

const Error404 = () => {
  return (
    <div className="error404 flex items-center justify-center mt-8">
      <div className="content relative" style={{
          width: "800px",
          height: "100%"
      }}>
        <div className="text text-center">
          <div className="text-4xl">Oops!</div>
          <h1
            style={{
              fontSize: "18rem",
              lineHeight: "16rem",
            }}
          >
            404
          </h1>
          <hr />
          <div className="text-xl mb-12">Page Not Found</div>

          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>

        <div
          className="astronaut absolute"
          style={{
            top: "8rem",
            left: "18.5rem",
          }}
        >
          <img
            src={Astronaut}
            alt="astronaut"
            className="src animate-bounce w-44"
          />
        </div>
      </div>
    </div>
  );
};

export default Error404;
