import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";

const MOCK_TOKEN = "1508-4839-2048-5729-1038";

const translations: Record<string, Record<string, string>> = {
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

// Bolt Performance Optimization:
// Hoisting static accessibility state objects to module scope
// eliminates allocation overhead and provides stable O(1) references for React.memo.
const LANG_EN_ACCESSIBILITY_STATE = { selected: true };
const LANG_EN_INACTIVE_ACCESSIBILITY_STATE = { selected: false };

// Bolt Performance Optimization:
// Extracting sub-components and wrapping them in React.memo isolates state transitions.
// For example, LanguageToggle only updates when the 'lang' prop changes.
const LanguageToggle = memo(function LanguageToggle({
  lang,
  onSelectLang,
}: {
  lang: "en" | "sw";
  onSelectLang: (lang: "en" | "sw") => void;
}) {
  const isEn = lang === "en";
  const isSw = lang === "sw";

  const handleEnPress = useCallback(() => onSelectLang("en"), [onSelectLang]);
  const handleSwPress = useCallback(() => onSelectLang("sw"), [onSelectLang]);

  const getLangEnStyle = useCallback(
    ({ focused }: any) => [
      styles.langBtn,
      isEn && styles.langActive,
      focused && styles.langFocus,
    ],
    [isEn]
  );

  const getLangSwStyle = useCallback(
    ({ focused }: any) => [
      styles.langBtn,
      isSw && styles.langActive,
      focused && styles.langFocus,
    ],
    [isSw]
  );

  const langEnTxtStyle = [styles.langTxt, isEn && styles.langTxtActive];
  const langSwTxtStyle = [styles.langTxt, isSw && styles.langTxtActive];

  return (
    <View style={styles.langContainer}>
      <Pressable
        onPress={handleEnPress}
        accessibilityRole="button"
        accessibilityLabel="English"
        accessibilityState={isEn ? LANG_EN_ACCESSIBILITY_STATE : LANG_EN_INACTIVE_ACCESSIBILITY_STATE}
        style={getLangEnStyle}
      >
        <Text style={langEnTxtStyle}>EN</Text>
      </Pressable>
      <Text style={styles.langSep}>|</Text>
      <Pressable
        onPress={handleSwPress}
        accessibilityRole="button"
        accessibilityLabel="Kiswahili"
        accessibilityState={isSw ? LANG_EN_ACCESSIBILITY_STATE : LANG_EN_INACTIVE_ACCESSIBILITY_STATE}
        style={getLangSwStyle}
      >
        <Text style={langSwTxtStyle}>SW</Text>
      </Pressable>
    </View>
  );
});

// Bolt Performance Optimization:
// Memoizing pure presentational components prevents Virtual DOM diffing when unrelated state changes.
const AppTitle = memo(function AppTitle({ title }: { title: string }) {
  return <Text style={styles.titleText}>{title}</Text>;
});

const StatusDisplay = memo(function StatusDisplay({
  isRetrying,
  loadText,
  retryText,
}: {
  isRetrying: boolean;
  loadText: string;
  retryText: string;
}) {
  return (
    <>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          size="large"
          color={isRetrying ? "#10b981" : "#3b82f6"}
          accessibilityRole="progressbar"
          accessibilityLabel={isRetrying ? retryText : loadText}
        />
      </View>
      <Text style={styles.statusText}>
        {isRetrying ? `${retryText}...` : `${loadText}...`}
      </Text>
    </>
  );
});

const SuccessBadge = memo(function SuccessBadge({
  showSuccess,
  isRetrying,
  okText,
}: {
  showSuccess: boolean;
  isRetrying: boolean;
  okText: string;
}) {
  if (!showSuccess || isRetrying) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.successBadge}
    >
      <Text style={styles.successBadgeText}>{okText}</Text>
    </View>
  );
});

// Bolt Performance Optimization:
// Isolating local state (such as clipboard copied state) into TokenCard prevents
// triggering re-render cascades in the parent App component when copying tokens.
const TokenCard = memo(function TokenCard({
  tokText,
  cpText,
  cpsText,
  cpaText,
}: {
  tokText: string;
  cpText: string;
  cpsText: string;
  cpaText: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
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

  const getCopyBtnStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.copyBtnBase,
      copied ? styles.copyBtnSuccess : hovered ? styles.copyBtnHovered : styles.copyBtnNormal,
      focused && styles.copyBtnFocused,
      pressed && styles.copyBtnPressed,
    ],
    [copied]
  );

  const copyBtnTxtStyle = [
    styles.copyBtnText,
    copied && styles.copyBtnTextSuccess,
  ];

  return (
    <View style={styles.tokenCard}>
      <Text style={styles.tokenLabel}>{tokText}</Text>
      <View style={styles.tokenRow}>
        <Text style={styles.tokenValue} accessibilityLabel={`${tokText}: 1508 4839 2048 5729 1038`}>
          {MOCK_TOKEN}
        </Text>
        <Pressable
          onPress={copyToken}
          accessibilityRole="button"
          accessibilityLabel={copied ? cpsText : cpaText}
          style={getCopyBtnStyle}
        >
          <Text style={copyBtnTxtStyle}>{copied ? cpsText : cpText}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const RefreshButton = memo(function RefreshButton({
  isRetrying,
  onPress,
  rText,
  runText,
}: {
  isRetrying: boolean;
  onPress: () => void;
  rText: string;
  runText: string;
}) {
  const getRefreshBtnStyle = useCallback(
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
    [isRetrying]
  );

  const refreshBtnTxtStyle = isRetrying
    ? styles.buttonTextDisabled
    : styles.buttonTextNormal;

  const accessibilityState = { disabled: isRetrying };

  return (
    <Pressable
      onPress={onPress}
      disabled={isRetrying}
      accessibilityRole="button"
      accessibilityLabel={isRetrying ? rText : runText}
      accessibilityState={accessibilityState}
      style={getRefreshBtnStyle}
    >
      <Text style={refreshBtnTxtStyle}>
        {isRetrying ? rText : runText}
      </Text>
    </Pressable>
  );
});

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePress = useCallback(() => {
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

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <LanguageToggle lang={lang} onSelectLang={setLang} />

      <AppTitle title={t.title} />

      <StatusDisplay
        isRetrying={isRetrying}
        loadText={t.load}
        retryText={t.retry}
      />

      <SuccessBadge
        showSuccess={showSuccess}
        isRetrying={isRetrying}
        okText={t.ok}
      />

      <TokenCard
        tokText={t.tok}
        cpText={t.cp}
        cpsText={t.cps}
        cpaText={t.cpa}
      />

      <RefreshButton
        isRetrying={isRetrying}
        onPress={handlePress}
        rText={t.r}
        runText={t.run}
      />
    </View>
  );
}

// Bolt Performance Optimization:
// Defining styles via StyleSheet.create avoids creating new JavaScript objects during component render passes.
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
    outlineWidth: 0,
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
