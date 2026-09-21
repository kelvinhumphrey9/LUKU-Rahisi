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
    shortcuts: "Keyboard Shortcuts:",
    rKey: "Refresh",
    lKey: "Language",
    escKey: "Dismiss",
    online: "Online",
    onlineHint: "Network connection is active and stable",
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
    shortcuts: "Njia za Mkato:",
    rKey: "Hakiki",
    lKey: "Lugha",
    escKey: "Funga",
    online: "Mtandaoni",
    onlineHint: "Muunganisho wa mtandao uko tayari na thabiti",
  },
};

const ACCESSIBILITY_STATE_SELECTED = { selected: true, checked: true };
const ACCESSIBILITY_STATE_UNSELECTED = { selected: false, checked: false };
const ACCESSIBILITY_STATE_DISABLED = { disabled: true, busy: true };
const ACCESSIBILITY_STATE_ENABLED = { disabled: false };
const ARIA_HIDDEN = { "aria-hidden": true };
const ARIA_LEVEL_1_PROPS = { "aria-level": 1 };
const ACCESSIBILITY_ROLE_MAIN_PROPS = { accessibilityRole: "main" };

// Bolt Optimization: Hoist static Pressable style callbacks to module scope to eliminate useCallback overhead on every render
const getDismissStyle = ({ pressed, hovered, focused }: any) => [
  styles.dismissBtn,
  hovered && styles.dismissBtnHover,
  focused && styles.dismissBtnFocus,
  pressed && styles.dismissBtnPressed,
];

const getLangStyleActive = ({ focused }: any) => [
  styles.langBtn,
  styles.langActive,
  focused && styles.langFocus,
];

const getLangStyleInactive = ({ hovered, focused }: any) => [
  styles.langBtn,
  hovered && styles.langHover,
  focused && styles.langFocus,
];

const getRefreshStyleNormal = ({ pressed, hovered, focused }: any) => [
  styles.buttonBase,
  hovered ? styles.buttonHovered : styles.buttonNormal,
  focused && styles.buttonFocused,
  pressed && styles.buttonPressed,
];

const getFooterItemStyle = ({ pressed, hovered, focused }: any) => [
  styles.footerItem,
  hovered && styles.footerItemHover,
  focused && styles.footerItemFocus,
  pressed && styles.footerItemPressed,
];

const getFooterItemDisabledStyle = ({ focused }: any) => [
  styles.footerItem,
  styles.footerItemDisabled,
  focused && styles.footerItemFocus,
];

const getRefreshStyleDisabled = ({ pressed, hovered, focused }: any) => [
  styles.buttonBase,
  styles.buttonDisabled,
  focused && styles.buttonFocused,
  pressed && styles.buttonPressed,
];

interface AppTitleProps {
  title: string;
}

const AppTitle = React.memo(function AppTitle({ title }: AppTitleProps) {
  return (
    <Text
      accessibilityRole="header"
      style={styles.titleText}
      {...(ARIA_LEVEL_1_PROPS as any)}
    >
      {title}
    </Text>
  );
});

interface StatusIndicatorProps {
  isRetrying: boolean;
  retryText: string;
  readyText: string;
  onlineText: string;
  onlineHint: string;
}

