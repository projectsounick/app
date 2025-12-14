import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import { userService } from "@/app/services/user.service";
import { router } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");

interface Trainer {
  _id: string;
  name: string;
  profilePic?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TrainersScreen() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserTrainers();
      if (response.success) {
        setTrainers(response.data || []);
      } else {
        setError("Failed to fetch trainers");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View style={styles.headerContainer}>
            <NormalHeader screenName="My Trainers" />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9747FF" />
              <Text style={styles.loadingText}>Loading trainers...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={64}
                color="#FF6B6B"
              />
              <Text style={styles.emptyTitle}>Error</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : trainers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="account-off-outline"
                size={64}
                color="#9747FF"
              />
              <Text style={styles.emptyTitle}>No Trainers Available</Text>
              <Text style={styles.emptyText}>
                You don't have any active trainers assigned to your plans or
                services yet.
              </Text>
            </View>
          ) : (
            <View style={styles.contentWrapper}>
              {/* Description Section */}
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionHeader}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color="#9747FF"
                  />
                  <Text style={styles.descriptionTitle}>
                    Your Personal Trainers
                  </Text>
                </View>
                <Text style={styles.descriptionText}>
                  Connect with your dedicated trainers who are here to guide and
                  support you on your fitness journey. Tap the chat icon to start
                  a conversation and get personalized assistance.
                </Text>
              </View>

              {/* Trainers List */}
              <View style={styles.trainersContainer}>
                {trainers.map((trainer, index) => (
                <View
                  key={trainer._id}
                  style={[
                    styles.trainerCard,
                    trainer.isActive && styles.trainerCardActive,
                  ]}
                >
                  {trainer.isActive ? (
                    <LinearGradient
                      colors={["#9747FF", "#7B2CBF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.trainerGradient}
                    >
                      <View style={styles.trainerRow}>
                        {/* Profile Image - Left */}
                        <View style={styles.profileImageContainer}>
                          {trainer.profilePic ? (
                            <Image
                              source={{ uri: trainer.profilePic }}
                              style={styles.profileImage}
                            />
                          ) : (
                            <View style={styles.profilePlaceholder}>
                              <Ionicons name="person" size={28} color="#fff" />
                            </View>
                          )}
                        </View>

                        {/* Info Section - Middle */}
                        <View style={styles.infoSection}>
                          <Text style={styles.trainerName}>
                            {trainer.name || "Trainer"}
                          </Text>
                          <View style={styles.badgesRow}>
                            <View style={styles.trainerRoleBadge}>
                              <MaterialCommunityIcons
                                name="dumbbell"
                                size={12}
                                color="#fff"
                              />
                              <Text style={styles.trainerRoleText}>
                                Trainer
                              </Text>
                            </View>
                            <View style={styles.statusBadge}>
                              <View style={styles.statusDotWhite} />
                              <Text style={styles.statusText}>Active</Text>
                            </View>
                          </View>
                        </View>

                        {/* Chat Icon - Right */}
                        <TouchableOpacity 
                          style={styles.chatIconContainer}
                          activeOpacity={0.7}
                          onPress={async () => {
                            try {
                              const loggedUser = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
                              if (loggedUser.exists) {
                                const userId = loggedUser.data._id;
                                const chatId = `${userId}-${trainer._id}`;
                                router.push({
                                  pathname: "/(tabs)/dashboard/trainerchat",
                                  params: { chatId, trainerName: trainer.name, trainerId: trainer._id },
                                });
                              }
                            } catch (error) {
                              console.error("Error navigating to trainer chat:", error);
                            }
                          }}
                        >
                          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.trainerContentInactive}>
                      <View style={styles.trainerRow}>
                        {/* Profile Image - Left */}
                        <View style={styles.profileImageContainer}>
                          {trainer.profilePic ? (
                            <Image
                              source={{ uri: trainer.profilePic }}
                              style={styles.profileImageInactive}
                            />
                          ) : (
                            <View style={styles.profilePlaceholderInactive}>
                              <Ionicons name="person" size={28} color="#999" />
                            </View>
                          )}
                        </View>

                        {/* Info Section - Middle */}
                        <View style={styles.infoSection}>
                          <Text style={styles.trainerNameInactive}>
                            {trainer.name || "Trainer"}
                          </Text>
                          <View style={styles.badgesRow}>
                            <View style={styles.trainerRoleBadgeInactive}>
                              <MaterialCommunityIcons
                                name="dumbbell"
                                size={12}
                                color="#666"
                              />
                              <Text style={styles.trainerRoleTextInactive}>
                                Trainer
                              </Text>
                            </View>
                            <View style={styles.statusBadgeInactive}>
                              <View style={styles.statusDotInactive} />
                              <Text style={styles.statusTextInactive}>
                                Inactive
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Chat Icon - Right */}
                        <TouchableOpacity 
                          style={styles.chatIconContainerInactive}
                          activeOpacity={0.7}
                          onPress={async () => {
                            try {
                              const loggedUser = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
                              if (loggedUser.exists) {
                                const userId = loggedUser.data._id;
                                const chatId = `${userId}-${trainer._id}`;
                                router.push({
                                  pathname: "/(tabs)/dashboard/trainerchat",
                                  params: { chatId, trainerName: trainer.name, trainerId: trainer._id },
                                });
                              }
                            } catch (error) {
                              console.error("Error navigating to trainer chat:", error);
                            }
                          }}
                        >
                          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                ))}
              </View>
            </View>
          )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 20,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  contentWrapper: {
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 10,
    fontFamily: theme.fonts.bold,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    fontFamily: theme.fonts.regular,
  },
  trainersContainer: {
    gap: 12,
  },
  trainerCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trainerCardActive: {
    shadowColor: "#9747FF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  trainerGradient: {
    padding: 16,
  },
  trainerContentInactive: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    marginRight: 14,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileImageInactive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profilePlaceholderInactive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  infoSection: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  trainerNameInactive: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  trainerRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trainerRoleBadgeInactive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trainerRoleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
    fontFamily: theme.fonts.medium,
  },
  trainerRoleTextInactive: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
    fontFamily: theme.fonts.medium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeInactive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDotWhite: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#67C694",
    marginRight: 6,
  },
  statusDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
  },
  statusTextInactive: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    fontFamily: theme.fonts.medium,
  },
  chatIconContainer: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chatIconContainerInactive: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
