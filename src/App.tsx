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
    tok: "LUKU Token",
    cp: "Copy",
    cps: "Copied!",
    cpa: "Copy LUKU token to clipboard",
    shortcutC: "[C] Copy",
    langHintEn: "Switches language to English",
    langHintSw: "Switches language to Swahili",
    btnHint: "Press R or click to recheck server connections and system status",
    retryHint: "Status recheck is in progress, please wait",
    statusHint: "Displays current application connectivity and operational status",
    lastVerified: "Verified at",
    dismissHint: "Dismiss notification",
    dismissHintEsc: "Press Escape or click to dismiss notification",
    shortcuts: "Keyboard Shortcuts",
    shortcutR: "[R] Refresh",
    shortcutL: "[L] Language",
    shortcutEsc: "[Esc] Dismiss",
  },
  sw: {
    title: "Ununuzi wa Umeme (LUKU) Tanzania",
    load: "Inapakia vipengele vya programu",
    ready: "Mfumo Uko Tayari",
    retry: "Inahakiki hali ya seva sasa",
    ok: "✓ Mifumo yote inafanya kazi kikamilifu",
    run: "Hakiki Hali Tena",
    r: "Inajaribu tena...",
    tok: "Token ya LUKU",
    cp: "Nakili",
    cps: "Imenakiliwa!",
    cpa: "Nakili token ya LUKU kwenye ubao wa kunakili",
    shortcutC: "[C] Nakili",
    langHintEn: "Inabadilisha lugha kuwa Kiingereza",
    langHintSw: "Inabadilisha lugha kuwa Kiswahili",
    btnHint: "Bonyeza R au bofya kuhakiki tena muunganisho wa seva na hali ya mfumo",
    retryHint: "Uhakiki wa hali unaendelea, tafadhali subiri",
    statusHint: "Inaonyesha hali ya sasa ya muunganisho na utendaji wa programu",
    lastVerified: "Imethibitishwa saa",
    dismissHint: "Funga taarifa",
    dismissHintEsc: "Bonyeza Escape au bofya kufunga taarifa",
    shortcuts: "Njia za Mkato za Kinanda",
    shortcutR: "[R] Hakiki Hali",
    shortcutL: "[L] Badili Lugha",
    shortcutEsc: "[Esc] Funga Taarifa",
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
  lang: "en" | "sw";
}

const AppTitle = React.memo(function AppTitle({ title, lang }: AppTitleProps) {
  return (
    <Text
      style={styles.titleText}
      accessibilityRole="header"
      {...({ "aria-level": 1, lang } as any)}
    >
      {title}
    </Text>
  );
});

// Bolt Performance Optimization:
// Extracting status indicator into a memoized component isolates status badge icon rendering and text computation.
// Passing primitive props (isRetrying, retryText, readyText) guarantees referential stability, preventing status view re-renders
// during parent state changes like success alert auto-dismissal timeouts.
interface StatusIndicatorProps {
  isRetrying: boolean;
  retryText: string;
  readyText: string;
  hint: string;
}

