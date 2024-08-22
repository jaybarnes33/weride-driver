import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";

import { useRouter } from "expo-router";
import { getTokens } from "@/utils";

const index = () => {
  const { navigate } = useRouter();

  useEffect(() => {
    (async () => {
      const tokens = await getTokens();
      if (tokens?.accessToken) {
        navigate("(tabs)");
      }
    })();
  }, []);
  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/car.jpeg")}
        className=" h-screen top-0 w-full"
      />
      <View className="my-auto space-y-4 absolute bottom-0 w-full">
        <View className="bg-black p-4 space-y-4">
          <Text className="text-center text-white font-bold text-3xl ">
            Welcome to WeRide
          </Text>
          <Text className="text-center text-white">
            Accept and fulfill ride requests from your customers
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-lg p-4 mb-5"
            onPress={() => navigate("Auth")}
          >
            <Text className="text-center text-white">Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default index;
