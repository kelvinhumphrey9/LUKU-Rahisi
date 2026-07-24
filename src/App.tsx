import React, { useState, useRef, useEffect } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto run initial load on mount
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsInitialLoading(false);
      setShowSuccess(true);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Palette Delight & Accessibility Feature: Automatically dismiss the success badge after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setShowSuccess(false), 5000);
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [showSuccess]);

  const handlePress = () => {
    setIsRetrying(true);
    setShowSuccess(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

    timerRef.current = setTimeout(() => {
      setIsRetrying(false);
      setShowSuccess(true);
    }, 1500);
  };

  const isLoading = isInitialLoading || isRetrying;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.titleText}>Tanzania Electricity Purchase App</Text>

      {/* Main Status Area */}
      <View style={styles.statusCard}>
        {isLoading ? (
          <>
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
          </>
        ) : (
          <View style={styles.onlineContainer}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>System Status: Online</Text>
          </View>
        )}
      </View>

      {/* Palette Delight & Accessibility Feature: Inline success badge when refresh finishes */}
      {showSuccess && !isLoading && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.successBadge}
        >
          <Text style={styles.successBadgeText}>✓ All systems operational</Text>
          <Pressable
            onPress={() => setShowSuccess(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss status message"
            style={({ hovered, focused }: any) => [
              styles.dismissButton,
              hovered && styles.dismissButtonHovered,
              focused && styles.dismissButtonFocused,
            ]}
          >
            <Text style={styles.dismissButtonText}>×</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={handlePress}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Refresh status"
        accessibilityState={{ disabled: isLoading }}
        style={({ pressed, hovered, focused }: any) => [
          styles.buttonBase,
          isLoading ? styles.buttonDisabled : hovered ? styles.buttonHovered : styles.buttonNormal,
          focused && styles.buttonFocused,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={isLoading ? styles.buttonTextDisabled : styles.buttonTextNormal}>
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
  statusCard: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  spinnerContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
    textAlign: "center",
  },
  onlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  onlineText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "500",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#d1fae5",
    paddingVertical: 6,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  successBadgeText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "600",
  },
  dismissButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    outlineWidth: 0,
  },
  dismissButtonHovered: {
    backgroundColor: "#a7f3d0",
  },
  dismissButtonFocused: {
    outlineColor: "#059669",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  dismissButtonText: {
    color: "#065f46",
    fontSize: 14,
    fontWeight: "bold",
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
