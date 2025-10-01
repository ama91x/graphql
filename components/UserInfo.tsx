import React from "react";

type Props = {
  firstName?: string;
  lastName?: string;
  userName?: string;
  country?: string;
  qualification?: string;
  dateOfBirth?: string;
};

const UserInfo: React.FC<Props> = ({
  firstName,
  lastName,
  userName,
  country,
  qualification,
  dateOfBirth,
}) => {
  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-white rounded-xl shadow-md h-[390px]">
      <h2 className="text-2xl font-bold text-gray-800">Student Info</h2>
      <div className="w-full flex flex-row items-center justify-start gap-2">
        <h2 className="text-black text-xl font-bold">Full Name:</h2>
        <h2 className="text-black text-xl ">
          {firstName} {lastName}
        </h2>
      </div>
      <div className="w-full flex flex-row items-center justify-start gap-2">
        <h2 className="text-black text-xl font-bold">User Name:</h2>
        <h2 className="text-black text-xl ">{userName}</h2>
      </div>
      <div className="w-full flex flex-row items-center justify-start gap-2">
        <h2 className="text-black text-xl font-bold">Country:</h2>
        <h2 className="text-black text-xl ">{country}</h2>
      </div>
      <div className="w-full flex flex-row items-center justify-start gap-2">
        <h2 className="text-black text-xl font-bold">Date of Birth:</h2>
        <h2 className="text-black text-xl">
          {dateOfBirth
            ? new Date(dateOfBirth).toLocaleDateString("en-GB")
            : "N/A"}
        </h2>
      </div>

      <div className="w-full flex flex-row items-center justify-start gap-2">
        <h2 className="text-black text-xl font-bold">Qualification:</h2>
        <h2 className="text-black text-xl ">{qualification}</h2>
      </div>
    </div>
  );
};

export default UserInfo;
