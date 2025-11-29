'use server';

import { z } from 'zod';
import {
  prioritize2026Initiatives,
  type Prioritize2026InitiativesInput,
} from '@/ai/flows/prioritize-2026-initiatives';
import {
  suggestRelevantKPIs,
  type SuggestRelevantKPIsInput,
} from '@/ai/flows/suggest-relevant-kpis';

// This schema is used for the final submission validation on the server.
const planFormSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required.'),
  unitType: z.string().min(1, 'Unit type is required.'),
  unitLeader: z.string().min(1, 'Unit leader is required.'),
  planner: z.string().min(1, 'Planner name is required.'),
  strengths: z.string().min(1, 'Strengths are required.'),
  weaknesses: z.string().min(1, 'Weaknesses are required.'),
  opportunities: z.string().min(1, 'Opportunities are required.'),
  threats: z.string().min(1, 'Threats are required.'),
  
  // BSC Fields
  financialObjective1: z.string(),
  financialKpi1: z.string(),
  financialObjective2: z.string(),
  financialKpi2: z.string(),
  customerObjective1: z.string(),
  customerKpi1: z.string(),
  customerObjective2: z.string(),
  customerKpi2: z.string(),
  internalObjective1: z.string(),
  internalKpi1: z.string(),
  internalObjective2: z.string(),
  internalKpi2: z.string(),
  learningObjective1: z.string(),
  learningKpi1: z.string(),
  learningObjective2: z.string(),
  learningKpi2: z.string(),

  // Action Plan Fields
  actionPlan1: z.string(),
  actionLead1: z.string(),
  actionTime1: z.string(),
  actionBudget1: z.string(),
  actionKpi1: z.string(),
  actionPlan2: z.string(),
  actionLead2: z.string(),
  actionTime2: z.string(),
  actionBudget2: z.string(),
  actionKpi2: z.string(),
  actionPlan3: z.string(),
  actionLead3: z.string(),
  actionTime3: z.string(),
  actionBudget3: z.string(),
  actionKpi3: z.string(),
  actionPlan4: z.string(),
  actionLead4: z.string(),
  actionTime4: z.string(),
  actionBudget4: z.string(),
  actionKpi4: z.string(),
  actionPlan5: z.string(),
  actionLead5: z.string(),
  actionTime5: z.string(),
  actionBudget5: z.string(),
  actionKpi5: z.string(),

  // Financial Forecast
  projectedRevenue: z.string(),
  projectedCosts: z.string(),
  projectedProfit: z.string(),
  investmentPlan: z.string(),

  // Commitment
  commitment: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải cam kết để gửi kế hoạch.',
  }),
});

export async function submitPlanAction(data: z.infer<typeof planFormSchema>) {
  try {
    const validatedData = planFormSchema.parse(data);
    // Here you would typically save the data to a database like Firestore
    console.log('Form data submitted:', validatedData);
    return { success: true, message: 'Kế hoạch đã được gửi thành công!' };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, message: 'Không thể gửi kế hoạch.' };
  }
}

export async function generateInitiativesAction(
  input: Prioritize2026InitiativesInput
) {
  try {
    const result = await prioritize2026Initiatives(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating initiatives:', error);
    return { success: false, message: 'Không thể tạo sáng kiến.' };
  }
}

export async function suggestKPIsAction(input: SuggestRelevantKPIsInput) {
  try {
    const result = await suggestRelevantKPIs(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error suggesting KPIs:', error);
    return { success: false, message: 'Không thể đề xuất KPI.' };
  }
}
