import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";

const translations: any = {
  en: {
    title: "Tanzania Electricity Purchase App",
    load: "Loading application components",
    ready: "System Ready",
    retry: "Rechecking server status",
    ok: "✓ All systems operational",
    run: "Refresh Status",
    r: "Retrying...",
    langHintEn: "Switches language to English",
    langHintSw: "Switches language to Swahili",
    btnHint: "Rechecks server connections and system status",
    retryHint: "Status recheck is in progress, please wait",
    lastVerified: "Verified at",
    dismissHint: "Dismiss notification",
  },
  sw: {
    title: "Ununuzi wa Umeme (LUKU) Tanzania",
    load: "Inapakia vipengele vya programu",
    ready: "Mfumo Uko Tayari",
    retry: "Inahakiki hali ya seva sasa",
    ok: "✓ Mifumo yote inafanya kazi kikamilifu",
    run: "Hakiki Hali Tena",
    r: "Inajaribu tena...",
    langHintEn: "Inabadilisha lugha kuwa Kiingereza",
    langHintSw: "Inabadilisha lugha kuwa Kiswahili",
    btnHint: "Inahakiki tena muunganisho wa seva na hali ya mfumo",
    retryHint: "Uhakiki wa hali unaendelea, tafadhali subiri",
    lastVerified: "Imethibitishwa saa",
    dismissHint: "Funga taarifa",
  },
};

// Bolt Performance Optimization:
// Hoisting static accessibility objects to module level avoids dynamic allocations
// and removes React hook tracking overhead on every render cycle.
const ACCESSIBILITY_STATE_SELECTED = { selected: true };
const ACCESSIBILITY_STATE_UNSELECTED = { selected: false };
const ACCESSIBILITY_STATE_DISABLED = { disabled: true };
const ACCESSIBILITY_STATE_ENABLED = { disabled: false };

// Bolt Performance Optimization:
// Extracting application title into a memoized sub-component prevents unnecessary
// title re-evaluations and Virtual DOM diffing during frequent parent status/timer updates.
interface AppTitleProps {
  title: string;
}

const AppTitle = React.memo(function AppTitle({ title }: AppTitleProps) {
  return <Text style={styles.titleText}>{title}</Text>;
});

// Bolt Performance Optimization:
// Extracting status indicator into a memoized component isolates status badge icon rendering and text computation.
// Passing primitive props (isRetrying, retryText, readyText) guarantees referential stability, preventing status view re-renders
// during parent state changes like success alert auto-dismissal timeouts.
interface StatusIndicatorProps {
  isRetrying: boolean;
  retryText: string;
  readyText: string;
}

const StatusIndicator = React.memo(function StatusIndicator({
  isRetrying,
  retryText,
  readyText,
}: StatusIndicatorProps) {
  return (
    <>
      <View style={styles.spinnerContainer}>
        {isRetrying ? (
          <ActivityIndicator
            size="large"
            color="#10b981"
            accessibilityRole="progressbar"
            accessibilityLabel={retryText}
          />
        ) : (
          <View
            style={styles.readyBadgeIconContainer}
            accessibilityRole="image"
            accessibilityLabel={readyText}
          >
            <Text
              style={styles.readyBadgeIcon}
              {...({ "aria-hidden": true } as any)}
            >
              ✓
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.statusText}>
        {isRetrying ? retryText + "..." : readyText}
      </Text>
    </>
  );
});

// Bolt Performance Optimization:
// Extracting language button into a memoized component prevents unnecessary re-renders of language selection controls
// when parent state updates (such as retry timer status changes), isolating Virtual DOM reconciliation.
interface LangButtonProps {
  langCode: "en" | "sw";
  isSelected: boolean;
  hint: string;
  onSelect: (lang: "en" | "sw") => void;
}

const LangButton = React.memo(function LangButton({
  langCode,
  isSelected,
  hint,
  onSelect,
}: LangButtonProps) {
  const handlePress = useCallback(() => {
    onSelect(langCode);
  }, [onSelect, langCode]);

  const getStyle = useCallback(
    ({ hovered, focused }: any) => [
      styles.langBtn,
      isSelected && styles.langActive,
      hovered && !isSelected && styles.langHover,
      focused && styles.langFocus,
    ],
    [isSelected],
  );

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={langCode === "en" ? "English" : "Kiswahili"}
      accessibilityHint={hint}
      accessibilityState={
        isSelected
          ? ACCESSIBILITY_STATE_SELECTED
          : ACCESSIBILITY_STATE_UNSELECTED
      }
      style={getStyle}
      {...({ title: hint } as any)}
    >
      <Text style={[styles.langTxt, isSelected && styles.langTxtActive]}>
        {langCode.toUpperCase()}
      </Text>
    </Pressable>
  );
});

