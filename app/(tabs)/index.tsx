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
import { useNavigation, useRouter } from "expo-router";
import { GooglePlaceDetail } from "react-native-google-places-autocomplete";
import { ArrowLeftIcon, MapPinIcon } from "react-native-heroicons/outline";
import Colors from "@/constants/Colors";
import CountdownTimer from "@/components/Main/Countdown";
import { getTokens } from "@/utils";
import useUser from "@/hooks/useUser";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWebSocket } from "@/socket/SocketContext";
import { RideRequest } from "@/types/ride";
import axios from "axios";
import { createURL } from "@/utils/api";
import clsx from "clsx";

const Ride = () => {
  const { location, setLocation } = useLocation();
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

  const { push } = useRouter();
  const [directions, setDirections] = useState([]);
  const [ride, setRide] = useState<RideRequest>();
  const [rideType, setRideType] = useState<(typeof types)[0]>();

  const handleRideType = (type: (typeof types)[0]) => {
    setRideType(type);
    setTimeout(() => {
      setRideType(undefined);
    }, 300000);

    //Make api request and save driver
  };

  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const dropoff = {} as GooglePlaceDetail;
  const [notVerified, setNotVerified] = useState(false);
  const { navigate } = useNavigation();
  useEffect(() => {
    if (location && dropoff.name) {
      console.log({ location, dropoff });
      const origin = `${location.longitude},${location.latitude}`;
      const destination = `${dropoff.geometry.location.lng},${dropoff.geometry.location.lat}`;
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
  }, [dropoff]);

  async function checkVerification() {
    if (!user?.name) {
      push("account");
    } else {
    }
  }

  const { webSocketManager } = useWebSocket();
  useEffect(() => {
    if (user && user.verificationStatus !== "verified") {
      return setNotVerified(true);
    }
    if (!user) return;

    webSocketManager
      .getSocket()
      ?.emit("registerDriver", { id: user._id, location: location });
  }, [user]);

  const handleRequest = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        createURL(`/api/requests/${ride?._id}`),
        {
          driver: user?._id,
        }
      );
      if (data) {
        navigate("ride", { details: data } as never);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  webSocketManager.getSocket()?.on("new-request", (data) => {
    setRide(data);
  });
  return (
    <View className="relative flex-1">
      {notVerified ? (
        <SafeAreaView className="p-4">
          {user?.name ? (
            <Text className="text-red-400">
              Your account is yet to be verified
            </Text>
          ) : (
            <View>
              <Text>Finish setting up your account</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={checkVerification}
            className="items-center py-2 bg-primary my-3"
          >
            <Text className="text-white">
              {user?.name ? "Check Status" : "Setup Account"}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <View className="flex-1">
          {ride && (
            <View className="p-4 bg-white mx-4 mt-20 bottom-50">
              <Text className="text-center font-bold text-xl">
                New Ride Request
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg">
                  New ride request to {ride?.dropoffLocation.placeName}
                </Text>
              </View>
              <CountdownTimer time={100} onEnd={() => setRide(undefined)} />
              <TouchableOpacity
                onPress={() => {
                  handleRequest();
                }}
                disabled={loading}
                className={clsx([
                  "bg-primary p-2 items-center my-2 rounded-lg",
                  loading && "bg-opacity-50",
                ])}
              >
                <Text className="text-white text-base">Accept</Text>
                {loading && <ActivityIndicator size="small" />}
              </TouchableOpacity>
            </View>
          )}
          <MapView
            style={{ flex: 1 }}
            camera={{
              center: {
                latitude: location?.latitude ?? 0,
                longitude: location?.longitude ?? 0,
              },
              pitch: 0.3,
              heading: 0,
              altitude: 1000,
              zoom: 20,
            }}
          >
            {location && (
              <Marker coordinate={location}>
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
            {dropoff && (
              <Marker
                coordinate={{
                  latitude: dropoff.geometry?.location.lat,
                  longitude: dropoff.geometry?.location.lng,
                }}
              >
                <TouchableOpacity className="h-10 w-10 bg-primary items-center justify-center shadow rounded-full">
                  <MapPinIcon color={"white"} />
                </TouchableOpacity>
              </Marker>
            )}
          </MapView>
        </View>
      )}
    </View>
  );
};

export default Ride;
