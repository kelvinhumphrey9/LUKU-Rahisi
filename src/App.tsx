import React from "react";
import { View, Text } from "react-native";

export default function App() {
  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const handlePress = () => {
    debugger; // This should be stripped in production builds
    console.log("Button pressed");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
        Tanzania Electricity Purchase App
      </Text>
      <Text style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
        Loading the application components...
      </Text>
    </View>
  );
}
