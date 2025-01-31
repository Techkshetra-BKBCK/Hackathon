import React from "react";
import { Triangle } from "react-loader-spinner";

const TraingleLoader = () => {
  return (
    <div
      className="
     h-[calc(100vh-200px)] w-full 
        flex items-center justify-center
    "
    >
      <Triangle
        visible={true}
        height="80"
        width="80"
        color="#4B35EA"
        ariaLabel="triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default TraingleLoader;
