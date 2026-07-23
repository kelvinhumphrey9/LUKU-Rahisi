import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function App() {
  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);
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

  // Bolt Performance Optimization:
  // Wrap event handler in useCallback to maintain a stable reference across renders,
  // preventing function re-creation and potential unnecessary child component re-renders.
  const handlePress = useCallback(() => {
    debugger; // This should be stripped in production builds
    console.log("Button pressed");
    setIsRetrying(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  }, []);

  // Bolt Performance Optimization:
  // Memoize the accessibilityState object reference. Defining this object inline triggers
  // a new allocation and reference inequality on every render cycle, which causes
  // unnecessary DOM/prop updates in the Pressable sub-component.
  const accessibilityState = useMemo(() => ({ disabled: isRetrying }), [isRetrying]);

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
      <Pressable
        onPress={handlePress}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="Refresh status"
        accessibilityState={accessibilityState}
        style={({ pressed, hovered }: any) => [
          styles.buttonBase,
          isRetrying ? styles.buttonDisabled : hovered ? styles.buttonHovered : styles.buttonNormal,
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
