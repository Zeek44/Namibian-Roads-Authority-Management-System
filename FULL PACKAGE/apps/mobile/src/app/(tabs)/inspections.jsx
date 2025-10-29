import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera, MapPin, Save, Send, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUpload } from "../../utils/useUpload";

export default function InspectionForm() {
  const insets = useSafeAreaInsets();
  const [upload, { loading: uploadLoading }] = useUpload();

  // Form state
  const [formData, setFormData] = useState({
    inspection_id: "",
    asset_id: "",
    condition_rating: 3,
    findings: "",
    recommendations: "",
    weather_conditions: "",
    inspection_type: "routine",
    photos: [],
    location: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load cached assets and check connectivity
  useEffect(() => {
    loadCachedAssets();
    checkConnectivity();
    getCurrentLocation();
    generateInspectionId();
  }, []);

  const generateInspectionId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    setFormData((prev) => ({
      ...prev,
      inspection_id: `INS-${timestamp}-${randomNum}`,
    }));
  };

  const loadCachedAssets = async () => {
    try {
      const cached = await AsyncStorage.getItem("cached_assets");
      if (cached) {
        setAssets(JSON.parse(cached));
      } else {
        // Try to fetch fresh data if online
        await fetchAssets();
      }
    } catch (error) {
      console.error("Error loading cached assets:", error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets?status=approved");
      if (response.ok) {
        const assetsData = await response.json();
        setAssets(assetsData);
        // Cache for offline use
        await AsyncStorage.setItem("cached_assets", JSON.stringify(assetsData));
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setIsOffline(true);
    }
  };

  const checkConnectivity = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", { method: "HEAD" });
      setIsOffline(!response.ok);
    } catch {
      setIsOffline(true);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required for inspections",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
      }));
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Location Error", "Could not get current location");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Upload photo if online, otherwise store locally
        if (!isOffline) {
          const uploadResult = await upload({
            reactNativeAsset: {
              uri: asset.uri,
              name: `inspection_${Date.now()}.jpg`,
              mimeType: asset.mimeType || "image/jpeg",
            },
          });

          if (uploadResult.url) {
            setFormData((prev) => ({
              ...prev,
              photos: [...prev.photos, uploadResult.url],
            }));
          }
        } else {
          // Store locally for offline sync later
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, asset.uri],
          }));
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Camera Error", "Failed to take photo");
    }
  };

  const selectAsset = (asset) => {
    setSelectedAsset(asset);
    setFormData((prev) => ({
      ...prev,
      asset_id: asset.id,
    }));
  };

  const saveAsDraft = async () => {
    try {
      const draftKey = `draft_inspection_${formData.inspection_id}`;
      const draftData = {
        ...formData,
        status: "draft",
        saved_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
      Alert.alert("Draft Saved", "Inspection saved as draft locally");
    } catch (error) {
      console.error("Error saving draft:", error);
      Alert.alert("Error", "Failed to save draft");
    }
  };

  const submitInspection = async () => {
    if (!formData.asset_id) {
      Alert.alert("Missing Asset", "Please select an asset to inspect");
      return;
    }

    if (!formData.findings.trim()) {
      Alert.alert("Missing Findings", "Please enter inspection findings");
      return;
    }

    setIsLoading(true);

    try {
      const inspectionData = {
        ...formData,
        longitude: formData.location?.longitude,
        latitude: formData.location?.latitude,
        inspector_id: 2, // Default inspector for demo - in real app would get from auth
        status: isOffline ? "draft" : "submitted",
      };

      if (isOffline) {
        // Save for offline sync
        const offlineKey = `offline_inspection_${formData.inspection_id}`;
        await AsyncStorage.setItem(offlineKey, JSON.stringify(inspectionData));
        Alert.alert(
          "Saved Offline",
          "Inspection saved locally and will sync when online",
        );
      } else {
        // Submit online
        const response = await fetch("/api/inspections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inspectionData),
        });

        if (response.ok) {
          Alert.alert("Success", "Inspection submitted successfully");
          // Reset form
          resetForm();
        } else {
          throw new Error("Submission failed");
        }
      }
    } catch (error) {
      console.error("Error submitting inspection:", error);
      Alert.alert("Error", "Failed to submit inspection");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      inspection_id: "",
      asset_id: "",
      condition_rating: 3,
      findings: "",
      recommendations: "",
      weather_conditions: "",
      inspection_type: "routine",
      photos: [],
      location: null,
    });
    setSelectedAsset(null);
    generateInspectionId();
    getCurrentLocation();
  };

  const renderConditionRating = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Condition Rating
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              onPress={() =>
                setFormData((prev) => ({ ...prev, condition_rating: rating }))
              }
              style={{
                flex: 1,
                alignItems: "center",
                padding: 12,
                marginHorizontal: 2,
                backgroundColor:
                  formData.condition_rating === rating ? "#0066FF" : "#F3F4F6",
                borderRadius: 8,
              }}
            >
              <Star
                size={20}
                color={
                  formData.condition_rating === rating ? "#FFFFFF" : "#6B7280"
                }
                fill={
                  formData.condition_rating >= rating
                    ? formData.condition_rating === rating
                      ? "#FFFFFF"
                      : "#6B7280"
                    : "transparent"
                }
              />
              <Text
                style={{
                  fontSize: 12,
                  color:
                    formData.condition_rating === rating
                      ? "#FFFFFF"
                      : "#6B7280",
                  marginTop: 4,
                }}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
          Field Inspection
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          {formData.inspection_id}
        </Text>

        {/* Offline indicator */}
        {isOffline && (
          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginTop: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ fontSize: 12, color: "#92400E" }}>Offline Mode</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={{ padding: 16 }}>
          {/* Asset Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Select Asset
            </Text>
            {selectedAsset ? (
              <TouchableOpacity
                onPress={() => setSelectedAsset(null)}
                style={{
                  backgroundColor: "#DBEAFE",
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#93C5FD",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "#1E40AF" }}
                >
                  {selectedAsset.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#3730A3" }}>
                  {selectedAsset.asset_id} • {selectedAsset.asset_type_name}
                </Text>
              </TouchableOpacity>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
              >
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {assets.slice(0, 10).map((asset) => (
                    <TouchableOpacity
                      key={asset.id}
                      onPress={() => selectAsset(asset)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        minWidth: 120,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#111827",
                        }}
                      >
                        {asset.asset_type_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {asset.asset_id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Condition Rating */}
          {renderConditionRating()}

          {/* Findings */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Findings
            </Text>
            <TextInput
              value={formData.findings}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, findings: text }))
              }
              placeholder="Describe the current condition and any issues found..."
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Recommendations */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Recommendations
            </Text>
            <TextInput
              value={formData.recommendations}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, recommendations: text }))
              }
              placeholder="Recommended actions or repairs needed..."
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Weather Conditions */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Weather Conditions
            </Text>
            <TextInput
              value={formData.weather_conditions}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, weather_conditions: text }))
              }
              placeholder="Clear, cloudy, rainy, etc."
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          {/* Photos */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Photos
            </Text>

            <TouchableOpacity
              onPress={takePhoto}
              disabled={uploadLoading}
              style={{
                backgroundColor: "#0066FF",
                borderRadius: 8,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {uploadLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Camera size={20} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Take Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {formData.photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {formData.photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Location */}
          {formData.location && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Location
              </Text>
              <View
                style={{
                  backgroundColor: "#F0F9FF",
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MapPin size={16} color="#0284C7" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: "#0C4A6E" }}>
                  {formData.location.latitude.toFixed(6)},{" "}
                  {formData.location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={saveAsDraft}
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Save size={16} color="#374151" />
              <Text
                style={{ color: "#374151", fontWeight: "600", marginLeft: 8 }}
              >
                Save Draft
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={submitInspection}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: "#0066FF",
                borderRadius: 8,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    {isOffline ? "Save Offline" : "Submit"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
