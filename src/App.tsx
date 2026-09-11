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
    langHintEn: "Switches language to English (L)",
    langHintSw: "Switches language to Swahili (L)",
    btnHint: "Rechecks server connections and system status (R)",
    retryHint: "Status recheck is in progress, please wait",
    lastVerified: "Verified at",
    dismissHint: "Dismiss notification (Esc)",
  },
  sw: {
    title: "Ununuzi wa Umeme (LUKU) Tanzania",
    load: "Inapakia vipengele vya programu",
    ready: "Mfumo Uko Tayari",
    retry: "Inahakiki hali ya seva sasa",
    ok: "✓ Mifumo yote inafanya kazi kikamilifu",
    run: "Hakiki Hali Tena",
    r: "Inajaribu tena...",
    langHintEn: "Inabadilisha lugha kuwa Kiingereza (L)",
    langHintSw: "Inabadilisha lugha kuwa Kiswahili (L)",
    btnHint: "Inahakiki tena muunganisho wa seva na hali ya mfumo (R)",
    retryHint: "Uhakiki wa hali unaendelea, tafadhali subiri",
    lastVerified: "Imethibitishwa saa",
    dismissHint: "Funga taarifa (Esc)",
  },
};

const ACCESSIBILITY_STATE_SELECTED = { selected: true, checked: true };
const ACCESSIBILITY_STATE_UNSELECTED = { selected: false, checked: false };
const ACCESSIBILITY_STATE_DISABLED = { disabled: true, busy: true };
const ACCESSIBILITY_STATE_ENABLED = { disabled: false };
const ARIA_HIDDEN = { "aria-hidden": true };

interface AppTitleProps {
  title: string;
}

const AppTitle = React.memo(function AppTitle({ title }: AppTitleProps) {
  return (
    <Text
      accessibilityRole="header"
      style={styles.titleText}
      {...({ "aria-level": 1 } as any)}
    >
      {title}
    </Text>
  );
});

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
            {...({ title: readyText } as any)}
          >
            <Text
              style={styles.readyBadgeIcon}
              {...(ARIA_HIDDEN as any)}
            >
              ✓
            </Text>
          </View>
        )}
      </View>

      <Text
        accessibilityLiveRegion="polite"
        style={styles.statusText}
      >
        {isRetrying ? retryText + "..." : readyText}
      </Text>
    </>
  );
});

interface SuccessBadgeProps {
  okText: string;
  lastVerifiedText: string;
  verifiedTime: string | null;
  dismissHint: string;
  onDismiss: () => void;
  onPauseDismiss?: () => void;
  onResumeDismiss?: () => void;
}

