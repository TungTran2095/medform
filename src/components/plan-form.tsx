'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Info,
  PlusCircle,
  Trash2,
  File as FileIcon,
  UploadCloud,
  X,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { submitPlanAction, getDonViList, type DonViItem } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Icons } from './icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

const actionPlanSchema = z.object({
  plan: z.string().min(1, { message: 'Vui lòng nhập việc cần làm.' }),
  lead: z.string().min(1, { message: 'Vui lòng nhập người phụ trách.' }),
  time: z.string().min(1, { message: 'Vui lòng nhập thời gian.' }),
  budget: z.string().min(1, { message: 'Vui lòng nhập ngân sách.' }),
  kpi: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
});

const swotItemSchema = z.object({
  type: z.enum(['strengths', 'weaknesses', 'opportunities', 'threats'], {
    required_error: 'Vui lòng chọn loại SWOT.',
  }),
  description: z.string().min(1, { message: 'Vui lòng nhập mô tả.' }),
});

const bscItemSchema = z.object({
  perspective: z.enum(['financial', 'customer', 'internal', 'learning'], {
    required_error: 'Vui lòng chọn góc nhìn BSC.',
  }),
  objective: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  kpi: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
});

// Schema cho các nội dung mới (mỗi item có name và detail)
const contentItemSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên nội dung.' }),
  detail: z.string().min(1, { message: 'Vui lòng nhập chi tiết.' }),
});

const formSchema = z.object({
  unitName: z.string().min(1, { message: 'Vui lòng nhập tên đơn vị.' }),
  unitLeader: z.string().min(1, { message: 'Vui lòng nhập tên trưởng đơn vị.' }),
  
  // SWOT Fields - array - phải có đủ 4 yếu tố SWOT
  swotItems: z
    .array(swotItemSchema)
    .min(4, { message: 'Vui lòng thêm đủ 4 yếu tố SWOT (Điểm mạnh, Điểm yếu, Cơ hội, Thách thức).' })
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
        message: 'Vui lòng thêm đủ 4 yếu tố SWOT: Điểm mạnh, Điểm yếu, Cơ hội, và Thách thức.',
      }
    ),

  // BSC Fields - array - phải có ít nhất 4 góc nhìn BSC
  bscItems: z
    .array(bscItemSchema)
    .min(4, { message: 'Vui lòng thêm ít nhất 4 góc nhìn BSC.' })
    .refine(
      (items) => {
        const perspectives = new Set(items.map((item) => item.perspective));
        return perspectives.size >= 4;
      },
      {
        message: 'Vui lòng thêm ít nhất 1 mục tiêu cho mỗi góc nhìn BSC (Tài chính, Khách hàng, Quy trình nội bộ, Học tập & Phát triển).',
      }
    ),

  // Action Plan Fields
  actionPlans: z.array(actionPlanSchema),

  // Financial Forecast
  revenue: z.string().min(1, { message: 'Vui lòng nhập doanh thu dự kiến.' }),
  costs: z.string().min(1, { message: 'Vui lòng nhập tổng chi phí dự kiến.' }),
  profit: z.string().min(1, { message: 'Vui lòng nhập lợi nhuận dự kiến.' }),
  investment: z.string().optional(),
  financialForecastFile: z.any().optional().nullable(),

  // Nội dung mới 6-10
  professionalOrientation: z.array(contentItemSchema), // 6. Định hướng chuyên môn và mũi nhọn chuyên môn
  strategicProducts: z.array(contentItemSchema), // 7. Sản phẩm chiến lược của các đơn vị
  newServices2026: z.array(contentItemSchema), // Triển khai các dịch vụ mới của 2026
  recruitment: z.array(contentItemSchema), // Tuyển dụng
  conferences: z.array(contentItemSchema), // 8. Hội nghị hội thảo
  communityPrograms: z.array(contentItemSchema), // 9. Các sản phẩm của chương trình công đồng
  revenueRecommendations: z.array(contentItemSchema), // 10. Để đạt được doanh thu thì có kiến nghị và đề xuất gì không

  // Commitment
  commitment: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải cam kết để gửi kế hoạch.',
  }),
});

