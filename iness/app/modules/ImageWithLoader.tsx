import React from "react";
import { ActivityIndicator } from "react-native-paper";
import { useState } from "react";
import { Image } from "react-native";
export const ImageWithLoader = ({ uri }: { uri: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color="#999999"
          style={{
            position: "absolute",
            zIndex: 1,
          }}
        />
      )}
      <Image
        source={{ uri }}
        style={{
          width: 110, // Set a default width
          height: 110, // Set a default height
          resizeMode: "cover",
          borderRadius: 8,
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </>
  );
};