const StatusIndicator = React.memo(function StatusIndicator({
  isRetrying,
  retryText,
  readyText,
  onlineText,
  onlineHint,
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

      {!isRetrying && (
        <View
          accessibilityRole="status"
          accessibilityLabel={onlineText}
          accessibilityHint={onlineHint}
          style={styles.onlineBadge}
          {...({ title: onlineHint } as any)}
        >
          <Text style={styles.onlineDot} {...(ARIA_HIDDEN as any)}>
            ●{" "}
          </Text>
          <Text style={styles.onlineText}>{onlineText}</Text>
        </View>
      )}
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
      style={isSelected ? getLangStyleActive : getLangStyleInactive}
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
      style={isRetrying ? getRefreshStyleDisabled : getRefreshStyleNormal}
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

interface ShortcutFooterProps {
  shortcutsText: string;
  rText: string;
  lText: string;
  escText: string;
  isRetrying: boolean;
  showSuccess: boolean;
  currentLang: "en" | "sw";
  onRefresh: () => void;
  onToggleLang: () => void;
  onDismissEsc: () => void;
  btnHint: string;
  retryHint: string;
  langHintEn: string;
  langHintSw: string;
  dismissHint: string;
}

const ShortcutFooter = React.memo(function ShortcutFooter({
  shortcutsText,
  rText,
  lText,
  escText,
  isRetrying,
  showSuccess,
  currentLang,
  onRefresh,
  onToggleLang,
  onDismissEsc,
  btnHint,
  retryHint,
  langHintEn,
  langHintSw,
  dismissHint,
}: ShortcutFooterProps) {
  const refreshHintText = isRetrying ? retryHint : btnHint;
  const langHintText = currentLang === "en" ? langHintSw : langHintEn;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={shortcutsText}
      style={styles.footerContainer}
    >
      <Text style={styles.footerLabel}>{shortcutsText}</Text>

      <Pressable
        onPress={onRefresh}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel={`${rText} (R)`}
        accessibilityHint={refreshHintText}
        accessibilityState={
          isRetrying
            ? ACCESSIBILITY_STATE_DISABLED
            : ACCESSIBILITY_STATE_ENABLED
        }
        style={isRetrying ? getFooterItemDisabledStyle : getFooterItemStyle}
        {...({ title: refreshHintText } as any)}
      >
        <View style={styles.footerKbd} {...(ARIA_HIDDEN as any)}>
          <Text style={styles.footerKbdTxt}>R</Text>
        </View>
        <Text style={styles.footerItemTxt}>{rText}</Text>
      </Pressable>

      <Pressable
        onPress={onToggleLang}
        accessibilityRole="button"
        accessibilityLabel={`${lText} (L)`}
        accessibilityHint={langHintText}
        accessibilityState={ACCESSIBILITY_STATE_ENABLED}
        style={getFooterItemStyle}
        {...({ title: langHintText } as any)}
      >
        <View style={styles.footerKbd} {...(ARIA_HIDDEN as any)}>
          <Text style={styles.footerKbdTxt}>L</Text>
        </View>
        <Text style={styles.footerItemTxt}>{lText}</Text>
      </Pressable>

      <Pressable
        onPress={onDismissEsc}
        disabled={!showSuccess}
        accessibilityRole="button"
        accessibilityLabel={`${escText} (Esc)`}
        accessibilityHint={showSuccess ? dismissHint : ""}
        accessibilityState={
          showSuccess
            ? ACCESSIBILITY_STATE_ENABLED
            : ACCESSIBILITY_STATE_DISABLED
        }
        style={!showSuccess ? getFooterItemDisabledStyle : getFooterItemStyle}
        {...({ title: showSuccess ? dismissHint : "" } as any)}
      >
        <View style={styles.footerKbd} {...(ARIA_HIDDEN as any)}>
          <Text style={styles.footerKbdTxt}>Esc</Text>
        </View>
        <Text style={styles.footerItemTxt}>{escText}</Text>
      </Pressable>
    </View>
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

  const handleToggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "sw" : "en"));
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

  // Bolt Optimization: Initialize useRef with null to avoid allocating a new object on every render pass.
  const keyHandlerStateRef = useRef<{
    showSuccess: boolean;
    isRetrying: boolean;
    lang: "en" | "sw";
    handleDismissSuccess: () => void;
    handlePress: () => void;
    handleSelectLang: (lang: "en" | "sw") => void;
  } | null>(null);

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
      if (!keyHandlerStateRef.current) return;
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
      {...(ACCESSIBILITY_ROLE_MAIN_PROPS as any)}
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
        onlineText={t.online}
        onlineHint={t.onlineHint}
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

      <ShortcutFooter
        shortcutsText={t.shortcuts}
        rText={t.rKey}
        lText={t.lKey}
        escText={t.escKey}
        isRetrying={isRetrying}
        showSuccess={showSuccess}
        currentLang={lang}
        onRefresh={handlePress}
        onToggleLang={handleToggleLang}
        onDismissEsc={handleDismissSuccess}
        btnHint={t.btnHint}
        retryHint={t.retryHint}
        langHintEn={t.langHintEn}
        langHintSw={t.langHintSw}
        dismissHint={t.dismissHint}
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
  onlineBadge: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  onlineDot: {
    fontSize: 8,
    color: "#059669",
  },
  onlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#047857",
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
  footerContainer: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  footerItemHover: {
    backgroundColor: "#e5e7eb",
  },
  footerItemFocus: {
    outlineColor: "#3b82f6",
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  footerItemPressed: {
    transform: [{ scale: 0.95 }],
  },
  footerItemDisabled: {
    opacity: 0.5,
    ...({ cursor: "not-allowed" } as any),
  },
  footerKbd: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
  },
  footerKbdTxt: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  footerItemTxt: {
    fontSize: 11,
    color: "#4b5563",
  },
});
