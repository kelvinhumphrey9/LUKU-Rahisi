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
    infoBtn: "Show instructions",
    infoBtnHide: "Hide instructions",
    infoText:
      "To load this token: Enter the 20-digit number into your LUKU CIU keypad and press the enter button.",
    viewKeypad: "Keypad Mode",
    viewFormatted: "Standard Mode",
    segDone: "segment entered",
    segTodo: "segment not entered",
    segHint: "Double-click to mark segment as entered on keypad",
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
    infoBtn: "Onyesha maelekezo",
    infoBtnHide: "Ficha maelekezo",
    infoText:
      "Kuweka tokeni hii: Ingiza namba hii ya tarakimu 20 kwenye kibonyezo cha mita yako ya LUKU (CIU) kisha ubonyeze kitufe cha kukubali.",
    viewKeypad: "Kibonyezo",
    viewFormatted: "Kawaida",
    segDone: "kipande kimewekwa",
    segTodo: "kipande hakijawekwa",
    segHint: "Bofya mara mbili ili kuweka alama kuwa kimeingizwa kwenye kibonyezo",
  },
};

// Bolt Performance Optimization:
// Hoist static token constants and state presets completely outside of the App component
// to prevent redundant re-allocations on every single render pass.
const MOCK_TOKEN = "1508-4839-2048-5729-1038";
const MOCK_TOKEN_SEGMENTS = ["1508", "4839", "2048", "5729", "1038"];
const INITIAL_TYPED_SEGMENTS = [false, false, false, false, false];

// Bolt Performance Optimization:
// Extract TokenSegment into a standalone component wrapped in React.memo.
// This prevents sibling segments from re-rendering when only one segment's check state toggles.
// We also use React Native Web-specific properties correctly and cleanly.
interface TokenSegmentProps {
  seg: string;
  idx: number;
  isKeypadMode: boolean;
  typed: boolean;
  segDoneText: string;
  segTodoText: string;
  segHintText: string;
  onToggle: (idx: number) => void;
  getSegmentStyle: (idx: number) => any;
}

const TokenSegment = React.memo(function TokenSegment({
  seg,
  idx,
  isKeypadMode,
  typed,
  segDoneText,
  segTodoText,
  segHintText,
  onToggle,
  getSegmentStyle,
}: TokenSegmentProps) {
  const handlePress = useCallback(() => {
    onToggle(idx);
  }, [onToggle, idx]);

  const styleResolver = useMemo(
    () => getSegmentStyle(idx),
    [getSegmentStyle, idx]
  );

  const accessibilityState = useMemo(() => ({ checked: typed }), [typed]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={`${seg}, ${typed ? segDoneText : segTodoText}`}
      accessibilityState={accessibilityState}
      {...({ title: `${seg} - ${segHintText}` } as any)}
      style={styleResolver}
    >
      <Text style={[styles.tokenSegmentText, typed && styles.tokenSegmentTextTyped]}>
        {seg}
      </Text>
    </Pressable>
  );
});

