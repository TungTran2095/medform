'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Info } from 'lucide-react';

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
      actionPlan1: '',
      actionLead1: '',
      actionTime1: '',
      actionBudget1: '',
      actionKpi1: '',
      actionPlan2: '',
      actionLead2: '',
      actionTime2: '',
      actionBudget2: '',
      actionKpi2: '',
      actionPlan3: '',
      actionLead3: '',
      actionTime3: '',
      actionBudget3: '',
      actionKpi3: '',
      actionPlan4: '',
      actionLead4: '',
      actionTime4: '',
      actionBudget4: '',
      actionKpi4: '',
      actionPlan5: '',
      actionLead5: '',
      actionTime5: '',
      actionBudget5: '',
      actionKpi5: '',
    },
  });

  const { formState } = form;

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
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Balanced Scorecard (BSC) là một hệ thống quản lý chiến
                      lược giúp các tổ chức xác định, đo lường và quản lý các
                      mục tiêu từ bốn góc nhìn khác nhau: Tài chính, Khách
                      hàng, Quy trình nội bộ, và Học tập & Phát triển.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>
              Mỗi góc nhìn vui lòng chọn 2-3 mục tiêu quan trọng nhất. Mỗi mục
              tiêu gắn với ít nhất 1 KPI cụ thể, dễ đo lường.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Financial Perspective */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-semibold">Góc nhìn TÀI CHÍNH</h3>
              <p className="text-sm text-muted-foreground">
                Ví dụ: Tăng doanh thu 10% so với 2025 – KPI: Tăng trưởng doanh
                thu (%).
              </p>
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
              <p className="text-sm text-muted-foreground">
                Ví dụ: Nâng hài lòng người bệnh lên ≥ 90% – KPI: Điểm hài lòng
                trung bình (%).
              </p>
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
              <p className="text-sm text-muted-foreground">
                Ví dụ: Tối ưu hóa quy trình khám bệnh - KPI: Thời gian chờ
                khám trung bình (phút).
              </p>
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
              <p className="text-sm text-muted-foreground">
                Ví dụ: Đào tạo 100% nhân viên về quy trình mới - KPI: Tỷ lệ
                nhân viên hoàn thành đào tạo (%).
              </p>
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
              4. KẾ HOẠCH HÀNH ĐỘNG CHÍNH NĂM 2026 (5-7 HÀNH ĐỘNG)
            </CardTitle>
            <CardDescription>
              Ghi các việc/dự án quan trọng nhất để đạt mục tiêu. Mỗi việc cần
              rõ: ai phụ trách, thời gian, ngân sách, KPI chính.
              <br />
              Ví dụ: Triển khai hệ thống đặt lịch khám online – KPI: Tỷ lệ bệnh
              nhân đặt lịch online (%), số ca khám qua kênh online.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {[1, 2, 3, 4, 5].map((item, index) => (
              <div
                key={item}
                className="space-y-4 rounded-md border p-4"
              >
                <FormField
                  control={form.control}
                  name={`actionPlan${item}` as any}
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
                    control={form.control}
                    name={`actionLead${item}` as any}
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
                    control={form.control}
                    name={`actionTime${item}` as any}
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
                    control={form.control}
                    name={`actionBudget${item}` as any}
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
                  control={form.control}
                  name={`actionKpi${item}` as any}
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
              </div>
            ))}
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