// Bolt Performance Optimization:
// Extracting the action button into a memoized component prevents unnecessary re-evaluations
// and style computations during unrelated parent state changes (e.g. language selection or clock ticks).
interface RefreshButtonProps {
  isRetrying: boolean;
  label: string;
  hint: string;
  onPress: () => void;
}

const RefreshButton = React.memo(function RefreshButton({
  isRetrying,
  label,
  hint,
  onPress,
}: RefreshButtonProps) {
  const getStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.buttonBase,
      isRetrying
        ? styles.buttonDisabled
        : hovered
          ? styles.buttonHovered
          : styles.buttonNormal,
      focused && styles.buttonFocused,
      pressed && styles.buttonPressed,
    ],
    [isRetrying],
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isRetrying}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={
        isRetrying
          ? ACCESSIBILITY_STATE_DISABLED
          : ACCESSIBILITY_STATE_ENABLED
      }
      {...({ title: hint } as any)}
      style={getStyle}
    >
      <View style={styles.buttonContent}>
        {isRetrying && (
          <ActivityIndicator
            size="small"
            color="#9ca3af"
            style={styles.buttonSpinner}
          />
        )}
        <Text
          style={
            isRetrying ? styles.buttonTextDisabled : styles.buttonTextNormal
          }
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
});

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [verifiedTime, setVerifiedTime] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectLang = useCallback((l: "en" | "sw") => {
    setLang(l);
  }, []);

  const handleDismissSuccess = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    setShowSuccess(false);
  }, []);

  // Bolt Performance Optimization:
  // Clean up timers on unmount to prevent memory leaks and unnecessary background execution.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
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
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsRetrying(false);
      setShowSuccess(true);
      setVerifiedTime(new Date().toLocaleTimeString());

      dismissTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    }, 1500);
  }, []);

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={
          lang === "en" ? "Language selection" : "Uchaguzi wa lugha"
        }
        style={styles.langContainer}
      >
        <LangButton
          langCode="en"
          isSelected={lang === "en"}
          hint={t.langHintEn}
          onSelect={handleSelectLang}
        />
        <Text style={styles.langSep} {...({ "aria-hidden": true } as any)}>
          |
        </Text>
        <LangButton
          langCode="sw"
          isSelected={lang === "sw"}
          hint={t.langHintSw}
          onSelect={handleSelectLang}
        />
      </View>

      <AppTitle title={t.title} />

      <StatusIndicator
        isRetrying={isRetrying}
        retryText={t.retry}
        readyText={t.ready}
      />

      {/* Palette Delight & Accessibility Feature: Inline success badge with manual dismiss button and timestamp */}
      {showSuccess && !isRetrying && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.successBadge}
        >
          <Text style={styles.successBadgeText}>
            {t.ok} {verifiedTime ? `(${t.lastVerified} ${verifiedTime})` : ""}
          </Text>
          <Pressable
            onPress={handleDismissSuccess}
            accessibilityRole="button"
            accessibilityLabel={t.dismissHint}
            accessibilityHint={t.dismissHint}
            style={({ hovered, focused }: any) => [
              styles.dismissBtn,
              hovered && styles.dismissBtnHover,
              focused && styles.dismissBtnFocus,
            ]}
            {...({ title: t.dismissHint } as any)}
          >
            <Text style={styles.dismissBtnText}>✕</Text>
          </Pressable>
        </View>
      )}

      <RefreshButton
        isRetrying={isRetrying}
        label={isRetrying ? t.r : t.run}
        hint={isRetrying ? t.retryHint : t.btnHint}
        onPress={handlePress}
      />
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
  langContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
  },
  langBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  langActive: { backgroundColor: "#e0f2fe" },
  langHover: { backgroundColor: "#f3f4f6" },
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
  readyBadgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0f2fe",
    borderWidth: 2,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  readyBadgeIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
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
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
  },
  successBadgeText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "600",
  },
  dismissBtn: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissBtnHover: {
    backgroundColor: "#a7f3d0",
  },
  dismissBtnFocus: {
    outlineColor: "#059669",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  dismissBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065f46",
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSpinner: {
    marginRight: 6,
  },
});