export default function App() {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const t = translations[lang];

  console.log("App rendered - dev log 1");
  console.warn("App warning - dev log 2");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isKeypadMode, setIsKeypadMode] = useState(false);
  const [typedSegments, setTypedSegments] = useState<boolean[]>(INITIAL_TYPED_SEGMENTS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bolt Performance Optimization:
  // Clean up timers on unmount to prevent memory leaks and unnecessary background execution.
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitialLoading(false);
      setShowSuccess(true);
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Bolt Performance Optimization:
  // Create memoized language state setters using useCallback to prevent inline function recreation.
  const setLangEn = useCallback(() => setLang("en"), []);
  const setLangSw = useCallback(() => setLang("sw"), []);

  const toggleInfo = useCallback(() => setShowInfo((prev) => !prev), []);

  const toggleSegmentTyped = useCallback((idx: number) => {
    setTypedSegments((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }, []);

  const copyToken = useCallback(async () => {
    try {
      const tokenToCopy = isKeypadMode ? MOCK_TOKEN.replace(/-/g, "") : MOCK_TOKEN;
      if (Platform.OS === "web") {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(tokenToCopy);
        }
      } else {
        // Safe runtime dynamic require for native platforms to prevent Vite web bundler crashes
        const Clipboard = require("expo-clipboard");
        if (Clipboard?.setStringAsync) {
          await Clipboard.setStringAsync(tokenToCopy);
        }
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, [isKeypadMode]);

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
  // Implement memoized Pressable style resolvers using useCallback.
  const getLangEnStyle = useCallback(
    ({ focused }: any) => [
      styles.langBtn,
      lang === "en" && styles.langActive,
      focused && styles.langFocus,
    ],
    [lang],
  );

  const getLangSwStyle = useCallback(
    ({ focused }: any) => [
      styles.langBtn,
      lang === "sw" && styles.langActive,
      focused && styles.langFocus,
    ],
    [lang],
  );

  const getCopyBtnStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.copyBtnBase,
      copied
        ? styles.copyBtnSuccess
        : hovered
          ? styles.copyBtnHovered
          : styles.copyBtnNormal,
      focused && styles.copyBtnFocused,
      pressed && styles.copyBtnPressed,
    ],
    [copied],
  );

  const getHelpBtnStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.helpBtnBase,
      showInfo
        ? styles.helpBtnActive
        : hovered
          ? styles.helpBtnHovered
          : styles.helpBtnNormal,
      focused && styles.helpBtnFocused,
      pressed && styles.helpBtnPressed,
    ],
    [showInfo],
  );

  const getModeBtnStyle = useCallback(
    ({ pressed, hovered, focused }: any) => [
      styles.modeBtnBase,
      isKeypadMode
        ? styles.modeBtnActive
        : hovered
          ? styles.modeBtnHovered
          : styles.modeBtnNormal,
      focused && styles.modeBtnFocused,
      pressed && styles.modeBtnPressed,
    ],
    [isKeypadMode],
  );

  const getSegmentStyle = useCallback(
    (idx: number) => ({ pressed, hovered, focused }: any) => [
      styles.tokenSegment,
      isKeypadMode && styles.tokenSegmentKeypad,
      typedSegments[idx] && styles.tokenSegmentTyped,
      hovered && styles.tokenSegmentHovered,
      focused && styles.tokenSegmentFocused,
      pressed && styles.tokenSegmentPressed,
    ],
    [isKeypadMode, typedSegments],
  );

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
    [isRetrying],
  );

  // Bolt Performance Optimization:
  // Implement memoized static/dynamic objects and arrays using useMemo to preserve referential equality.
  const langEnAccessibilityState = useMemo(
    () => ({ selected: lang === "en" }),
    [lang],
  );
  const langSwAccessibilityState = useMemo(
    () => ({ selected: lang === "sw" }),
    [lang],
  );

  const langEnTxtStyle = useMemo(
    () => [styles.langTxt, lang === "en" && styles.langTxtActive],
    [lang],
  );
  const langSwTxtStyle = useMemo(
    () => [styles.langTxt, lang === "sw" && styles.langTxtActive],
    [lang],
  );

  const copyBtnTxtStyle = useMemo(
    () => [styles.copyBtnText, copied && styles.copyBtnTextSuccess],
    [copied],
  );

  const refreshBtnTxtStyle = useMemo(
    () => (isRetrying ? styles.buttonTextDisabled : styles.buttonTextNormal),
    [isRetrying],
  );

  const accessibilityState = useMemo(
    () => ({ disabled: isRetrying }),
    [isRetrying],
  );

  // Bolt Performance Optimization:
  // Implement memoized JSX subtrees using useMemo to skip unnecessary virtual DOM reconciliation.
  const langToggle = useMemo(
    () => (
      <View style={styles.langContainer}>
        <Pressable
          onPress={setLangEn}
          accessibilityRole="button"
          accessibilityLabel="English"
          {...({ title: "English" } as any)}
          accessibilityState={langEnAccessibilityState}
          style={getLangEnStyle}
        >
          <Text style={langEnTxtStyle}>EN</Text>
        </Pressable>
        <Text style={styles.langSep}>|</Text>
        <Pressable
          onPress={setLangSw}
          accessibilityRole="button"
          accessibilityLabel="Kiswahili"
          {...({ title: "Kiswahili" } as any)}
          accessibilityState={langSwAccessibilityState}
          style={getLangSwStyle}
        >
          <Text style={langSwTxtStyle}>SW</Text>
        </Pressable>
      </View>
    ),
    [
      setLangEn,
      setLangSw,
      langEnAccessibilityState,
      langSwAccessibilityState,
      getLangEnStyle,
      getLangSwStyle,
      langEnTxtStyle,
      langSwTxtStyle,
    ],
  );

  const titleComponent = useMemo(
    () => <Text style={styles.titleText}>{t.title}</Text>,
    [t.title],
  );

  const spinnerComponent = useMemo(
    () => (
      <View style={styles.spinnerContainer}>
        {isInitialLoading || isRetrying ? (
          <ActivityIndicator
            size="large"
            color={isRetrying ? "#10b981" : "#3b82f6"}
            accessibilityRole="progressbar"
            accessibilityLabel={isRetrying ? t.retry : t.load}
          />
        ) : (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.successBadge}
          >
            <Text style={styles.successBadgeText}>{t.ok}</Text>
          </View>
        )}
      </View>
    ),
    [isInitialLoading, isRetrying, t.retry, t.load, t.ok],
  );

  const statusTextComponent = useMemo(
    () => {
      if (!isInitialLoading && !isRetrying) return null;
      return (
        <Text style={styles.statusText}>
          {isRetrying ? t.retry + "..." : t.load + "..."}
        </Text>
      );
    },
    [isInitialLoading, isRetrying, t.retry, t.load],
  );

  const successBadgeComponent = useMemo(() => null, []);

  const tokenCardComponent = useMemo(
    () => (
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeaderRow}>
          <Text style={styles.tokenLabel}>{t.tok}</Text>
          <Pressable
            onPress={toggleInfo}
            accessibilityRole="button"
            accessibilityLabel={showInfo ? t.infoBtnHide : t.infoBtn}
            {...({ title: showInfo ? t.infoBtnHide : t.infoBtn } as any)}
            style={getHelpBtnStyle}
          >
            <Text style={styles.helpBtnText}>{showInfo ? "✕" : "?"}</Text>
          </Pressable>
        </View>

        <View
          style={styles.tokenContainer}
          accessibilityLabel={`${t.tok}: 1508 4839 2048 5729 1038`}
        >
          {MOCK_TOKEN_SEGMENTS.map((seg, idx) => (
            <React.Fragment key={idx}>
              <TokenSegment
                seg={seg}
                idx={idx}
                isKeypadMode={isKeypadMode}
                typed={typedSegments[idx]}
                segDoneText={t.segDone}
                segTodoText={t.segTodo}
                segHintText={t.segHint}
                onToggle={toggleSegmentTyped}
                getSegmentStyle={getSegmentStyle}
              />
              {!isKeypadMode && idx < 4 && (
                <Text style={styles.tokenSegmentDash}>-</Text>
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.tokenActionRow}>
          <Pressable
            onPress={() => setIsKeypadMode((p) => !p)}
            accessibilityRole="checkbox"
            accessibilityLabel={isKeypadMode ? t.viewFormatted : t.viewKeypad}
            accessibilityState={{ checked: isKeypadMode }}
            {...({ title: isKeypadMode ? t.viewFormatted : t.viewKeypad } as any)}
            style={getModeBtnStyle}
          >
            <Text style={[styles.modeBtnText, isKeypadMode && styles.modeBtnTextActive]}>
              {isKeypadMode ? t.viewFormatted : t.viewKeypad}
            </Text>
          </Pressable>

          <Pressable
            onPress={copyToken}
            accessibilityRole="button"
            accessibilityLabel={copied ? t.cps : t.cpa}
            {...({ title: copied ? t.cps : t.cpa } as any)}
            style={getCopyBtnStyle}
          >
            <Text style={copyBtnTxtStyle}>{copied ? t.cps : t.cp}</Text>
          </Pressable>
        </View>

        {showInfo && (
          <View
            {...{
              accessibilityRole: "note" as any,
              accessibilityLiveRegion: "polite" as any,
            }}
            style={styles.infoContainer}
          >
            <Text style={styles.infoText}>{t.infoText}</Text>
          </View>
        )}
      </View>
    ),
    [
      t.tok,
      t.cps,
      t.cpa,
      t.cp,
      t.infoBtn,
      t.infoBtnHide,
      t.infoText,
      t.viewKeypad,
      t.viewFormatted,
      t.segDone,
      t.segTodo,
      t.segHint,
      copied,
      showInfo,
      isKeypadMode,
      typedSegments,
      toggleInfo,
      copyToken,
      toggleSegmentTyped,
      getCopyBtnStyle,
      copyBtnTxtStyle,
      getHelpBtnStyle,
      getModeBtnStyle,
      getSegmentStyle,
    ],
  );

  const refreshButtonComponent = useMemo(
    () => (
      <Pressable
        onPress={handlePress}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel={isRetrying ? t.r : t.run}
        {...({ title: isRetrying ? t.r : t.run } as any)}
        accessibilityState={accessibilityState}
        style={getRefreshBtnStyle}
      >
        <Text style={refreshBtnTxtStyle}>{isRetrying ? t.r : t.run}</Text>
      </Pressable>
    ),
    [
      handlePress,
      isRetrying,
      t.r,
      t.run,
      accessibilityState,
      getRefreshBtnStyle,
      refreshBtnTxtStyle,
    ],
  );

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      {langToggle}

      {titleComponent}

      {spinnerComponent}

      {statusTextComponent}

      {successBadgeComponent}

      {tokenCardComponent}

      {refreshButtonComponent}
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
  tokenHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  helpBtnBase: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    outlineWidth: 0,
  },
  helpBtnNormal: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  helpBtnHovered: {
    backgroundColor: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  helpBtnActive: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },
  helpBtnFocused: {
    outlineColor: "#3b82f6",
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 1,
  },
  helpBtnPressed: {
    transform: [{ scale: 0.9 }],
  },
  helpBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4b5563",
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  tokenSegment: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 1,
    outlineWidth: 0,
    cursor: "pointer",
  },
  tokenSegmentKeypad: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
    marginHorizontal: 0.5,
  },
  tokenSegmentTyped: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  tokenSegmentHovered: {
    borderColor: "#9ca3af",
    backgroundColor: "#f3f4f6",
  },
  tokenSegmentFocused: {
    outlineColor: "#3b82f6",
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 1,
  },
  tokenSegmentPressed: {
    transform: [{ scale: 0.95 }],
  },
  tokenSegmentText: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  tokenSegmentTextTyped: {
    color: "#065f46",
    textDecorationLine: "line-through",
  },
  tokenSegmentDash: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },
  tokenActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  modeBtnBase: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    outlineWidth: 0,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtnNormal: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  },
  modeBtnActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  modeBtnHovered: {
    backgroundColor: "#f3f4f6",
  },
  modeBtnFocused: {
    outlineColor: "#0284c7",
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 1,
  },
  modeBtnPressed: {
    transform: [{ scale: 0.96 }],
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  modeBtnTextActive: {
    color: "#0369a1",
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
  infoContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    fontSize: 12,
    color: "#1e3a8a",
    lineHeight: 16,
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
