import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";

import { useNavigation } from "expo-router";
import { createURL } from "@/utils/api";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const Auth = () => {
  const { navigate } = useNavigation();

  const [form, setForm] = React.useState({
    phone: "",
    loading: false,
    error: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    // Make api request to send otp
    try {
      form.loading = true;
      const { phone } = form;
      const { data } = await axios.post(createURL("/api/auth?type=driver"), {
        phone,
      });
      console.log(data);
      //@ts-ignore
      navigate("Otp", { id: data.id });
    } catch (error) {
      console.log(error);
      form.error = "An error occured";
    } finally {
      form.loading = false;
    }
  };
  return (
    <SafeAreaView className="px-4 pt-5 space-y-4">
      <Text className="font-bold text-xl">
        Please provide your details to continue
      </Text>

      <View className="space-y-2">
        <Text className="font-semibold">Phone</Text>
        <View className="flex-row items-center p-2 border border-neutral-400 rounded h-10">
          <Text className="text-gray-500">🇬🇭 +233 </Text>
          <TextInput
            placeholder="1234567890"
            className="h-full flex-1"
            onChangeText={(text) => handleChange("phone", text)}
          />
        </View>
      </View>
      <TouchableOpacity
        className="bg-primary rounded-lg p-4"
        onPress={handleNext}
        disabled={form.loading || !form.phone}
      >
        <Text className="text-center text-white">Continue</Text>
        {form.loading && <ActivityIndicator size={"small"} />}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Auth;
