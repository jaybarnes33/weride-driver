import { View, Text } from "react-native";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { storeTokens } from "@/utils";

import * as SecureStore from "expo-secure-store";
import { createURL } from "@/utils/api";
import { makeSecuredRequest } from "@/utils/makeSecuredRequest";
import useUser from "@/hooks/useUser";
import { useWebSocket } from "@/socket/SocketContext";
import { useLocation } from "@/context/Location";

export interface DriverDetails {
  _id: string;
  name?: string;
  email?: string;
  otp?: string;
  phone: string;
  password: string;
  currentLocation?: string;
  createdAt: Date;
  vehicleType?: string;
  avatar?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  verificationStatus?: string;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    color: string;
    number: string;
  };
  verificationDocument?: string;
}
interface AuthContextProps {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  setDriverDetails: Dispatch<SetStateAction<DriverDetails>>;
  driverDetails: DriverDetails;
  handleNextStep: () => void;
}

//@ts-ignore
export const Context = createContext<AuthContextProps>({});
const AuthContext = ({ children }: { children: ReactNode }) => {
  const [driverDetails, setDriverDetails] = useState({
    name: "",
    phoneNumber: "",
    vehicleNumber: "",
    avatar: "",
    otp: "",
    id: "",
  });

  const { webSocketManager } = useWebSocket();
  const { user } = useUser();
  const { location } = useLocation();
  useEffect(() => {
    (async () => {
      if (user) {
        navigation.navigate("Main");
        webSocketManager
          .getSocket()
          ?.emit("registerRider", { id: user._id, location: location });
      }
    })();
  }, [user]);

  const [step, setStep] = useState(1);
  const { name, phoneNumber, vehicleNumber, avatar, otp, id } = driverDetails;
  const navigation = useNavigation();

  const handleNextStep = async () => {
    if (step === 1) {
      if (phoneNumber) {
        const {
          data: { id },
        } = await axios.post("http://localhost:8000/api/auth?type=rider", {
          phoneNumber,
        });
        if (id) {
          setDriverDetails((prev) => ({ ...prev, id: id }));
          setStep((step) => step + 1);
        }
      }
    } else if (step === 2) {
      // verify OTP
      if (otp) {
        const {
          data,
        }: { data: { accessToken: string; refreshToken: string } } =
          await axios.post(createURL(`/api/auth/otp/${id}?type=rider`), {
            otp,
          });
        await storeTokens(data);
        setStep(step + 1);
      }
    } else {
      // submit form data
      const formData = new FormData();

      const keys = Object.keys(driverDetails);
      keys.forEach(async (key) => {
        if (key !== "avatar") {
          //@ts-ignore
          formData.append(key, riderDetails[key]);
        } else {
          const uriParts = driverDetails.avatar.split(".");
          const fileType = uriParts[uriParts.length - 1];
        }
      });

      try {
        const { data } = await axios.put(
          createURL(`/api/riders/${id}`),
          formData,
          {
            maxBodyLength: Infinity,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        AsyncStorage.setItem("user", JSON.stringify(data));

        navigation.navigate("((tabs))");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Context.Provider
      value={{
        step,
        setStep,
        setDriverDetails,
        handleNextStep,
        driverDetails,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useAuth was called without a provider");
  } else {
    return context;
  }
};
export default AuthContext;
