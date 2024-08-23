import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";

import { useLocation } from "@/context/Location";

import MapView, { Marker, Polyline } from "react-native-maps";

import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { GooglePlaceDetail } from "react-native-google-places-autocomplete";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
} from "react-native-heroicons/outline";
import Colors from "@/constants/Colors";
import CountdownTimer from "@/components/Main/Countdown";
import { RideRequest } from "@/types/ride";
import { createURL } from "@/utils/api";
import axios from "axios";

const Ride = () => {
  const { location, setLocation } = useLocation();
  const [start, setStart] = useState(false);
  const [complete, setComplete] = useState(false);
  const types = [
    {
      name: "Shared",
      wait: "10 - 15mins",
      image: "🚕",
      price: "50 - 90",
    },
    {
      name: "Comfort",
      wait: "5 - 10mins",
      price: "75 - 100",
      image: "🚗",
    },
    {
      name: "Express",
      wait: "5 - 10mins",
      price: "70 - 100",
      image: "🚙",
    },
  ];
  const { back } = useRouter();
  const { details } = useRoute().params as { details: RideRequest };
  const [arrived, setArrived] = useState(false);
  const { dropoffLocation, pickupLocation } = details;

  const [directions, setDirections] = useState([]);

  const handleArrival = async () => {
    // send notification to passenger
    await axios.put(createURL(`/api/requests/${details._id}/`), {
      status: "arrived",
    });
    setArrived(true);
  };

  const handleStart = async () => {
    await axios.put(createURL(`/api/requests/${details._id}/`), {
      status: "started",
    });
    setStart(true);
  };

  const handleEnd = async () => {
    await axios.put(createURL(`/api/requests/${details._id}/`), {
      status: "completed",
    });
    setComplete(true);
  };
  useEffect(() => {
    if (location && dropoffLocation) {
      const origin = `${location.longitude},${location.latitude}`;
      const destination = start
        ? `${dropoffLocation.longitude},${dropoffLocation.latitude}`
        : `${pickupLocation.longitude},${pickupLocation.latitude}`;
      fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${destination}?geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX}&steps=true`
      )
        .then(async (response) => {
          const data = await response.json();
          return data;
        })
        .then((data) => {
          const route = data.routes[0].geometry.coordinates;
          setDirections(
            route.map((coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            }))
          );
        })
        .catch((e) => console.log(e));
    }
  }, [dropoffLocation, pickupLocation]);

  return (
    <View className="relative flex-1">
      <TouchableOpacity className="absolute top-10 z-50 mx-5" onPress={back}>
        <ArrowLeftIcon color={Colors.light.primary} />
      </TouchableOpacity>
      <MapView
        className="h-[85vh]"
        camera={{
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 0.3,
          heading: 0,
          altitude: 1000,
          zoom: 20,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location?.latitude,
              longitude: location?.longitude,
            }}
          >
            <TouchableOpacity className="h-10 w-10 bg-white items-center justify-center shadow rounded-full">
              <MapPinIcon color={Colors.dark.primary} />
            </TouchableOpacity>
          </Marker>
        )}
        {directions.length > 0 && (
          <Polyline
            strokeWidth={8}
            coordinates={directions}
            fillColor={Colors.light.primary}
            strokeColor={Colors.light.primary}
          />
        )}
        {pickupLocation && (
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude,
            }}
          >
            <TouchableOpacity className="h-10 w-10 bg-primary items-center justify-center shadow rounded-full">
              <MapPinIcon color={"white"} />
            </TouchableOpacity>
          </Marker>
        )}
        {start && dropoffLocation && (
          <Marker
            coordinate={{
              latitude: dropoffLocation.latitude,
              longitude: dropoffLocation.longitude,
            }}
          >
            <TouchableOpacity className="h-10 w-10 bg-primary items-center justify-center shadow rounded-full">
              <MapPinIcon color={"white"} />
            </TouchableOpacity>
          </Marker>
        )}
      </MapView>
      <View className=" w-full h-[15vh] p-3 bg-white space-y-2">
        <Text className="text-xl font-bold">Ride Details</Text>
        <View className="space-x-3  ">
          <Text>
            {!arrived
              ? `Picking up ${details.passenger.name} at ${details.pickupLocation.placeName}`
              : `Waiting for ${details.passenger.name} at pickup`}
          </Text>
        </View>
        <TouchableOpacity className="absolute right-5 bg-orangeFade w-8 h-8 items-center justify-center rounded-full">
          <PhoneIcon color={Colors.dark.primary} />
        </TouchableOpacity>
        {!arrived && (
          <TouchableOpacity
            onPress={handleArrival}
            className="bg-primary p-2 items-center my-3 rounded-lg"
          >
            <Text className="text-white text-base">I've Arrived</Text>
          </TouchableOpacity>
        )}
        {arrived && !start && (
          <TouchableOpacity
            onPress={handleStart}
            className="bg-primary p-2 items-center my-3 rounded-lg"
          >
            <Text className="text-white text-base">Start Trip</Text>
          </TouchableOpacity>
        )}
        {start && (
          <TouchableOpacity
            onPress={handleEnd}
            className="bg-primary p-2 items-center my-3 rounded-lg"
          >
            <Text className="text-white text-base">Complete Trip</Text>
          </TouchableOpacity>
        )}

        {complete && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-xl font-bold">
              Ride Completed, {details.passenger.name} will pay GH₵
              {details.price.toFixed(2)}
            </Text>
            <Text className="text-lg">Thank you for being a good driver</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Ride;
