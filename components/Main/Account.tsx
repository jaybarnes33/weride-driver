import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import useUser from "@/hooks/useUser"; // Adjust the import according to your actual hook
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { uploadFile } from "@/utils/uploadFile";

import { makeSecuredRequest } from "@/utils/makeSecuredRequest";
import { getImageUrl, removeTokens } from "@/utils";
import { useNavigation } from "expo-router";
import { LatLng } from "react-native-maps";
const Account = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    vehicleDetails: {
      make: "",
      model: "",
      year: "" as string | number,
      number: "",
      color: "",
    },
  });

  const { navigate } = useNavigation();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
  const { user } = useUser();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const { data: file, error } = await uploadFile(image!, user?._id);

      if (file || !image?.base64) {
        const { data } = await makeSecuredRequest(`/api/drivers/${user?._id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...form,
            verificationDocument: file?.fullPath ?? undefined,
          }),
        });
      }
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  useEffect(() => {
    if (user?.verificationDocument) {
      setImage({
        uri: getImageUrl(user.verificationDocument),
      } as ImagePicker.ImagePickerAsset);
      setForm((prev) => ({
        ...prev,
        ...user,
      }));
    }
    //https://hizgmhyjemwvbnghopvc.supabase.co/storage/v1/object/public/weride-files/66c53878980960176712e7cd/1724201181582
  }, [user]);

  const handleLogout = async () => {
    await removeTokens();
    navigate("Auth" as never);
  };
  return (
    <KeyboardAvoidingView className="px-4 bg-white py-5">
      <Text className="text-xl font-bold">Account</Text>

      {step === 1 && (
        <View>
          <View className="mt-5">
            <Text className="font-semibold">Name</Text>
            <TextInput
              className=" text-base"
              placeholder="John Doe"
              defaultValue={user?.name}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, name: text }))
              }
            />
          </View>
          <View className="mt-5">
            <Text className="font-semibold">Email</Text>
            <TextInput
              className=" text-base"
              defaultValue={user?.email}
              placeholder="test@mail.com"
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, email: text }))
              }
            />
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <View className="mt-5">
            <Text className="font-semibold">Upload ID Image</Text>
            {image && (
              <Image source={{ uri: image.uri }} className="w-full h-32 mt-2" />
            )}
            {image && (
              <TouchableOpacity
                onPress={() => setImage(undefined)}
                className="absolute top-4 -right-2 bg-white w-7 h-7 rounded-full items-center justify-center"
              >
                <MaterialCommunityIcons name="close" size={15} color="black" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={pickImage}
              className="bg-slate-800 p-2 my-2 rounded-lg items-center"
            >
              <Text className="text-white text-base">Upload Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <View className="mt-5">
            <Text className="font-semibold">Vehicle Make</Text>
            <TextInput
              className=" py-2 bg-gray-200 px-2"
              defaultValue={form?.vehicleDetails.make}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleDetails: { ...prev.vehicleDetails, make: text },
                }))
              }
            />
          </View>
          <View className="mt-5">
            <Text className="font-semibold">Vehicle Model</Text>
            <TextInput
              className=" py-2 bg-gray-200 px-2 "
              defaultValue={form?.vehicleDetails.model}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleDetails: { ...prev.vehicleDetails, model: text },
                }))
              }
            />
          </View>
          <View className="mt-5">
            <Text className="font-semibold">Vehicle Year</Text>
            <TextInput
              className=" py-2 bg-gray-200 px-2"
              defaultValue={form?.vehicleDetails?.year.toString()}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleDetails: { ...prev.vehicleDetails, year: text },
                }))
              }
            />
          </View>
          <View className="mt-5">
            <Text className="font-semibold">Plate Number</Text>
            <TextInput
              className=" py-2 bg-gray-200 px-2"
              defaultValue={form?.vehicleDetails?.number}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleDetails: { ...prev.vehicleDetails, number: text },
                }))
              }
            />
          </View>
          <View className="mt-5">
            <Text className="font-semibold">Vehicle Color</Text>
            <TextInput
              className=" py-2 bg-gray-200 px-2"
              defaultValue={form?.vehicleDetails?.color}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleDetails: { ...prev.vehicleDetails, color: text },
                }))
              }
            />
          </View>
        </View>
      )}

      <View className="mt-5 flex-row justify-between">
        {step > 1 && <Button title="Previous" onPress={prevStep} />}
        {step < 3 && <Button title="Next" onPress={nextStep} />}
        {step === 3 && (
          <TouchableOpacity onPress={handleFormSubmit}>
            <Text className="text-white bg-primary p-2 rounded-lg">
              Update Details
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <Text className="text-primary mt-5">Logout</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default Account;
