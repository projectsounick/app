import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { PlanInterface, PlanItemFormValues } from "../interfaces/planInterface";

//// Exporting the functions of accountService------------------------------------------------------------/
export const planService = {
  getAllPlanTypes,
  getAllPlans,
  deletePlanInterface,
  createPlanType,
  createPlan,
  createPlanItem,
  getDietPlans,
  updatePlan,
  updatePlanItem,
  getActivePlans,
};

///// Function for getting all the prodcuts based on category--------/

async function getAllPlanTypes(): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  return fetchWrapper.get(`${config.apiUrl}/api/get-plantype`);
}

//// Funciton for getting the diet plans ---------------------------/
async function getDietPlans(): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  let respone = await fetchWrapper.get(`${config.apiUrl}/api/get-diet-plan?isActive=true`);

  return respone;
}
//// Funciton for getting the active plans ---------------------------/
async function getActivePlans(): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  console.log('[getActivePlans] Starting to fetch active plans...');
  console.log('[getActivePlans] API URL:', `${config.apiUrl}/api/get-active-plans`);
  
  const startTime = Date.now();
  let respone = await fetchWrapper.get(`${config.apiUrl}/api/get-active-plans`);
  
  const duration = Date.now() - startTime;
  console.log('[getActivePlans] Fetch completed in', duration, 'ms');
  console.log('[getActivePlans] Response success:', respone.success);
  console.log('[getActivePlans] Response data length:', respone.data?.length || 0);
  console.log('[getActivePlans] Full response:', JSON.stringify(respone, null, 2));
  
  return respone;
}
///// Function for getting all the prodcuts based on category--------/

async function createPlan(data: any): Promise<{
  message: String;
  data: PlanInterface;
  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/create-plan`, { ...data });
}

async function updatePlan(
  planId: string | undefined,
  data: any
): Promise<{
  message: string;
  data: PlanInterface;
  success: boolean;
}> {
  return fetchWrapper.put(`${config.apiUrl}/api/update-plan/${planId}`, {
    ...data,
  });
}
async function updatePlanItem(
  planItemId: string,
  data: any
): Promise<{
  message: string;
  data: any; // Replace with proper item type if you have one
  success: boolean;
}> {
  return fetchWrapper.put(
    `${config.apiUrl}/api/update-planitem/${planItemId}`,
    { ...data }
  );
}

///// Function for getting all the prodcuts based on category--------/

async function createPlanItem(data: PlanItemFormValues): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/create-planitem`, { ...data });
}

///// Function for get
// ting all the prodcuts based on category--------/

async function getAllPlans(): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  return fetchWrapper.get(`${config.apiUrl}/api/get-plan?isActive=true`);
}

///// Function for deleting the PlanInterface-------------------------------/

async function deletePlanInterface(id: string): Promise<{
  message: String;

  success: boolean;
}> {
  return fetchWrapper.delete(
    `${config.apiUrl}/api/delete-PlanInterface?id=${id}`
  );
}

///// Function for creating new PlanInterface-------------------------------/

async function createPlanType(data: any): Promise<{
  message: string;
  data: PlanInterface;
  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/create-plantype`, { ...data });
}
