import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;

export interface Company {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  contactPerson: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  allowedEmployees: number;
  allowedDomains: string[];
  plan?: { planId: string; planItemId: string };
  seatsUsed?: number;
  isActive: boolean;
}

export const companyService = {
  getCompanies,
  createCompany,
  assignCompanyPlan,
  removeCompanyPlan,
  applyPlanToMembers,
  createCompanyAdmin,
  getCompanyDetail,
  getCompanyMembers,
  getCompanyAdmins,
  revokeCompanyAdmin,
  setMemberActive,
  getCompanyAnalytics,
  getCompanyFeed,
  createCompanyPost,
  deletePost,
};

function getCompanies(status: boolean | null = null) {
  const q = status === null ? "" : `?status=${status}`;
  return fetchWrapper.get(`${baseUrl}/get-companies${q}`);
}

function createCompany(data: Partial<Company>) {
  return fetchWrapper.post(`${baseUrl}/create-company`, { ...data });
}

function assignCompanyPlan(companyId: string, planId: string, planItemId: string) {
  return fetchWrapper.post(`${baseUrl}/assign-company-plan/${companyId}`, {
    planId,
    planItemId,
  });
}

function removeCompanyPlan(companyId: string) {
  return fetchWrapper.post(`${baseUrl}/assign-company-plan/${companyId}`, {
    remove: true,
  });
}

function applyPlanToMembers(companyId: string) {
  return fetchWrapper.post(`${baseUrl}/apply-company-plan/${companyId}`, {});
}

function createCompanyAdmin(
  companyId: string,
  data: { email: string; name?: string; phoneNumber?: string }
) {
  return fetchWrapper.post(`${baseUrl}/create-company-admin/${companyId}`, {
    ...data,
  });
}

function getCompanyDetail(companyId: string) {
  return fetchWrapper.get(`${baseUrl}/get-company-detail?companyId=${companyId}`);
}

function getCompanyMembers(companyId?: string) {
  return fetchWrapper.get(
    `${baseUrl}/get-company-members${companyId ? `?companyId=${companyId}` : ""}`
  );
}

function getCompanyAdmins(companyId?: string) {
  return fetchWrapper.get(
    `${baseUrl}/get-company-admins${companyId ? `?companyId=${companyId}` : ""}`
  );
}

function revokeCompanyAdmin(hrUserId: string, companyId: string) {
  return fetchWrapper.post(`${baseUrl}/revoke-company-admin/${hrUserId}`, {
    companyId,
  });
}

function setMemberActive(
  memberUserId: string,
  active: boolean,
  companyId?: string
) {
  return fetchWrapper.post(`${baseUrl}/update-company-member/${memberUserId}`, {
    active,
    ...(companyId ? { companyId } : {}),
  });
}

function getCompanyAnalytics(companyId?: string) {
  return fetchWrapper.get(
    `${baseUrl}/get-company-analytics${companyId ? `?companyId=${companyId}` : ""}`
  );
}

function getCompanyFeed(companyId?: string, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  params.append("page", String(page));
  params.append("limit", String(limit));
  return fetchWrapper.get(`${baseUrl}/get-company-feed?${params.toString()}`);
}

function createCompanyPost(communityId: string, text: string) {
  return fetchWrapper.post(`${baseUrl}/create-post`, {
    communityId,
    text,
    type: "text",
  });
}

function deletePost(postId: string) {
  return fetchWrapper.delete(`${baseUrl}/delete-post/${postId}`);
}
