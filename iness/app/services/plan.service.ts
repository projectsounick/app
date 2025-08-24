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
  let respone = await fetchWrapper.get(`${config.apiUrl}/api/get-diet-plan`);

  return respone;
}
//// Funciton for getting the active plans ---------------------------/
async function getActivePlans(): Promise<{
  message: String;
  data: PlanInterface[];
  success: boolean;
}> {
  let respone = await fetchWrapper.get(`${config.apiUrl}/api/get-active-plans`);
  console.log(respone);

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
