'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Info, PlusCircle, Trash2, File as FileIcon, UploadCloud, X } from 'lucide-react';

import { submitPlanAction } from '@/app/actions';
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

const formSchema = z.object({
  unitName: z.string().min(1, { message: 'Vui lòng nhập tên đơn vị.' }),
  unitType: z.string().min(1, { message: 'Vui lòng nhập loại đơn vị.' }),
  unitLeader: z.string().min(1, { message: 'Vui lòng nhập tên lãnh đạo.' }),
  planner: z
    .string()
    .min(1, { message: 'Vui lòng nhập tên người lập kế hoạch.' }),
  strengths: z.string().min(1, { message: 'Vui lòng mô tả điểm mạnh.' }),
  weaknesses: z.string().min(1, { message: 'Vui lòng mô tả điểm yếu.' }),
  opportunities: z.string().min(1, { message: 'Vui lòng mô tả cơ hội.' }),
  threats: z.string().min(1, { message: 'Vui lòng mô tả thách thức.' }),

  // BSC Fields
  financialObjective1: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  financialKpi1: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  financialObjective2: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  financialKpi2: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  customerObjective1: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  customerKpi1: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  customerObjective2: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  customerKpi2: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  internalObjective1: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  internalKpi1: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  internalObjective2: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  internalKpi2: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  learningObjective1: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  learningKpi1: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),
  learningObjective2: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  learningKpi2: z.string().min(1, { message: 'Vui lòng nhập KPI.' }),

  // Action Plan Fields
  actionPlans: z.array(actionPlanSchema),

  // Financial Forecast
  revenue: z.string().min(1, { message: 'Vui lòng nhập doanh thu dự kiến.' }),
  costs: z.string().min(1, { message: 'Vui lòng nhập tổng chi phí dự kiến.' }),
  profit: z.string().min(1, { message: 'Vui lòng nhập lợi nhuận dự kiến.' }),
  investment: z.string().optional(),
  financialForecastFile: z.any().optional(),

  // Commitment
  commitment: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải cam kết để gửi kế hoạch.',
  }),
});

export function PlanForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitName: '',
      unitType: '',
      unitLeader: '',
      planner: '',
      strengths: '',
      weaknesses: '',
      opportunities: '',
      threats: '',
      financialObjective1: '',
      financialKpi1: '',
      financialObjective2: '',
      financialKpi2: '',
      customerObjective1: '',
      customerKpi1: '',
      customerObjective2: '',
      customerKpi2: '',
      internalObjective1: '',
      internalKpi1: '',
      internalObjective2: '',
      internalKpi2: '',
      learningObjective1: '',
      learningKpi1: '',
      learningObjective2: '',
      learningKpi2: '',
      actionPlans: [
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
        { plan: '', lead: '', time: '', budget: '', kpi: '' },
      ],
      revenue: '',
      costs: '',
      profit: '',
      investment: '',
      commitment: false,
    },
  });

  const { control, formState, watch, setValue } = form;
  const financialFile = watch('financialForecastFile');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actionPlans',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Dữ liệu đã được ghi lại',
      description: 'Dữ liệu biểu mẫu đã được ghi vào bảng điều khiển.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <FormControl>
                    <Input placeholder="Ví dụ: Phòng Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại đơn vị</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Phòng ban" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitLeader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lãnh đạo đơn vị</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="planner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người lập kế hoạch</FormLabel>
                  <FormControl>
                    <Input placeholder="Trần Thị B" {...field} />
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
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm mạnh (Strengths)</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weaknesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm yếu (Weaknesses)</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opportunities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cơ hội (Opportunities)</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thách thức (Threats)</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          <CardContent className="space-y-8">
            {/* Financial Perspective */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-semibold">Góc nhìn TÀI CHÍNH</h3>
              <FormDescription>
                Các mục tiêu tài chính nhằm đảm bảo sự bền vững và tăng trưởng
                về mặt kinh tế. Ví dụ: "Tăng doanh thu 10% so với năm 2025" với
                KPI là "Tỷ lệ tăng trưởng doanh thu (%)", hoặc "Tối ưu hóa chi
                phí hoạt động 5%" với KPI là "Tỷ lệ chi phí/doanh thu (%)".
              </FormDescription>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="financialObjective1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="financialKpi1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="financialObjective2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="financialKpi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Customer Perspective */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-semibold">
                Góc nhìn BỆNH NHÂN (KHÁCH HÀNG)
              </h3>
              <FormDescription>
                Các mục tiêu này tập trung vào việc tạo ra giá trị cho khách
                hàng. Ví dụ: "Nâng cao mức độ hài lòng của người bệnh lên ≥
                90%" với KPI là "Điểm hài lòng trung bình (thang điểm 100)",
                hoặc "Giảm thời gian chờ đợi của khách hàng xuống 15 phút" với
                KPI là "Thời gian chờ trung bình (phút)".
              </FormDescription>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerObjective1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerKpi1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerObjective2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerKpi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Internal Process Perspective */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-semibold">Góc nhìn QUY TRÌNH NỘI BỘ</h3>
              <FormDescription>
                Các mục tiêu này liên quan đến việc cải thiện các quy trình
                quan trọng để đáp ứng nhu cầu khách hàng và đạt mục tiêu tài
                chính. Ví dụ: "Tối ưu hóa quy trình khám bệnh" với KPI là "Thời
                gian trung bình từ lúc đăng ký đến lúc khám xong (phút)", hoặc
                "Số hóa 100% hồ sơ bệnh án" với KPI là "Tỷ lệ hồ sơ được số hóa
                (%)".
              </FormDescription>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="internalObjective1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="internalKpi1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="internalObjective2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="internalKpi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Learning & Growth Perspective */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-semibold">Góc nhìn HỌC TẬP & PHÁT TRIỂN</h3>
              <FormDescription>
                Mục tiêu ở đây tập trung vào năng lực của đội ngũ và hệ thống
                để hỗ trợ các mục tiêu khác. Ví dụ: "Đào tạo và chứng nhận
                chuyên môn cho 100% nhân viên" với KPI là "Tỷ lệ nhân viên
                hoàn thành khóa đào tạo (%)", hoặc "Xây dựng văn hóa đổi mới
                sáng tạo" với KPI là "Số lượng sáng kiến cải tiến được áp dụng
                mỗi quý".
              </FormDescription>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="learningObjective1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningKpi1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="learningObjective2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2) Mục tiêu:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningKpi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI:</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
            {fields.map((field, index) => (
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
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => remove(index)}
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
              onClick={() =>
                append({ plan: '', lead: '', time: '', budget: '', kpi: '' })
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
                    <div className="relative">
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
                        className="h-6 w-6"
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
              6. CAM KẾT CỦA TRƯỞNG ĐƠN VỊ
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

        <div className="flex justify-end">
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
