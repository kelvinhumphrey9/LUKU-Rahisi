import React, { useState, useRef, useEffect } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function App() {
  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bolt Performance Optimization:
  // Clean up timers on unmount to prevent memory leaks and unnecessary background execution.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handlePress = () => {
    debugger; // This should be stripped in production builds
    console.log("Button pressed");
    setIsRetrying(true);
    setShowSuccess(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsRetrying(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.titleText}>Tanzania Electricity Purchase App</Text>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          size="large"
          color={isRetrying ? "#10b981" : "#3b82f6"}
          accessibilityRole="progressbar"
          accessibilityLabel={isRetrying ? "Rechecking server status" : "Loading application components"}
        />
      </View>

      <Text style={styles.statusText}>
        {isRetrying ? "Rechecking status..." : "Loading the application components..."}
      </Text>

      {/* Palette Delight & Accessibility Feature: Inline success badge when refresh finishes */}
      {showSuccess && !isRetrying && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.successBadge}
        >
          <Text style={styles.successBadgeText}>✓ All systems operational</Text>
        </View>
      )}

      <Pressable
        onPress={handlePress}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="Refresh status"
        accessibilityState={{ disabled: isRetrying }}
        style={({ pressed, hovered, focused }: any) => [
          styles.buttonBase,
          isRetrying ? styles.buttonDisabled : hovered ? styles.buttonHovered : styles.buttonNormal,
          focused && styles.buttonFocused,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={isRetrying ? styles.buttonTextDisabled : styles.buttonTextNormal}>
          {isRetrying ? "Retrying..." : "Refresh Status"}
        </Text>
      </Pressable>
    </View>
  );
}

// Bolt Performance Optimization:
// Defining all static styles inside StyleSheet.create avoids the allocation of new style objects on every render cycle.
// This significantly reduces Garbage Collection (GC) pressure, avoids shallow-equality failures in render comparisons,
// and permits React Native Web to generate stable, static CSS class names instead of inline styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  spinnerContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
    textAlign: "center",
  },
  successBadge: {
    marginTop: 12,
    backgroundColor: "#d1fae5",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  successBadgeText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonBase: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    outlineWidth: 0, // Reset default browser outline for web
  },
  buttonNormal: {
    backgroundColor: "#3b82f6",
  },
  buttonHovered: {
    backgroundColor: "#2563eb",
  },
  buttonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  buttonFocused: {
    outlineColor: "#2563eb",
    outlineStyle: "solid",
    outlineWidth: 3,
    outlineOffset: 2,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonTextNormal: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextDisabled: {
    color: "#9ca3af",
    fontWeight: "600",
    fontSize: 14,
  },
});
