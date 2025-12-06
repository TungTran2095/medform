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
import {
  summarizeContent,
  type SummarizeContentInput,
} from '@/ai/flows/summarize-content';

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

const swotItemSchema = z.object({
  type: z.enum(['strengths', 'weaknesses', 'opportunities', 'threats']),
  description: z.string(),
});

const bscItemSchema = z.object({
  perspective: z.enum(['financial', 'customer', 'internal', 'learning']),
  objective: z.string(),
  kpi: z.string(),
});

// Schema cho các nội dung mới (mỗi item có name và detail)
const contentItemSchema = z.object({
  name: z.string(),
  detail: z.string(),
});

// This schema is used for the final submission validation on the server.
const fileMetadataSchema = z
  .object({
    name: z.string(),
    size: z.number(),
    type: z.string().optional().nullable(),
    url: z.string().optional(), // URL của file trong Supabase Storage
  })
  .nullable()
  .optional();

// Schema cho mảng file (tối đa 3 file)
const fileMetadataArraySchema = z
  .array(fileMetadataSchema)
  .max(3, 'Tối đa 3 file được phép upload.')
  .optional()
  .nullable();

const planFormSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required.'),
  unitLeader: z.string().min(1, 'Unit leader is required.'),
  
  // SWOT Fields - array - phải có đủ 4 yếu tố SWOT
  swotItems: z
    .array(swotItemSchema)
    .min(4, 'At least 4 SWOT items are required.')
    .refine(
      (items) => {
        const types = items.map((item) => item.type);
        return (
          types.includes('strengths') &&
          types.includes('weaknesses') &&
          types.includes('opportunities') &&
          types.includes('threats')
        );
      },
      {
        message: 'All 4 SWOT types are required: strengths, weaknesses, opportunities, and threats.',
      }
    ),
  
  // BSC Fields - array - phải có ít nhất 4 góc nhìn BSC
  bscItems: z
    .array(bscItemSchema)
    .min(4, 'At least 4 BSC items are required.')
    .refine(
      (items) => {
        const perspectives = new Set(items.map((item) => item.perspective));
        return perspectives.size >= 4;
      },
      {
        message: 'At least one objective for each BSC perspective is required (financial, customer, internal, learning).',
      }
    ),

  // Action Plan Fields
  actionPlans: z.array(actionPlanSchema),

  // Financial Forecast
  revenue: z.string().min(1, 'Revenue is required.'),
  costs: z.string().min(1, 'Costs are required.'),
  profit: z.string().min(1, 'Profit is required.'),
  investment: z.string().optional(),
  financialForecastFile: fileMetadataArraySchema, // Mảng file, tối đa 3 file

  // Nội dung mới 6-10
  professionalOrientation: z.array(contentItemSchema),
  strategicProducts: z.array(contentItemSchema),
  newServices2026: z.array(contentItemSchema),
  recruitment: z.array(contentItemSchema),
  conferences: z.array(contentItemSchema),
  communityPrograms: z.array(contentItemSchema),
  revenueRecommendations: z.array(contentItemSchema),

  // Commitment
  commitment: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải cam kết để gửi kế hoạch.',
  }),
});

// Upload file lên Supabase Storage
export async function uploadFinancialForecastFile(file: File) {
  try {
    const supabase = getSupabaseClient();
    
    // Tạo tên file unique với timestamp và UUID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `forecasts/${fileName}`;

    // Upload file lên Supabase Storage
    const { data, error } = await supabase.storage
      .from('financial-forecasts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, message: error.message, url: null };
    }

    // Lấy public URL của file
    const { data: urlData } = supabase.storage
      .from('financial-forecasts')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error?.message || 'Không thể upload file.',
      url: null,
    };
  }
}

export async function submitPlanAction(data: z.infer<typeof planFormSchema>) {
  try {
    const validatedData = planFormSchema.parse(data);
    const supabase = getSupabaseClient();

    const financialForecast = {
      revenue: validatedData.revenue,
      costs: validatedData.costs,
      profit: validatedData.profit,
      investment: validatedData.investment || '',
      attachment: validatedData.financialForecastFile ?? null, // Mảng file metadata
    };

    const { error } = await supabase.from('plan_responses').insert({
      unit_name: validatedData.unitName,
      unit_leader: validatedData.unitLeader,
      swot: validatedData.swotItems,
      bsc: validatedData.bscItems,
      action_plans: validatedData.actionPlans,
      financial_forecast: financialForecast,
      professional_orientation: validatedData.professionalOrientation,
      strategic_products: validatedData.strategicProducts,
      new_services_2026: validatedData.newServices2026,
      recruitment: validatedData.recruitment,
      conferences: validatedData.conferences,
      community_programs: validatedData.communityPrograms,
      revenue_recommendations: validatedData.revenueRecommendations,
      commitment: validatedData.commitment,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, message: error.message };
    }

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

export async function summarizeContentAction(input: SummarizeContentInput) {
  try {
    const result = await summarizeContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error summarizing content:', error);
    return { success: false, message: 'Không thể tóm tắt nội dung.' };
  }
}

export interface DonViItem {
  Don_vi: string;
  Ho_va_ten: string;
}

// Tạo Supabase client với service_role để đọc dữ liệu (bypass RLS)
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  // Nếu có service_role key, sử dụng nó để bypass RLS
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Nếu không có, fallback về anon key (có thể sẽ fail nếu RLS không cho phép)
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase keys');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface PlanResponse {
  id: string;
  created_at: string;
  unit_name: string;
  unit_type: string | null;
  unit_leader: string;
  planner: string | null;
  swot: any;
  bsc: any;
  action_plans: any;
  financial_forecast: any;
  professional_orientation: any;
  strategic_products: any;
  new_services_2026: any;
  recruitment: any;
  conferences: any;
  community_programs: any;
  revenue_recommendations: any;
  commitment: boolean;
}

export async function getAllPlanResponses() {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('plan_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plan_responses:', error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    return {
      success: true,
      data: (data || []) as PlanResponse[],
    };
  } catch (error: any) {
    console.error('Error fetching plan_responses:', error);
    return {
      success: false,
      data: [],
      error: error?.message || 'Không thể lấy dữ liệu từ database.',
    };
  }
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
