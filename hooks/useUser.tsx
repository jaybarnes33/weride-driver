import React, { useEffect, useState } from "react";
import { DriverDetails } from "@/context/Auth";
import { makeSecuredRequest } from "../utils/makeSecuredRequest";

const useUser = () => {
  const [user, setUser] = useState<DriverDetails | null>(null);

  useEffect(() => {
    (async () => {
      const data = await makeSecuredRequest("/api/auth?type=driver");
      setUser(data);
    })();
  }, []);
  return {
    user,
  };
};

export default useUser;
