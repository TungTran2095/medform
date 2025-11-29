'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2 } from 'lucide-react';

import {
  generateInitiativesAction,
  suggestKPIsAction,
  submitPlanAction,
} from '@/app/actions';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Icons } from './icons';

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
  prioritizedInitiatives: z
    .string()
    .min(1, { message: 'Vui lòng tạo và xem lại các sáng kiến ưu tiên.' }),
  objectives: z.string().min(1, { message: 'Vui lòng nhập mục tiêu.' }),
  suggestedKPIs: z
    .string()
    .min(1, { message: 'Vui lòng tạo và xem lại các KPI được đề xuất.' }),
});

export function PlanForm() {
  const [initiativesLoading, setInitiativesLoading] = React.useState(false);
  const [kpisLoading, setKpisLoading] = React.useState(false);
  const [initiativeReasoning, setInitiativeReasoning] = React.useState('');
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
      prioritizedInitiatives: '',
      objectives: '',
      suggestedKPIs: '',
    },
  });

  const { formState, getValues, setValue, trigger } = form;

  const handleGenerateInitiatives = async () => {
    const fieldsToValidate: ('strengths' | 'weaknesses' | 'opportunities' | 'threats')[] = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ các mục trong phân tích SWOT.',
      });
      return;
    }

    setInitiativesLoading(true);
    setInitiativeReasoning('');
    const { strengths, weaknesses, opportunities, threats } = getValues();
    const result = await generateInitiativesAction({
      strengths,
      weaknesses,
      opportunities,
      threats,
    });
    setInitiativesLoading(false);

    if (result.success && result.data) {
      setValue(
        'prioritizedInitiatives',
        result.data.prioritizedInitiatives.join('\n')
      );
      setInitiativeReasoning(result.data.reasoning);
      toast({
        title: 'Thành công',
        description: 'Các sáng kiến ưu tiên đã được tạo.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: result.message,
      });
    }
  };

  const handleSuggestKPIs = async () => {
    const isValid = await trigger('objectives');
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập mục tiêu cho năm 2026.',
      });
      return;
    }

    setKpisLoading(true);
    const { objectives } = getValues();
    const result = await suggestKPIsAction({ objectives });
    setKpisLoading(false);

    if (result.success && result.data) {
      setValue('suggestedKPIs', result.data.suggestedKPIs);
      toast({
        title: 'Thành công',
        description: 'Các KPI đã được đề xuất.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: result.message,
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await submitPlanAction(values);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: result.message,
      });
      form.reset();
      setInitiativeReasoning('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Thông tin đơn vị</CardTitle>
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
            <CardTitle className="font-headline">Phân tích SWOT</CardTitle>
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
            <CardTitle className="font-headline">
              Công cụ hỗ trợ AI
            </CardTitle>
            <CardDescription>
              Sử dụng AI để tạo đề xuất cho kế hoạch của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">
                  Xếp hạng ưu tiên cho năm 2026
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dựa trên phân tích SWOT, AI sẽ đề xuất 5-7 sáng kiến chính.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleGenerateInitiatives}
                disabled={initiativesLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {initiativesLoading ? (
                  <Icons.spinner className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
                Tạo danh sách sáng kiến
              </Button>
              <FormField
                control={form.control}
                name="prioritizedInitiatives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Các sáng kiến ưu tiên</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        placeholder="Kết quả từ AI sẽ xuất hiện ở đây..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {initiativeReasoning && (
                <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                  <h4 className="font-semibold text-sm">Lý do đề xuất</h4>
                  <p className="text-sm text-secondary-foreground">{initiativeReasoning}</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Đề xuất KPI</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập mục tiêu của bạn và AI sẽ đề xuất các Chỉ số Hiệu suất Chính (KPI) phù hợp.
                </p>
              </div>
               <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mục tiêu 2026</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Ví dụ: Tăng trưởng doanh thu 20%, mở rộng thị phần..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={handleSuggestKPIs}
                disabled={kpisLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {kpisLoading ? (
                  <Icons.spinner className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
                Đề xuất KPIs
              </Button>
              <FormField
                control={form.control}
                name="suggestedKPIs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Các KPI được đề xuất</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Kết quả từ AI sẽ xuất hiện ở đây..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
