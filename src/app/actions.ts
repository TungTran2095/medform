'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import {
  prioritize2026Initiatives,
  type Prioritize2026InitiativesInput,
} from '@/ai/flows/prioritize-2026-initiatives';
import {
  suggestRelevantKPIs,
  type SuggestRelevantKPIsInput,
} from '@/ai/flows/suggest-relevant-kpis';

// Tạo Supabase client cho server-side
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

const actionPlanSchema = z.object({
  plan: z.string(),
  lead: z.string(),
  time: z.string(),
  budget: z.string(),
  kpi: z.string(),
});

// This schema is used for the final submission validation on the server.
const planFormSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required.'),
  unitLeader: z.string().min(1, 'Unit leader is required.'),
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
  actionPlans: z.array(actionPlanSchema),

  // Financial Forecast
  financialForecastFile: z.any().optional(),

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

export interface DonViItem {
  Don_vi: string;
  Ho_va_ten: string;
}

export async function getDonViList() {
  try {
    const supabase = getSupabaseClient();
    
    console.log('Fetching don_vi from Supabase...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

    // Query với tên cột chính xác Don_vi (có thể cần quote nếu có chữ hoa)
    // Thử query với tên cột có chữ hoa trước
    let { data, error } = await supabase
      .from('don_vi')
      .select('Don_vi, Ho_va_ten');

    console.log('First query result:', { data: data?.length, error: error?.message });

    // Nếu lỗi, thử với tên cột được quote
    if (error) {
      console.log('Trying with quoted column names...');
      const result = await supabase
        .from('don_vi')
        .select('"Don_vi", "Ho_va_ten"');
      
      data = result.data;
      error = result.error;
      console.log('Quoted query result:', { data: data?.length, error: error?.message });
    }

    // Nếu vẫn lỗi, thử với tên cột lowercase
    if (error) {
      console.log('Trying with lowercase column names...');
      const result = await supabase
        .from('don_vi')
        .select('don_vi, ho_va_ten');
      
      data = result.data;
      error = result.error;
      console.log('Lowercase query result:', { data: data?.length, error: error?.message });
    }

    // Nếu vẫn lỗi, thử select tất cả
    if (error) {
      console.log('Trying to select all columns...');
      const result = await supabase
        .from('don_vi')
        .select('*');
      
      data = result.data;
      error = result.error;
      console.log('Select all result:', { data: data?.length, error: error?.message });
      if (data && data.length > 0) {
        console.log('Sample row:', data[0]);
      }
    }

    if (error) {
      console.error('Error fetching don_vi:', error);
      return { 
        success: false, 
        data: [], 
        error: `Lỗi: ${error.message}. Vui lòng kiểm tra RLS policies và tên bảng/cột.` 
      };
    }

    if (!data || data.length === 0) {
      console.warn('No data returned from don_vi table');
      return { 
        success: false, 
        data: [], 
        error: 'Bảng don_vi không có dữ liệu hoặc không có quyền truy cập.' 
      };
    }

    // Chuẩn hóa dữ liệu về format mong muốn
    const normalizedData = (data || []).map((item: any) => {
      // Thử nhiều cách để lấy tên cột
      const donVi = item.Don_vi || item.don_vi || item.DON_VI || item['Don_vi'] || '';
      const hoVaTen = item.Ho_va_ten || item.ho_va_ten || item.HO_VA_TEN || item['Ho_va_ten'] || '';
      
      return {
        Don_vi: donVi,
        Ho_va_ten: hoVaTen,
      };
    }).filter((item: any) => item.Don_vi && item.Ho_va_ten);

    console.log('Loaded don_vi list:', normalizedData.length, 'items');
    if (normalizedData.length > 0) {
      console.log('Sample item:', normalizedData[0]);
    }

    return { success: true, data: normalizedData };
  } catch (error: any) {
    console.error('Error fetching don_vi:', error);
    return { 
      success: false, 
      data: [], 
      error: error?.message || 'Không thể lấy danh sách đơn vị. Vui lòng kiểm tra biến môi trường và kết nối database.' 
    };
  }
}
