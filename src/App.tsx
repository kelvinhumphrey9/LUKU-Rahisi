import React, { useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";

export default function App() {
  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);

  const handlePress = () => {
    debugger; // This should be stripped in production builds
    console.log("Button pressed");
    setIsRetrying(true);
    setTimeout(() => setIsRetrying(false), 1500);
  };

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827", textAlign: "center" }}>
        Tanzania Electricity Purchase App
      </Text>
      <View style={{ height: 80, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
        <ActivityIndicator
          size="large"
          color={isRetrying ? "#10b981" : "#3b82f6"}
          accessibilityRole="progressbar"
          accessibilityLabel={isRetrying ? "Rechecking server status" : "Loading application components"}
        />
      </View>
      <Text style={{ fontSize: 14, color: "#4b5563", marginTop: 8, textAlign: "center" }}>
        {isRetrying ? "Rechecking status..." : "Loading the application components..."}
      </Text>
      <Pressable
        onPress={handlePress}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="Refresh status"
        accessibilityState={{ disabled: isRetrying }}
        style={({ pressed, hovered }: any) => ({
          marginTop: 24,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: isRetrying ? "#e5e7eb" : hovered ? "#2563eb" : "#3b82f6",
          borderRadius: 8,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        })}
      >
        <Text style={{ color: isRetrying ? "#9ca3af" : "#ffffff", fontWeight: "600", fontSize: 14 }}>
          {isRetrying ? "Retrying..." : "Refresh Status"}
        </Text>
      </Pressable>
    </View>
  );
}