export function PlanForm() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [donViList, setDonViList] = React.useState<DonViItem[]>([]);
  const [isLoadingDonVi, setIsLoadingDonVi] = React.useState(true);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitName: '',
      unitLeader: '',
      swotItems: [
        { type: 'strengths', description: '' },
        { type: 'weaknesses', description: '' },
        { type: 'opportunities', description: '' },
        { type: 'threats', description: '' },
      ],
      bscItems: [
        { perspective: 'financial', objective: '', kpi: '' },
        { perspective: 'customer', objective: '', kpi: '' },
        { perspective: 'internal', objective: '', kpi: '' },
        { perspective: 'learning', objective: '', kpi: '' },
      ],
      actionPlans: [
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
      ],
      revenue: '',
      costs: '',
      profit: '',
      investment: '',
      financialForecastFile: null,
      professionalOrientation: [],
      strategicProducts: [],
      newServices2026: [],
      recruitment: [],
      conferences: [],
      communityPrograms: [],
      revenueRecommendations: [],
      commitment: false,
    },
  });

  const { control, formState, watch, setValue, trigger } = form;
  const financialFile = watch('financialForecastFile');
  const unitName = watch('unitName');

  // Load danh sách đơn vị khi component mount
  React.useEffect(() => {
    async function loadDonVi() {
      setIsLoadingDonVi(true);
      try {
        const result = await getDonViList();
        console.log('getDonViList result:', result);
        if (result.success) {
          setDonViList(result.data);
          console.log('Don vi list loaded:', result.data.length, 'items');
        } else {
          console.error('Failed to load don_vi:', result.error);
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: result.error || 'Không thể tải danh sách đơn vị.',
          });
        }
      } catch (error) {
        console.error('Error in loadDonVi:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Có lỗi xảy ra khi tải danh sách đơn vị.',
        });
      } finally {
        setIsLoadingDonVi(false);
      }
    }
    loadDonVi();
  }, [toast]);

  // Tự động điền trưởng đơn vị khi chọn đơn vị
  React.useEffect(() => {
    if (unitName) {
      const selectedDonVi = donViList.find((item) => item.Don_vi === unitName);
      if (selectedDonVi) {
        setValue('unitLeader', selectedDonVi.Ho_va_ten);
      }
    }
  }, [unitName, donViList, setValue]);

  const { fields: swotFields, append: appendSwot, remove: removeSwot } = useFieldArray({
    control,
    name: 'swotItems',
  });

  const { fields: bscFields, append: appendBsc, remove: removeBsc } = useFieldArray({
    control,
    name: 'bscItems',
  });

  const { fields: actionPlanFields, append: appendActionPlan, remove: removeActionPlan } = useFieldArray({
    control,
    name: 'actionPlans',
  });

  // Field arrays cho các nội dung mới
  const { fields: professionalOrientationFields, append: appendProfessionalOrientation, remove: removeProfessionalOrientation } = useFieldArray({
    control,
    name: 'professionalOrientation',
  });

  const { fields: strategicProductsFields, append: appendStrategicProducts, remove: removeStrategicProducts } = useFieldArray({
    control,
    name: 'strategicProducts',
  });

  const { fields: newServices2026Fields, append: appendNewServices2026, remove: removeNewServices2026 } = useFieldArray({
    control,
    name: 'newServices2026',
  });

  const { fields: recruitmentFields, append: appendRecruitment, remove: removeRecruitment } = useFieldArray({
    control,
    name: 'recruitment',
  });

  const { fields: conferencesFields, append: appendConferences, remove: removeConferences } = useFieldArray({
    control,
    name: 'conferences',
  });

  const { fields: communityProgramsFields, append: appendCommunityPrograms, remove: removeCommunityPrograms } = useFieldArray({
    control,
    name: 'communityPrograms',
  });

  const { fields: revenueRecommendationsFields, append: appendRevenueRecommendations, remove: removeRevenueRecommendations } = useFieldArray({
    control,
    name: 'revenueRecommendations',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const fileMeta = values.financialForecastFile
        ? {
            name: values.financialForecastFile.name,
            size: values.financialForecastFile.size,
            type: values.financialForecastFile.type,
          }
        : null;

      const payload = {
        ...values,
        investment: values.investment || '',
        financialForecastFile: fileMeta,
      };

      const result = await submitPlanAction(payload as any);

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Kế hoạch đã được gửi và lưu vào Supabase.',
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: result.message || 'Không thể gửi kế hoạch.',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi gửi kế hoạch. Vui lòng thử lại.',
      });
    }
  }

  const handlePreview = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc trước khi xem trước.',
      });
      return;
    }

    if (formRef.current) {
      setIsGeneratingPdf(true);
      toast({
        title: 'Đang tạo PDF...',
        description: 'Vui lòng đợi trong giây lát.',
      });
      try {
        const canvas = await html2canvas(formRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          onclone: (document) => {
            // Hide buttons and other non-printable elements in the cloned document
            const elementsToHide = document.querySelectorAll('.no-print');
            elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
          }
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const width = pdfWidth;
        const height = width / ratio;

        let position = 0;
        let heightLeft = imgHeight * pdfWidth / imgWidth;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - (imgHeight * pdfWidth / imgWidth);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
          heightLeft -= pdfHeight;
        }
        
        pdf.save('ke-hoach-2026.pdf');
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tạo tệp PDF. Vui lòng thử lại.',
        });
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };


  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">1. Thông tin đơn vị</CardTitle>
            <CardDescription>
              Cung cấp thông tin cơ bản về đơn vị của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="unitName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đơn vị</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value || undefined}
                    disabled={isLoadingDonVi || donViList.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDonVi ? "Đang tải..." : donViList.length === 0 ? "Không có dữ liệu" : "Chọn đơn vị"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {donViList.length === 0 ? (
                        <SelectItem value="no-data" disabled>
                          {isLoadingDonVi ? "Đang tải..." : "Không có dữ liệu"}
                        </SelectItem>
                      ) : (
                        // Loại bỏ duplicate và dùng index làm key để tránh trùng key
                        donViList
                          .filter((item, index, self) => 
                            index === self.findIndex((t) => t.Don_vi === item.Don_vi)
                          )
                          .map((item, index) => (
                            <SelectItem key={`${item.Don_vi}-${index}`} value={item.Don_vi}>
                              {item.Don_vi}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {donViList.length === 0 && !isLoadingDonVi && (
                    <p className="text-sm text-muted-foreground">
                      Vui lòng kiểm tra kết nối database hoặc biến môi trường Supabase.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitLeader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trưởng đơn vị</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Sẽ tự động điền khi chọn đơn vị" 
                      {...field} 
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">2. Phân tích SWOT</CardTitle>
            <CardDescription>
              Điền vào các điểm mạnh, điểm yếu, cơ hội và thách thức của đơn vị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {swotFields.map((field, index) => {
              const swotTypeLabels: Record<string, string> = {
                strengths: 'Điểm mạnh (Strengths)',
                weaknesses: 'Điểm yếu (Weaknesses)',
                opportunities: 'Cơ hội (Opportunities)',
                threats: 'Thách thức (Threats)',
              };
              return (
                <div
                  key={field.id}
                  className="relative space-y-4 rounded-md border p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name={`swotItems.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại SWOT</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại SWOT" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strengths">Điểm mạnh (Strengths)</SelectItem>
                              <SelectItem value="weaknesses">Điểm yếu (Weaknesses)</SelectItem>
                              <SelectItem value="opportunities">Cơ hội (Opportunities)</SelectItem>
                              <SelectItem value="threats">Thách thức (Threats)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`swotItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Textarea rows={5} placeholder="Nhập mô tả..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {swotFields.length > 4 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeSwot(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa mục SWOT</span>
                    </Button>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendSwot({ type: 'strengths', description: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm mục SWOT
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="font-headline">
                3. MỤC TIÊU NĂM 2026 THEO 4 GÓC NHÌN BSC
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Thẻ điểm cân bằng (BSC) là một hệ thống quản lý chiến
                      lược giúp các tổ chức xác định, đo lường và quản lý các
                      mục tiêu từ bốn góc nhìn khác nhau: Tài chính, Khách
                      hàng, Quy trình nội bộ, và Học tập & Phát triển.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>
              Để xây dựng kế hoạch toàn diện, hãy xác định 2-3 mục tiêu quan
              trọng nhất cho mỗi góc nhìn của Thẻ điểm cân bằng (BSC). Với mỗi
              mục tiêu, hãy đề xuất một Chỉ số đo lường hiệu quả chính (KPI) cụ
              thể, có thể định lượng và bám sát với mục tiêu đó.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {bscFields.map((field, index) => {
              const perspectiveLabels: Record<string, { title: string; description: string }> = {
                financial: {
                  title: 'Góc nhìn TÀI CHÍNH',
                  description: 'Các mục tiêu tài chính nhằm đảm bảo sự bền vững và tăng trưởng về mặt kinh tế. Ví dụ: "Tăng doanh thu 10% so với năm 2025" với KPI là "Tỷ lệ tăng trưởng doanh thu (%)".',
                },
                customer: {
                  title: 'Góc nhìn BỆNH NHÂN (KHÁCH HÀNG)',
                  description: 'Các mục tiêu này tập trung vào việc tạo ra giá trị cho khách hàng. Ví dụ: "Nâng cao mức độ hài lòng của người bệnh lên ≥ 90%" với KPI là "Điểm hài lòng trung bình (thang điểm 100)".',
                },
                internal: {
                  title: 'Góc nhìn QUY TRÌNH NỘI BỘ',
                  description: 'Các mục tiêu này liên quan đến việc cải thiện các quy trình quan trọng để đáp ứng nhu cầu khách hàng và đạt mục tiêu tài chính. Ví dụ: "Tối ưu hóa quy trình khám bệnh" với KPI là "Thời gian trung bình từ lúc đăng ký đến lúc khám xong (phút)".',
                },
                learning: {
                  title: 'Góc nhìn HỌC TẬP & PHÁT TRIỂN',
                  description: 'Mục tiêu ở đây tập trung vào năng lực của đội ngũ và hệ thống để hỗ trợ các mục tiêu khác. Ví dụ: "Đào tạo và chứng nhận chuyên môn cho 100% nhân viên" với KPI là "Tỷ lệ nhân viên hoàn thành khóa đào tạo (%)".',
                },
              };
              const currentPerspective = watch(`bscItems.${index}.perspective`) as keyof typeof perspectiveLabels;
              const perspectiveInfo = currentPerspective ? perspectiveLabels[currentPerspective] : null;
              
              return (
                <div
                  key={field.id}
                  className="relative space-y-4 rounded-md border p-4"
                >
                  <FormField
                    control={control}
                    name={`bscItems.${index}.perspective`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Góc nhìn BSC</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn góc nhìn BSC" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="financial">Góc nhìn TÀI CHÍNH</SelectItem>
                            <SelectItem value="customer">Góc nhìn BỆNH NHÂN (KHÁCH HÀNG)</SelectItem>
                            <SelectItem value="internal">Góc nhìn QUY TRÌNH NỘI BỘ</SelectItem>
                            <SelectItem value="learning">Góc nhìn HỌC TẬP & PHÁT TRIỂN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {perspectiveInfo && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">{perspectiveInfo.title}</h3>
                      <FormDescription>{perspectiveInfo.description}</FormDescription>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name={`bscItems.${index}.objective`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mục tiêu:</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mục tiêu..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`bscItems.${index}.kpi`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KPI:</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập KPI..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {bscFields.length > 4 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeBsc(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa mục tiêu BSC</span>
                    </Button>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendBsc({ perspective: 'financial', objective: '', kpi: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm mục tiêu BSC
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              4. KẾ HOẠCH HÀNH ĐỘNG CHÍNH NĂM 2026 (3-5 HÀNH ĐỘNG)
            </CardTitle>
            <CardDescription>
              Ghi các việc/dự án quan trọng nhất để đạt mục tiêu. Mỗi việc cần
              rõ: ai phụ trách, thời gian, ngân sách, KPI chính. Ví dụ: Triển
              khai hệ thống đặt lịch khám online – KPI: Tỷ lệ bệnh nhân đặt
              lịch online (%), số ca khám qua kênh online.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {actionPlanFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`actionPlans.${index}.plan`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{index + 1}) Việc cần làm:</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={control}
                    name={`actionPlans.${index}.lead`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người phụ trách:</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`actionPlans.${index}.time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian:</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`actionPlans.${index}.budget`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngân sách dự kiến:</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name={`actionPlans.${index}.kpi`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI theo dõi:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {actionPlanFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeActionPlan(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa hành động</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() =>
                appendActionPlan({ plan: '', lead: '', time: '', budget: '', kpi: '' })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm hành động
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              5. DỰ BÁO TÀI CHÍNH NĂM 2026 (ĐƠN VỊ: VND)
            </CardTitle>
            <CardDescription>
             Ghi theo số liệu tốt nhất đơn vị ước tính, bám sát thực tế.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doanh thu dự kiến</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="costs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng chi phí dự kiến</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lợi nhuận dự kiến</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={control}
                name="investment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kế hoạch đầu tư (nếu có)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={control}
              name="financialForecastFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tệp đính kèm (tùy chọn)</FormLabel>
                  <FormControl>
                    <div className="relative no-print">
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input p-6 text-center"
                      >
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-primary">
                          Nhấp để tải lên
                        </span>
                        <span className="text-sm text-muted-foreground">
                          hoặc kéo và thả
                        </span>
                      </label>
                    </div>
                  </FormControl>
                  {financialFile && (
                    <div className="mt-4 flex items-center justify-between rounded-md border bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{financialFile.name}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 no-print"
                        onClick={() => setValue('financialForecastFile', null)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Xóa tệp</span>
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              6. ĐỊNH HƯỚNG CHUYÊN MÔN VÀ MŨI NHỌN CHUYÊN MÔN
            </CardTitle>
            <CardDescription>
              Xác định các định hướng chuyên môn và mũi nhọn chuyên môn của đơn vị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {professionalOrientationFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`professionalOrientation.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên định hướng chuyên môn:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên định hướng chuyên môn..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`professionalOrientation.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {professionalOrientationFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeProfessionalOrientation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendProfessionalOrientation({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm định hướng chuyên môn
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              7. SẢN PHẨM CHIẾN LƯỢC CỦA CÁC ĐƠN VỊ
            </CardTitle>
            <CardDescription>
              Liệt kê các sản phẩm chiến lược của đơn vị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {strategicProductsFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`strategicProducts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm chiến lược:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm chiến lược..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`strategicProducts.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {strategicProductsFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeStrategicProducts(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendStrategicProducts({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm sản phẩm chiến lược
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              8. TRIỂN KHAI CÁC DỊCH VỤ MỚI CỦA 2026
            </CardTitle>
            <CardDescription>
              Mô tả các dịch vụ mới sẽ được triển khai trong năm 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {newServices2026Fields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`newServices2026.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên dịch vụ mới:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên dịch vụ mới..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`newServices2026.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {newServices2026Fields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeNewServices2026(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendNewServices2026({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm dịch vụ mới
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              9. TUYỂN DỤNG
            </CardTitle>
            <CardDescription>
              Kế hoạch tuyển dụng của đơn vị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recruitmentFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`recruitment.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên vị trí tuyển dụng:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên vị trí tuyển dụng..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`recruitment.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {recruitmentFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeRecruitment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendRecruitment({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm vị trí tuyển dụng
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              10. HỘI NGHỊ HỘI THẢO
            </CardTitle>
            <CardDescription>
              Kế hoạch tổ chức các hội nghị, hội thảo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {conferencesFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`conferences.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên hội nghị/hội thảo:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên hội nghị/hội thảo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`conferences.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {conferencesFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeConferences(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendConferences({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm hội nghị/hội thảo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              11. CÁC SẢN PHẨM CỦA CHƯƠNG TRÌNH CỘNG ĐỒNG
            </CardTitle>
            <CardDescription>
              Mô tả các sản phẩm thuộc chương trình cộng đồng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {communityProgramsFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`communityPrograms.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm cộng đồng:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm cộng đồng..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`communityPrograms.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {communityProgramsFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeCommunityPrograms(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendCommunityPrograms({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm sản phẩm cộng đồng
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              12. ĐỂ ĐẠT ĐƯỢC DOANH THU THÌ CÓ KIẾN NGHỊ VÀ ĐỀ XUẤT GÌ KHÔNG
            </CardTitle>
            <CardDescription>
              Đưa ra các kiến nghị và đề xuất để đạt được doanh thu mục tiêu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {revenueRecommendationsFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={control}
                  name={`revenueRecommendations.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên kiến nghị/đề xuất:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên kiến nghị/đề xuất..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`revenueRecommendations.${index}.detail`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi tiết:</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Nhập chi tiết..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {revenueRecommendationsFields.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="no-print absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeRevenueRecommendations(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa mục</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => appendRevenueRecommendations({ name: '', detail: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm kiến nghị/đề xuất
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              13. CAM KẾT CỦA TRƯỞNG ĐƠN VỊ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="commitment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Tôi cam kết chịu trách nhiệm tổ chức thực hiện kế hoạch
                      kinh doanh năm 2026 của đơn vị, phối hợp với các phòng
                      ban liên quan để đạt các mục tiêu đã đề ra.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="no-print flex justify-end gap-4">
           <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto"
          >
            {isGeneratingPdf ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              <FileText />
            )}
            Xem trước kế hoạch
          </Button>
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full sm:w-auto"
          >
            {formState.isSubmitting && (
              <Icons.spinner className="animate-spin" />
            )}
            Gửi kế hoạch
          </Button>
        </div>
      </form>
    </Form>
  );
}