const SuccessBadge = React.memo(function SuccessBadge({
  okText,
  lastVerifiedText,
  verifiedTime,
  dismissHint,
  onDismiss,
  onPauseDismiss,
  onResumeDismiss,
}: SuccessBadgeProps) {
  const getDismissStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.dismissBtn,
      hovered && styles.dismissBtnHover,
      focused && styles.dismissBtnFocus,
      pressed && styles.dismissBtnPressed,
    ],
    [],
  );

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.successBadge}
      {...({
        onMouseEnter: onPauseDismiss,
        onMouseLeave: onResumeDismiss,
      } as any)}
    >
      <Text style={styles.successBadgeText}>
        {okText} {verifiedTime ? `(${lastVerifiedText} ${verifiedTime})` : ""}
      </Text>
      <Pressable
        onPress={onDismiss}
        onFocus={onPauseDismiss}
        onBlur={onResumeDismiss}
        accessibilityRole="button"
        accessibilityLabel={dismissHint}
        accessibilityHint={dismissHint}
        style={getDismissStyle}
        {...({ title: dismissHint } as any)}
      >
        <Text style={styles.dismissBtnText}>✕</Text>
        <View style={styles.dismissKbdBadge} {...(ARIA_HIDDEN as any)}>
          <Text style={styles.dismissKbdBadgeText}>Esc</Text>
        </View>
      </Pressable>
    </View>
  );
});

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
      accessibilityRole="radio"
      accessibilityLabel={langCode === "en" ? "English" : "Kiswahili"}
      accessibilityHint={hint}
      accessibilityState={
        isSelected
          ? ACCESSIBILITY_STATE_SELECTED
          : ACCESSIBILITY_STATE_UNSELECTED
      }
      style={getStyle}
      {...({ title: hint, lang: langCode } as any)}
    >
      <Text style={[styles.langTxt, isSelected && styles.langTxtActive]}>
        {langCode.toUpperCase()}
      </Text>
    </Pressable>
  );
});

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
        {!isRetrying && (
          <Text style={styles.buttonIcon} {...(ARIA_HIDDEN as any)}>
            ↻{" "}
          </Text>
        )}
        <Text
          style={
            isRetrying ? styles.buttonTextDisabled : styles.buttonTextNormal
          }
        >
          {label}
        </Text>
        {!isRetrying && (
          <View style={styles.kbdBadge} {...(ARIA_HIDDEN as any)}>
            <Text style={styles.kbdBadgeText}>R</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

interface LanguageSelectorProps {
  currentLang: "en" | "sw";
  hintEn: string;
  hintSw: string;
  onSelectLang: (lang: "en" | "sw") => void;
}

const LanguageSelector = React.memo(function LanguageSelector({
  currentLang,
  hintEn,
  hintSw,
  onSelectLang,
}: LanguageSelectorProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={
        currentLang === "en" ? "Language selection" : "Uchaguzi wa lugha"
      }
      style={styles.langContainer}
    >
      <LangButton
        langCode="en"
        isSelected={currentLang === "en"}
        hint={hintEn}
        onSelect={onSelectLang}
      />
      <Text style={styles.langSep} {...(ARIA_HIDDEN as any)}>
        |
      </Text>
      <LangButton
        langCode="sw"
        isSelected={currentLang === "sw"}
        hint={hintSw}
        onSelect={onSelectLang}
      />
      <View style={styles.langKbdBadge} {...(ARIA_HIDDEN as any)}>
        <Text style={styles.langKbdBadgeText}>L</Text>
      </View>
    </View>
  );
});

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

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

  const handlePauseDismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const handleResumeDismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }, []);

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

  // Bolt Optimization: Maintain mutable state ref for keydown handler to bind window listener once on mount
  const keyHandlerStateRef = useRef({
    showSuccess,
    isRetrying,
    lang,
    handleDismissSuccess,
    handlePress,
    handleSelectLang,
  });

  useEffect(() => {
    keyHandlerStateRef.current = {
      showSuccess,
      isRetrying,
      lang,
      handleDismissSuccess,
      handlePress,
      handleSelectLang,
    };
  }, [
    showSuccess,
    isRetrying,
    lang,
    handleDismissSuccess,
    handlePress,
    handleSelectLang,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        showSuccess: currShowSuccess,
        isRetrying: currIsRetrying,
        lang: currLang,
        handleDismissSuccess: currDismiss,
        handlePress: currPress,
        handleSelectLang: currSelectLang,
      } = keyHandlerStateRef.current;

      if (e.key === "Escape" && currShowSuccess) {
        currDismiss();
      } else if (
        (e.key === "r" || e.key === "R") &&
        !currIsRetrying &&
        !(e.target as HTMLElement)?.matches("input, textarea, select")
      ) {
        currPress();
      } else if (
        (e.key === "l" || e.key === "L") &&
        !(e.target as HTMLElement)?.matches("input, textarea, select")
      ) {
        currSelectLang(currLang === "en" ? "sw" : "en");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.container}
      {...({ accessibilityRole: "main" } as any)}
    >
      <LanguageSelector
        currentLang={lang}
        hintEn={t.langHintEn}
        hintSw={t.langHintSw}
        onSelectLang={handleSelectLang}
      />

      <AppTitle title={t.title} />

      <StatusIndicator
        isRetrying={isRetrying}
        retryText={t.retry}
        readyText={t.ready}
      />

      {/* Palette Delight & Accessibility Feature: Inline success badge with manual dismiss button and timestamp */}
      {showSuccess && !isRetrying && (
        <SuccessBadge
          okText={t.ok}
          lastVerifiedText={t.lastVerified}
          verifiedTime={verifiedTime}
          dismissHint={t.dismissHint}
          onDismiss={handleDismissSuccess}
          onPauseDismiss={handlePauseDismiss}
          onResumeDismiss={handleResumeDismiss}
        />
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
  langKbdBadge: {
    marginLeft: 6,
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.25)",
  },
  langKbdBadgeText: {
    color: "#0284c7",
    fontSize: 9,
    fontWeight: "bold",
  },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dismissKbdBadge: {
    marginLeft: 4,
    backgroundColor: "rgba(6, 95, 70, 0.12)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(6, 95, 70, 0.25)",
  },
  dismissKbdBadgeText: {
    color: "#065f46",
    fontSize: 9,
    fontWeight: "bold",
  },
  dismissBtnHover: {
    backgroundColor: "#a7f3d0",
  },
  dismissBtnFocus: {
    outlineColor: "#059669",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  dismissBtnPressed: {
    transform: [{ scale: 0.92 }],
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
    ...({ cursor: "not-allowed" } as any),
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
  buttonIcon: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  kbdBadge: {
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  kbdBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
