import { View, Text } from "react-native";
import React from "react";

const Referrals = () => {
  return (
    <View className="px-4">
      <Text className="font-bold text-xl">Referals</Text>
      <Text className="text-gray-500 text-sm">
        Refer a friend and earn{" "}
        <Text className="text-primary font-bold">GHS 5</Text> after their first
        ride
      </Text>
      <View className="bg-orangeFade mt-2 items-center p-3">
        <Text className="text-red-500">No recent referrals</Text>
      </View>
    </View>
  );
};

export default Referrals;
