import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { companyService, Company } from "@/src/services/company.service";
import { planService } from "@/src/services/plan.service";
import { LoginWrapper } from "@/src/Hoc/LoginWrapper";

function AdminCompanies() {
  const theme = useGlobalTheme();
  const c = theme.colors;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", domains: "", allowedEmployees: "1", address: "", contactPerson: "" });
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<any>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [planModal, setPlanModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState("");
  const [planItemId, setPlanItemId] = useState("");

  const [hrModal, setHrModal] = useState(false);
  const [hrForm, setHrForm] = useState({ email: "", name: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await companyService.getCompanies();
      if (res?.success) setCompanies(res.data || []);
      else Alert.alert("Unable to load companies", res?.message || "Please try again.");
    } catch (e: any) {
      Alert.alert("Unable to load companies", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openDetail = async (company: Company) => {
    setDetailCompany(company);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res: any = await companyService.getCompanyDetail(company._id!);
      if (res?.success) setDetail(res.data);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!detailCompany?._id) return;
    const res: any = await companyService.getCompanyDetail(detailCompany._id);
    if (res?.success) setDetail(res.data);
    load();
  };

  const createCompany = async () => {
    const domains = form.domains.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
    if (!form.name || !form.address || !form.contactPerson || !domains.length) {
      Alert.alert("Missing", "Name, address, contact person and at least one domain are required.");
      return;
    }
    setSaving(true);
    try {
      const res: any = await companyService.createCompany({
        name: form.name,
        address: form.address,
        contactPerson: form.contactPerson,
        allowedEmployees: Number(form.allowedEmployees) || 1,
        allowedDomains: domains,
      });
      if (res?.success) {
        setCreateOpen(false);
        setForm({ name: "", domains: "", allowedEmployees: "1", address: "", contactPerson: "" });
        load();
      } else {
        Alert.alert("Error", res?.message || "Failed to create");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const openPlan = async () => {
    const currentPlanId = detail?.company?.plan?.planId;
    const currentPlanItemId = detail?.company?.plan?.planItemId;
    setPlanId(
      typeof currentPlanId === "string" ? currentPlanId : currentPlanId?._id || ""
    );
    setPlanItemId(
      typeof currentPlanItemId === "string"
        ? currentPlanItemId
        : currentPlanItemId?._id || ""
    );
    setPlanModal(true);
    try {
      const res: any = await planService.getAllPlans();
      if (res?.success) setPlans(res.data || []);
      else Alert.alert("Unable to load plans", res?.message || "Please try again.");
    } catch (e: any) {
      Alert.alert("Unable to load plans", e?.message || "Please try again.");
    }
  };

  const selectedPlan = useMemo(() => plans.find((p) => p._id === planId), [plans, planId]);

  const assignPlan = async () => {
    if (!detailCompany?._id || !planId || !planItemId) {
      Alert.alert("Select", "Pick a plan and a duration.");
      return;
    }
    try {
      const res: any = await companyService.assignCompanyPlan(detailCompany._id, planId, planItemId);
      if (res?.success) {
        setPlanModal(false);
        refreshDetail();
        Alert.alert("Done", res.message || "Plan assigned");
      } else Alert.alert("Error", res?.message || "Failed");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed");
    }
  };

  const applyToMembers = () => {
    if (!detailCompany?._id) return;
    Alert.alert("Apply to members", "Apply the company plan to all current members now?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apply",
        onPress: async () => {
          const res: any = await companyService.applyPlanToMembers(detailCompany._id!);
          Alert.alert(res?.success ? "Done" : "Error", res?.message || "");
          refreshDetail();
        },
      },
    ]);
  };

  const addHr = async () => {
    if (!detailCompany?._id || !hrForm.email.trim()) {
      Alert.alert("Missing", "Email is required.");
      return;
    }
    try {
      const res: any = await companyService.createCompanyAdmin(detailCompany._id, {
        email: hrForm.email.trim(),
        name: hrForm.name.trim() || undefined,
      });
      if (res?.success) {
        setHrModal(false);
        setHrForm({ email: "", name: "" });
        refreshDetail();
      } else Alert.alert("Error", res?.message || "Failed");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed");
    }
  };

  const revokeHr = (hrUserId: string) => {
    if (!detailCompany?._id) return;
    Alert.alert("Revoke admin", "Revoke this company admin's access?", [
      { text: "Cancel", style: "cancel" },
      { text: "Revoke", style: "destructive", onPress: async () => {
        const res: any = await companyService.revokeCompanyAdmin(hrUserId, detailCompany._id!);
        if (res?.success) refreshDetail(); else Alert.alert("Error", res?.message || "Failed");
      } },
    ]);
  };

  const toggleMember = (m: any, active: boolean) => {
    if (!detailCompany?._id) return;
    Alert.alert(active ? "Reactivate" : "Remove member", active ? "Reactivate this member?" : "Remove this member and free their seat?", [
      { text: "Cancel", style: "cancel" },
      { text: active ? "Reactivate" : "Remove", style: active ? "default" : "destructive", onPress: async () => {
        const res: any = await companyService.setMemberActive(m._id, active, detailCompany._id!);
        if (res?.success) refreshDetail(); else Alert.alert("Error", res?.message || "Failed");
      } },
    ]);
  };

  const Field = ({ label, value, onChange, keyboardType, placeholder }: any) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.fLabel, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        style={[styles.fInput, { color: c.text, backgroundColor: c.backgroundCard, borderColor: c.border }]}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeRouter.back()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text, fontFamily: theme.fonts.bold }]}>Companies</Text>
        <TouchableOpacity onPress={() => setCreateOpen(true)} style={[styles.newBtn, { backgroundColor: c.primary }]}>
          <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={c.primary} /></View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(x) => x._id!}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={<Text style={[styles.empty, { color: c.textMuted }]}>No companies yet</Text>}
          renderItem={({ item }) => {
            const used = (item as any).seatsUsed ?? 0;
            const full = used >= item.allowedEmployees;
            return (
              <TouchableOpacity onPress={() => openDetail(item)} style={[styles.card, { backgroundColor: c.backgroundCard, borderColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cName, { color: c.text, fontFamily: theme.fonts.medium }]}>{item.name}</Text>
                  <Text style={[styles.cSub, { color: c.textMuted }]}>{(item.allowedDomains || []).join(", ")}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <View style={[styles.pill, { backgroundColor: full ? c.error : c.primary }]}>
                      <Text style={styles.pillText}>{used}/{item.allowedEmployees} seats</Text>
                    </View>
                    <View style={[styles.pillOutline, { borderColor: c.border }]}>
                      <Text style={{ color: c.textMuted, fontSize: 11 }}>{item.plan?.planId ? "Plan set" : "No plan"}</Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={c.textMuted} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Create company */}
      <Modal visible={createOpen} animationType="slide" transparent onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalWrap}>
          <View style={[styles.sheet, { backgroundColor: c.background }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: c.text, fontFamily: theme.fonts.bold }]}>New Company</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}><MaterialCommunityIcons name="close" size={24} color={c.text} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Field label="Company name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="Acme Corp" />
              <Field label="Allowed domains (comma separated)" value={form.domains} onChange={(v: string) => setForm({ ...form, domains: v })} placeholder="acme.com" />
              <Field label="Allowed employees (seats)" value={form.allowedEmployees} onChange={(v: string) => setForm({ ...form, allowedEmployees: v })} keyboardType="number-pad" />
              <Field label="Address" value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} />
              <Field label="Contact person" value={form.contactPerson} onChange={(v: string) => setForm({ ...form, contactPerson: v })} />
              <TouchableOpacity onPress={createCompany} disabled={saving} style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: saving ? 0.6 : 1 }]}>
                <Text style={styles.primaryBtnText}>{saving ? "Saving…" : "Create"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail */}
      <Modal visible={!!detailCompany} animationType="slide" transparent onRequestClose={() => setDetailCompany(null)}>
        <View style={styles.modalWrap}>
          <View style={[styles.sheet, { backgroundColor: c.background, maxHeight: "88%" }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: c.text, fontFamily: theme.fonts.bold }]} numberOfLines={1}>{detailCompany?.name}</Text>
              <TouchableOpacity onPress={() => setDetailCompany(null)}><MaterialCommunityIcons name="close" size={24} color={c.text} /></TouchableOpacity>
            </View>
            {detailLoading || !detail ? (
              <View style={{ padding: 30 }}><ActivityIndicator color={c.primary} /></View>
            ) : (
              <ScrollView>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                  <View style={[styles.pill, { backgroundColor: (detail.seats?.used ?? 0) >= (detail.seats?.allowed ?? 0) ? c.error : c.primary }]}>
                    <Text style={styles.pillText}>{detail.seats?.used}/{detail.seats?.allowed} seats</Text>
                  </View>
                  <View style={[styles.pillOutline, { borderColor: c.border }]}>
                    <Text style={{ color: c.textMuted, fontSize: 11 }}>{detail.company?.plan?.planId ? "Plan set" : "No plan"}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity onPress={openPlan} style={[styles.smallBtn, { borderColor: c.border }]}>
                    <Text style={{ color: c.text, fontSize: 13 }}>Assign plan</Text>
                  </TouchableOpacity>
                  {detail.company?.plan?.planId ? (
                    <TouchableOpacity onPress={applyToMembers} style={[styles.smallBtn, { borderColor: c.border }]}>
                      <Text style={{ color: c.text, fontSize: 13 }}>Apply to members</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.rowBetween}>
                  <Text style={[styles.section, { color: c.text }]}>Company admins (HR)</Text>
                  <TouchableOpacity onPress={() => setHrModal(true)}><Text style={{ color: c.primary, fontSize: 13 }}>+ Add</Text></TouchableOpacity>
                </View>
                {(detail.admins || []).length === 0 ? (
                  <Text style={[styles.mut, { color: c.textMuted }]}>None yet.</Text>
                ) : (detail.admins || []).map((a: any) => (
                  <View key={a._id} style={styles.lineRow}>
                    <Text style={{ color: c.text, flex: 1, fontSize: 13 }}>{a.name || "—"} · {a.email}{!a.isActive ? " (revoked)" : ""}</Text>
                    {a.isActive ? <TouchableOpacity onPress={() => revokeHr(a._id)}><Text style={{ color: c.error, fontSize: 13 }}>Revoke</Text></TouchableOpacity> : null}
                  </View>
                ))}

                <Text style={[styles.section, { color: c.text, marginTop: 16 }]}>Members ({(detail.members || []).length})</Text>
                {(detail.members || []).map((m: any) => (
                  <View key={m._id} style={styles.lineRow}>
                    <Text style={{ color: c.text, flex: 1, fontSize: 13 }}>{m.name || "—"} · {m.email}{!m.isActive ? " (inactive)" : ""}</Text>
                    <TouchableOpacity onPress={() => toggleMember(m, !m.isActive)}>
                      <Text style={{ color: m.isActive ? c.error : c.success, fontSize: 13 }}>{m.isActive ? "Remove" : "Restore"}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={{ height: 24 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Assign plan */}
      <Modal visible={planModal} animationType="fade" transparent onRequestClose={() => setPlanModal(false)}>
        <View style={styles.modalWrap}>
          <View style={[styles.sheet, { backgroundColor: c.background, maxHeight: "80%" }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: c.text, fontFamily: theme.fonts.bold }]}>Assign plan</Text>
              <TouchableOpacity onPress={() => setPlanModal(false)}><MaterialCommunityIcons name="close" size={24} color={c.text} /></TouchableOpacity>
            </View>
            <Text style={[styles.mut, { color: c.textMuted, marginBottom: 8 }]}>Members receive this on their next login. Use “Apply to members” to backfill now.</Text>
            <ScrollView>
              <Text style={[styles.fLabel, { color: c.textMuted }]}>Plan</Text>
              {plans.map((p) => (
                <TouchableOpacity key={p._id} onPress={() => { setPlanId(p._id); setPlanItemId(""); }} style={[styles.pick, { borderColor: planId === p._id ? c.primary : c.border }]}>
                  <Text style={{ color: c.text }}>{p.title}</Text>
                </TouchableOpacity>
              ))}
              {selectedPlan ? (
                <>
                  <Text style={[styles.fLabel, { color: c.textMuted, marginTop: 10 }]}>Duration</Text>
                  {(selectedPlan.planItems || []).map((pi: any) => (
                    <TouchableOpacity key={pi._id} onPress={() => setPlanItemId(pi._id)} style={[styles.pick, { borderColor: planItemId === pi._id ? c.primary : c.border }]}>
                      <Text style={{ color: c.text }}>{pi.duration} {pi.durationType} · {pi.sessionCount} sessions</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : null}
              <TouchableOpacity onPress={assignPlan} style={[styles.primaryBtn, { backgroundColor: c.primary, marginTop: 14 }]}>
                <Text style={styles.primaryBtnText}>Assign</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add HR */}
      <Modal visible={hrModal} animationType="fade" transparent onRequestClose={() => setHrModal(false)}>
        <View style={styles.modalWrap}>
          <View style={[styles.sheet, { backgroundColor: c.background }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: c.text, fontFamily: theme.fonts.bold }]}>Add company admin</Text>
              <TouchableOpacity onPress={() => setHrModal(false)}><MaterialCommunityIcons name="close" size={24} color={c.text} /></TouchableOpacity>
            </View>
            <Field label="Email" value={hrForm.email} onChange={(v: string) => setHrForm({ ...hrForm, email: v })} placeholder="hr@acme.com" />
            <Field label="Name" value={hrForm.name} onChange={(v: string) => setHrForm({ ...hrForm, name: v })} />
            <TouchableOpacity onPress={addHr} style={[styles.primaryBtn, { backgroundColor: c.primary }]}>
              <Text style={styles.primaryBtnText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, gap: 6 },
  back: { padding: 4 },
  title: { fontSize: 20, flex: 1 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  newBtnText: { color: "#fff", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", marginTop: 40 },
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, padding: 14 },
  cName: { fontSize: 15 },
  cSub: { fontSize: 12, marginTop: 2 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pillText: { color: "#fff", fontSize: 11 },
  pillOutline: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sheetTitle: { fontSize: 18, flex: 1 },
  fLabel: { fontSize: 12, marginBottom: 6 },
  fInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  primaryBtn: { paddingVertical: 13, borderRadius: 999, alignItems: "center", marginTop: 6 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  smallBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  section: { fontSize: 14, fontWeight: "600" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mut: { fontSize: 12 },
  lineRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 8 },
  pick: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 6 },
});

export default LoginWrapper(AdminCompanies, { allowedRoles: ["admin"] });