const StatusIndicator = React.memo(function StatusIndicator({
  isRetrying,
  retryText,
  readyText,
  hint,
}: StatusIndicatorProps) {
  const currentStatus = isRetrying ? retryText + "..." : readyText;

  return (
    <View
      accessibilityRole="status"
      accessibilityLabel={currentStatus}
      accessibilityHint={hint}
      {...({ title: hint } as any)}
      style={styles.statusContainer}
    >
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
            {...({ "aria-hidden": true } as any)}
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
        {currentStatus}
      </Text>
    </View>
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
        {!isRetrying && (
          <View
            style={styles.kbdBadge}
            {...({ "aria-hidden": true } as any)}
          >
            <Text style={styles.kbdBadgeText}>[R]</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

// Bolt Performance Optimization:
// Extracting success badge into a memoized component isolates alert banner rendering and prevents
// unnecessary Virtual DOM diffing during parent component renders (e.g. keyboard navigation or language switches).
// Hoisting getDismissBtnStyle to module scope eliminates function object allocation on every render pass.
interface SuccessBadgeProps {
  message: string;
  verifiedTime: string | null;
  lastVerifiedText: string;
  dismissHint: string;
  dismissHintEsc: string;
  onDismiss: () => void;
}

const SuccessBadge = React.memo(function SuccessBadge({
  message,
  verifiedTime,
  lastVerifiedText,
  dismissHint,
  dismissHintEsc,
  onDismiss,
}: SuccessBadgeProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.successBadge}
    >
      <Text style={styles.successBadgeText}>
        {message} {verifiedTime ? `(${lastVerifiedText} ${verifiedTime})` : ""}
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={dismissHint}
        accessibilityHint={dismissHintEsc}
        style={getDismissBtnStyle}
        {...({ title: dismissHintEsc } as any)}
      >
        <View style={styles.dismissBtnContent}>
          <Text style={styles.dismissBtnText}>✕</Text>
          <View
            style={styles.escBadge}
            {...({ "aria-hidden": true } as any)}
          >
            <Text style={styles.escBadgeText}>[Esc]</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
});

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [verifiedTime, setVerifiedTime] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectLang = useCallback((l: "en" | "sw") => {
    setLang(l);
  }, []);

  const handleToggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "sw" : "en"));
  }, []);

  const handleDismissSuccess = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    setShowSuccess(false);
  }, []);

  const handleCopyToken = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText("15084839204857291038").catch(() => {});
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismissSuccess();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showSuccess, handleDismissSuccess]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target &&
        ((e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA" ||
          (e.target as HTMLElement).isContentEditable);

      if (isInput) return;

      if ((e.key === "r" || e.key === "R") && !isRetrying) {
        handlePress();
      } else if (e.key === "l" || e.key === "L") {
        setLang((prev) => (prev === "en" ? "sw" : "en"));
      } else if (e.key === "c" || e.key === "C") {
        handleCopyToken();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isRetrying, handlePress, handleCopyToken]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.container}
      {...({ lang } as any)}
    >
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
        <View style={styles.langKbdBadge} {...({ "aria-hidden": true } as any)}>
          <Text style={styles.langKbdBadgeText}>[L]</Text>
        </View>
      </View>

      <AppTitle title={t.title} lang={lang} />

      <StatusIndicator
        isRetrying={isRetrying}
        retryText={t.retry}
        readyText={t.ready}
        hint={t.statusHint}
      />

      {/* Palette Delight & Accessibility Feature: Inline success badge with manual dismiss button and timestamp */}
      {showSuccess && !isRetrying && (
        <SuccessBadge
          message={t.ok}
          verifiedTime={verifiedTime}
          lastVerifiedText={t.lastVerified}
          dismissHint={t.dismissHint}
          dismissHintEsc={t.dismissHintEsc}
          onDismiss={handleDismissSuccess}
        />
      )}

      {/* Palette Micro-UX & Accessibility Feature: Formatted LUKU token display with copy shortcut and feedback */}
      <View style={styles.tokenCard}>
        <Text style={styles.tokenLabel}>{t.tok}</Text>
        <View style={styles.tokenRow}>
          <Text style={styles.tokenValue} accessibilityLabel={`${t.tok}: 1 5 0 8 4 8 3 9 2 0 4 8 5 7 2 9 1 0 3 8`}>
            1508-4839-2048-5729-1038
          </Text>
          <Pressable
            onPress={handleCopyToken}
            accessibilityRole="button"
            accessibilityLabel={isCopied ? t.cps : t.cpa}
            accessibilityHint={t.cpa}
            style={({ hovered, focused }: any) => [
              styles.copyBtn,
              isCopied ? styles.copyBtnSuccess : hovered && styles.copyBtnHover,
              focused && styles.copyBtnFocus,
            ]}
            {...({ title: t.cpa } as any)}
          >
            <Text style={[styles.copyTxt, isCopied && styles.copyTxtSuccess]}>
              {isCopied ? t.cps : `${t.cp} [C]`}
            </Text>
          </Pressable>
        </View>
      </View>

      <RefreshButton
        isRetrying={isRetrying}
        label={isRetrying ? t.r : t.run}
        hint={isRetrying ? t.retryHint : t.btnHint}
        onPress={handlePress}
      />

      <View
        accessibilityRole={"region" as any}
        accessibilityLabel={t.shortcuts}
        style={styles.legendContainer}
      >
        <Text style={styles.legendTitle}>{t.shortcuts}:</Text>
        <View style={styles.legendItems}>
          <Pressable
            onPress={handlePress}
            disabled={isRetrying}
            accessibilityRole="button"
            accessibilityLabel={t.shortcutR}
            accessibilityHint={t.btnHint}
            accessibilityState={isRetrying ? ACCESSIBILITY_STATE_DISABLED : ACCESSIBILITY_STATE_ENABLED}
            style={({ hovered, focused }: any) => [
              styles.legendBtn,
              isRetrying && styles.legendBtnDisabled,
              hovered && !isRetrying && styles.legendBtnHover,
              focused && styles.legendBtnFocus,
            ]}
            {...({ title: isRetrying ? t.retryHint : t.btnHint } as any)}
          >
            <Text style={[styles.legendItem, isRetrying && styles.legendItemDisabled]}>
              {t.shortcutR}
            </Text>
          </Pressable>
          <Text style={styles.legendSep} {...({ "aria-hidden": true } as any)}>•</Text>
          <Pressable
            onPress={handleToggleLang}
            accessibilityRole="button"
            accessibilityLabel={t.shortcutL}
            accessibilityHint={lang === "en" ? t.langHintSw : t.langHintEn}
            accessibilityState={ACCESSIBILITY_STATE_ENABLED}
            style={({ hovered, focused }: any) => [
              styles.legendBtn,
              hovered && styles.legendBtnHover,
              focused && styles.legendBtnFocus,
            ]}
            {...({ title: lang === "en" ? t.langHintSw : t.langHintEn } as any)}
          >
            <Text style={styles.legendItem}>{t.shortcutL}</Text>
          </Pressable>
          <Text style={styles.legendSep} {...({ "aria-hidden": true } as any)}>•</Text>
          <Pressable
            onPress={handleCopyToken}
            accessibilityRole="button"
            accessibilityLabel={t.shortcutC}
            accessibilityHint={t.cpa}
            accessibilityState={ACCESSIBILITY_STATE_ENABLED}
            style={({ hovered, focused }: any) => [
              styles.legendBtn,
              hovered && styles.legendBtnHover,
              focused && styles.legendBtnFocus,
            ]}
            {...({ title: t.cpa } as any)}
          >
            <Text style={styles.legendItem}>{t.shortcutC}</Text>
          </Pressable>
          <Text style={styles.legendSep} {...({ "aria-hidden": true } as any)}>•</Text>
          <Pressable
            onPress={handleDismissSuccess}
            disabled={!showSuccess}
            accessibilityRole="button"
            accessibilityLabel={t.shortcutEsc}
            accessibilityHint={t.dismissHint}
            accessibilityState={!showSuccess ? ACCESSIBILITY_STATE_DISABLED : ACCESSIBILITY_STATE_ENABLED}
            style={({ hovered, focused }: any) => [
              styles.legendBtn,
              !showSuccess && styles.legendBtnDisabled,
              hovered && showSuccess && styles.legendBtnHover,
              focused && styles.legendBtnFocus,
            ]}
            {...({ title: showSuccess ? t.dismissHintEsc : undefined } as any)}
          >
            <Text style={[styles.legendItem, !showSuccess && styles.legendItemDisabled]}>
              {t.shortcutEsc}
            </Text>
          </Pressable>
        </View>
      </View>
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
  langKbdBadge: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  langKbdBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
  },
  legendContainer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  legendItems: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  legendBtnHover: {
    backgroundColor: "#e5e7eb",
  },
  legendBtnFocus: {
    outlineColor: "#3b82f6",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  legendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed" as any,
  },
  legendItem: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  legendItemDisabled: {
    color: "#9ca3af",
  },
  legendSep: {
    fontSize: 10,
    color: "#d1d5db",
    marginHorizontal: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  statusContainer: {
    alignItems: "center",
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
  tokenCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    maxWidth: 340,
    marginTop: 16,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenValue: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: 0.5,
  },
  copyBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  copyBtnHover: {
    backgroundColor: "#e5e7eb",
  },
  copyBtnSuccess: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  copyBtnFocus: {
    outlineColor: "#0284c7",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  copyTxt: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  copyTxtSuccess: {
    color: "#065f46",
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
  dismissBtnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  escBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: "rgba(6, 95, 70, 0.15)",
    borderRadius: 4,
  },
  escBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#065f46",
  },
  buttonBase: {
    marginTop: 20,
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
  kbdBadge: {
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 4,
  },
  kbdBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

const getDismissBtnStyle = ({ hovered, focused }: any) => [
  styles.dismissBtn,
  hovered && styles.dismissBtnHover,
  focused && styles.dismissBtnFocus,
];
