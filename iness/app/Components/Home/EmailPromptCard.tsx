import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "@/app/services/user.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EmailPromptCardProps {
  onEmailUpdated?: () => void;
  onDismiss?: () => void;
}

const EmailPromptCard: React.FC<EmailPromptCardProps> = ({ onEmailUpdated, onDismiss }) => {
  const theme = useGlobalTheme();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Modal animation
  useEffect(() => {
    if (showModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, slideAnim]);

  // Email validation
  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Handle email submission
  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await userService.updateUser({ email: email.toLowerCase().trim() });

      if (response?.success) {
        setSuccess(true);
        await asyncStorageUtils.updateUserDataInAsyncStorage({ email: email.toLowerCase().trim() });
        
        // Close modal and hide card after success
        setTimeout(() => {
          setShowModal(false);
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setIsVisible(false);
              onEmailUpdated?.();
            });
          }, 300);
        }, 1500);
      } else {
        setError(response?.message || "Failed to update email");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle dismiss
  const handleDismiss = async () => {
    await AsyncStorage.setItem("emailPromptDismissed", "true");
    setShowModal(false);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEmail("");
    setError(null);
  };

  const styles = getStyles(theme);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Prompt Card */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <MaterialCommunityIcons
              name="email-alert-outline"
              size={24}
              color={theme.colors.secondPrimary}
            />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Complete Your Profile</Text>
            <Text style={styles.cardSubtitle}>
              Add your email to receive updates
            </Text>
          </View>

          <View style={styles.cardArrow}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textMuted}
            />
          </View>

          {/* Dismiss button - inside card, top right */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={14} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      {/* Email Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.modalHandle} />

            {/* Close Button */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons
                name="email-plus-outline"
                size={32}
                color={theme.colors.secondPrimary}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Add Your Email</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              You're using Apple's hidden email. Add your real email to receive important updates, workout reminders, and recover your account.
            </Text>

            {success ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={56}
                    color={theme.colors.success}
                  />
                </View>
                <Text style={styles.successText}>Email added successfully!</Text>
              </View>
            ) : (
              <>
                {/* Email Input */}
                <View style={[styles.inputContainer, error && styles.inputContainerError]}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={22}
                    color={error ? theme.colors.error : theme.colors.textMuted}
                  />
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text.toLowerCase());
                      setError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    editable={!loading}
                    style={styles.input}
                  />
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Add Email</Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={20}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* Skip Option */}
                <TouchableOpacity onPress={handleDismiss} style={styles.skipButton}>
                  <Text style={styles.skipText}>I'll do this later</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  // Card Styles
  cardContainer: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 12,
    position: "relative",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.secondPrimary,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.secondPrimary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  cardArrow: {
    marginLeft: 12,
    marginRight: 4,
  },
  dismissButton: {
    position: "absolute",
    top: -8,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${theme.colors.secondPrimary}15`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    marginLeft: 12,
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
    borderRadius: 24,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
  },
  skipButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.success,
    fontFamily: theme.fonts.bold,
  },
});

export default EmailPromptCard;
