import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";

const translations: any = {
  en: {
    title: "Tanzania Electricity Purchase App",
    load: "Loading application components",
    retry: "Rechecking server status",
    ok: "✓ All systems operational",
    run: "Refresh Status",
    r: "Retrying...",
    tok: "LUKU Token",
    cp: "Copy",
    cps: "Copied!",
    cpa: "Copy token to clipboard",
  },
  sw: {
    title: "Ununuzi wa Umeme (LUKU) Tanzania",
    load: "Inapakia vipengele vya programu",
    retry: "Inahakiki hali ya seva sasa",
    ok: "✓ Mifumo yote inafanya kazi kikamilifu",
    run: "Hakiki Hali Tena",
    r: "Inajaribu tena...",
    tok: "Namba ya LUKU",
    cp: "Nakili",
    cps: "Imenakiliwa!",
    cpa: "Nakili namba ya LUKU kwenye ubao",
  },
};

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const MOCK_TOKEN = "1508-4839-2048-5729-1038";

  // Bolt Performance Optimization:
  // Clean up timers on unmount to prevent memory leaks and unnecessary background execution.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const copyToken = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(MOCK_TOKEN);
        }
      } else {
        // Safe runtime dynamic require for native platforms to prevent Vite web bundler crashes
        const Clipboard = require("expo-clipboard");
        if (Clipboard?.setStringAsync) {
          await Clipboard.setStringAsync(MOCK_TOKEN);
        }
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, []);

  // Bolt Performance Optimization:
  // Memoizing event handlers using useCallback preserves referential integrity across render cycles.
  // This reduces re-renders of child components like Pressable and lowers garbage collection pressure.
  const handlePress = useCallback(() => {
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
  }, []);

  // Bolt Performance Optimization:
  // Memoizing the accessibilityState object prevents recreating a new object literal reference on every render,
  // preventing unnecessary layout re-evaluations and rendering passes in React Native components.
  const accessibilityState = useMemo(
    () => ({ disabled: isRetrying }),
    [isRetrying],
  );

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.langContainer}>
        {["en", "sw"].map((l) => (
          <React.Fragment key={l}>
            <Pressable
              onPress={() => setLang(l as any)}
              accessibilityRole="button"
              accessibilityLabel={l === "en" ? "English" : "Kiswahili"}
              accessibilityState={{ selected: lang === l }}
              style={({ focused }: any) => [
                styles.langBtn,
                lang === l && styles.langActive,
                focused && styles.langFocus,
              ]}
            >
              <Text
                style={[styles.langTxt, lang === l && styles.langTxtActive]}
              >
                {l.toUpperCase()}
              </Text>
            </Pressable>
            {l === "en" && <Text style={styles.langSep}>|</Text>}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.titleText}>{t.title}</Text>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          size="large"
          color={isRetrying ? "#10b981" : "#3b82f6"}
          accessibilityRole="progressbar"
          accessibilityLabel={isRetrying ? t.retry : t.load}
        />
      </View>

      <Text style={styles.statusText}>
        {isRetrying ? t.retry + "..." : t.load + "..."}
      </Text>

      {/* Palette Delight & Accessibility Feature: Inline success badge when refresh finishes */}
      {showSuccess && !isRetrying && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.successBadge}
        >
          <Text style={styles.successBadgeText}>{t.ok}</Text>
        </View>
      )}

      {/* Palette Delight & Accessibility Feature: LUKU Token Card */}
      <View style={styles.tokenCard}>
        <Text style={styles.tokenLabel}>{t.tok}</Text>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenValue} accessibilityLabel={`${t.tok}: 1508 4839 2048 5729 1038`}>
            {MOCK_TOKEN}
          </Text>
          <Pressable
            onPress={copyToken}
            accessibilityRole="button"
            accessibilityLabel={copied ? t.cps : t.cpa}
            style={({ pressed, hovered, focused }: any) => [
              styles.copyBtnBase,
              copied ? styles.copyBtnSuccess : hovered ? styles.copyBtnHovered : styles.copyBtnNormal,
              focused && styles.copyBtnFocused,
              pressed && styles.copyBtnPressed,
            ]}
          >
            <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
              {copied ? t.cps : t.cp}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handlePress}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel={isRetrying ? t.r : t.run}
        accessibilityState={accessibilityState}
        style={({ pressed, hovered, focused }: any) => [
          styles.buttonBase,
          isRetrying
            ? styles.buttonDisabled
            : hovered
              ? styles.buttonHovered
              : styles.buttonNormal,
          focused && styles.buttonFocused,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text
          style={
            isRetrying ? styles.buttonTextDisabled : styles.buttonTextNormal
          }
        >
          {isRetrying ? t.r : t.run}
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
  tokenCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 340,
    marginTop: 24,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenValue: {
    fontFamily: "monospace",
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: 1,
  },
  copyBtnBase: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    outlineWidth: 0,
  },
  copyBtnNormal: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  copyBtnHovered: {
    backgroundColor: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  copyBtnSuccess: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  copyBtnFocused: {
    outlineColor: "#3b82f6",
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 1,
  },
  copyBtnPressed: {
    transform: [{ scale: 0.96 }],
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  copyBtnTextSuccess: {
    color: "#065f46",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 24,
  },
  langContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
  },
  langBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  langActive: { backgroundColor: "#e0f2fe" },
  langTxt: { fontSize: 12, fontWeight: "500", color: "#6b7280" },
  langTxtActive: { color: "#0284c7", fontWeight: "bold" },
  langSep: { color: "#d1d5db", marginHorizontal: 4 },
  langFocus: {
    outlineColor: "#0284c7",
    outlineStyle: "solid",
    outlineWidth: 2,
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
