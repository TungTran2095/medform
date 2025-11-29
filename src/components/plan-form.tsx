'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2 } from 'lucide-react';

import {
  generateInitiativesAction,
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
});

export function PlanForm() {
  const [initiativesLoading, setInitiativesLoading] = React.useState(false);
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
              Sáng kiến và Mục tiêu
            </CardTitle>
            <CardDescription>
              Xác định các sáng kiến và mục tiêu chính cho năm 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="prioritizedInitiatives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Các sáng kiến ưu tiên</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        placeholder="Liệt kê các sáng kiến chính..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
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
