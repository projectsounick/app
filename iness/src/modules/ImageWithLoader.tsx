import React, { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { Image } from "expo-image";

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
          width: 110,
          height: "100%",
          borderRadius: 8,
        }}
        contentFit="cover"
        allowDownscaling
        cachePolicy="memory-disk"
        transition={150}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </>
  );
};
