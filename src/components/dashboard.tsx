'use client';

import { useEffect, useState } from 'react';
import { getAllPlanResponses, type PlanResponse } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, FileText, TrendingUp, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Sparkles, Loader2, Filter } from 'lucide-react';
import { summarizeContentAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type SortField = 'unit_name' | 'unit_leader' | 'created_at' | 'revenue' | null;
type SortDirection = 'asc' | 'desc' | null;

type SummaryState = {
  [key: string]: {
    summary: string | null;
    fullContent: string | null;
    isLoading: boolean;
    isExpanded: boolean;
  };
};

export function Dashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlanResponse | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [summaries, setSummaries] = useState<SummaryState>({});
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const result = await getAllPlanResponses();
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error || 'Không thể tải dữ liệu');
    }
    setLoading(false);
  };

  // Lọc dữ liệu theo đơn vị được chọn
  const filteredData = selectedUnit === 'all' 
    ? data 
    : data.filter((item) => item.unit_name === selectedUnit);

  // Tính toán thống kê dựa trên dữ liệu đã lọc
  const totalUnits = filteredData.length;
  const committedUnits = filteredData.filter((item) => item.commitment).length;
  const totalRevenue = filteredData.reduce((sum, item) => {
    const revenue = item.financial_forecast?.revenue;
    if (revenue && typeof revenue === 'string') {
      const num = parseFloat(revenue.replace(/[^\d.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }
    return sum;
  }, 0);

  // Lấy danh sách tên đơn vị unique
  const unitNames = Array.from(new Set(data.map((item) => item.unit_name))).sort();
  // Hàm lấy giá trị doanh thu từ một item
  const getRevenueValue = (item: PlanResponse): number => {
    const revenue = item.financial_forecast?.revenue;
    if (revenue && typeof revenue === 'string') {
      const num = parseFloat(revenue.replace(/[^\d.]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Hàm sort dữ liệu (dựa trên filteredData)
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'unit_name':
        aValue = a.unit_name.toLowerCase();
        bValue = b.unit_name.toLowerCase();
        break;
      case 'unit_leader':
        aValue = a.unit_leader.toLowerCase();
        bValue = b.unit_leader.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'revenue':
        aValue = getRevenueValue(a);
        bValue = getRevenueValue(b);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Hàm xử lý sort khi click vào header
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Component hiển thị icon sort
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  // Hàm xử lý khi thay đổi filter
  const handleUnitFilterChange = (value: string) => {
    setSelectedUnit(value);
    // Reset summaries khi thay đổi filter
    setSummaries({});
  };

  // Hàm format lại nội dung để hiển thị đẹp với gạch đầu dòng và xuống dòng
  const formatFullContentForDisplay = (data: PlanResponse[], contentType: string): string => {
    switch (contentType) {
      case 'SWOT':
        return data.map(item => {
          const swot = item.swot || [];
          const strengths = swot.filter((s: any) => s.type === 'strengths').map((s: any) => s.description);
          const weaknesses = swot.filter((s: any) => s.type === 'weaknesses').map((s: any) => s.description);
          const opportunities = swot.filter((s: any) => s.type === 'opportunities').map((s: any) => s.description);
          const threats = swot.filter((s: any) => s.type === 'threats').map((s: any) => s.description);
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (strengths.length > 0) {
            result += `\n✅ ĐIỂM MẠNH:\n`;
            strengths.forEach(s => result += `   • ${s}\n`);
          }
          if (weaknesses.length > 0) {
            result += `\n❌ ĐIỂM YẾU:\n`;
            weaknesses.forEach(w => result += `   • ${w}\n`);
          }
          if (opportunities.length > 0) {
            result += `\n🎯 CƠ HỘI:\n`;
            opportunities.forEach(o => result += `   • ${o}\n`);
          }
          if (threats.length > 0) {
            result += `\n⚠️ THÁCH THỨC:\n`;
            threats.forEach(t => result += `   • ${t}\n`);
          }
          return result;
        }).join('\n');
      
      case 'BSC':
        return data.map(item => {
          const bsc = item.bsc || [];
          const perspectives: Record<string, string> = {
            financial: '💰 Tài chính',
            customer: '👥 Khách hàng',
            internal: '⚙️ Quy trình nội bộ',
            learning: '📚 Học tập và phát triển',
          };
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          
          ['financial', 'customer', 'internal', 'learning'].forEach(perspective => {
            const items = bsc.filter((b: any) => b.perspective === perspective);
            if (items.length > 0) {
              result += `\n${perspectives[perspective]}:\n`;
              items.forEach((b: any) => {
                result += `   • Mục tiêu: ${b.objective}\n`;
                result += `     KPI: ${b.kpi}\n`;
              });
            }
          });
          return result;
        }).join('\n');
      
      case 'Action Plans':
        return data.map(item => {
          const plans = item.action_plans || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          
          plans.forEach((plan: any, idx: number) => {
            result += `\n📌 Kế hoạch ${idx + 1}:\n`;
            result += `   • Nội dung: ${plan.plan}\n`;
            result += `   • Người phụ trách: ${plan.lead}\n`;
            result += `   • Thời gian: ${plan.time}\n`;
            result += `   • Ngân sách: ${plan.budget}\n`;
            result += `   • KPI: ${plan.kpi}\n`;
          });
          return result;
        }).join('\n');
      
      case 'Financial':
        return data.map(item => {
          const ff = item.financial_forecast || {};
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `\n💰 DỰ BÁO TÀI CHÍNH:\n`;
          result += `   • Doanh thu: ${ff.revenue || '-'}\n`;
          result += `   • Chi phí: ${ff.costs || '-'}\n`;
          result += `   • Lợi nhuận: ${ff.profit || '-'}\n`;
          if (ff.investment) {
            result += `   • Đầu tư: ${ff.investment}\n`;
          }
          return result;
        }).join('\n');
      
      case 'Professional Orientation':
        return data.map(item => {
          const po = item.professional_orientation || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (po.length > 0) {
            result += `\n🎯 ĐỊNH HƯỚNG CHUYÊN MÔN:\n`;
            po.forEach((p: any) => {
              result += `   • ${p.name}\n`;
              result += `     ${p.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'Strategic Products':
        return data.map(item => {
          const sp = item.strategic_products || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (sp.length > 0) {
            result += `\n📦 SẢN PHẨM CHIẾN LƯỢC:\n`;
            sp.forEach((p: any) => {
              result += `   • ${p.name}\n`;
              result += `     ${p.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'New Services 2026':
        return data.map(item => {
          const ns = item.new_services_2026 || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (ns.length > 0) {
            result += `\n🆕 DỊCH VỤ MỚI 2026:\n`;
            ns.forEach((n: any) => {
              result += `   • ${n.name}\n`;
              result += `     ${n.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'Recruitment':
        return data.map(item => {
          const rec = item.recruitment || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (rec.length > 0) {
            result += `\n👔 TUYỂN DỤNG:\n`;
            rec.forEach((r: any) => {
              result += `   • ${r.name}\n`;
              result += `     ${r.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'Conferences':
        return data.map(item => {
          const conf = item.conferences || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (conf.length > 0) {
            result += `\n🎤 HỘI NGHỊ HỘI THẢO:\n`;
            conf.forEach((c: any) => {
              result += `   • ${c.name}\n`;
              result += `     ${c.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'Community Programs':
        return data.map(item => {
          const cp = item.community_programs || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (cp.length > 0) {
            result += `\n🤝 CHƯƠNG TRÌNH CỘNG ĐỒNG:\n`;
            cp.forEach((c: any) => {
              result += `   • ${c.name}\n`;
              result += `     ${c.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      case 'Revenue Recommendations':
        return data.map(item => {
          const rr = item.revenue_recommendations || [];
          
          let result = `\n📋 ${item.unit_name}\n`;
          result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          if (rr.length > 0) {
            result += `\n💡 KIẾN NGHỊ VÀ ĐỀ XUẤT:\n`;
            rr.forEach((r: any) => {
              result += `   • ${r.name}\n`;
              result += `     ${r.detail}\n`;
            });
          }
          return result;
        }).join('\n');
      
      default:
        return '';
    }
  };

  // Hàm chuyển đổi dữ liệu thành text để tóm tắt (sử dụng filteredData)
  const formatContentForSummary = (data: PlanResponse[], contentType: string): string => {
    switch (contentType) {
      case 'SWOT':
        return data.map(item => {
          const swot = item.swot || [];
          const strengths = swot.filter((s: any) => s.type === 'strengths').map((s: any) => s.description).join(', ');
          const weaknesses = swot.filter((s: any) => s.type === 'weaknesses').map((s: any) => s.description).join(', ');
          const opportunities = swot.filter((s: any) => s.type === 'opportunities').map((s: any) => s.description).join(', ');
          const threats = swot.filter((s: any) => s.type === 'threats').map((s: any) => s.description).join(', ');
          return `${item.unit_name}: Điểm mạnh: ${strengths}. Điểm yếu: ${weaknesses}. Cơ hội: ${opportunities}. Thách thức: ${threats}.`;
        }).join('\n');
      
      case 'BSC':
        return data.map(item => {
          const bsc = item.bsc || [];
          return `${item.unit_name}: ${bsc.map((b: any) => `${b.perspective}: ${b.objective} (KPI: ${b.kpi})`).join('; ')}.`;
        }).join('\n');
      
      case 'Action Plans':
        return data.map(item => {
          const plans = item.action_plans || [];
          return `${item.unit_name}: ${plans.map((p: any) => `${p.plan} (Phụ trách: ${p.lead}, Thời gian: ${p.time}, Ngân sách: ${p.budget})`).join('; ')}.`;
        }).join('\n');
      
      case 'Financial':
        return data.map(item => {
          const ff = item.financial_forecast || {};
          return `${item.unit_name}: Doanh thu: ${ff.revenue || '-'}, Chi phí: ${ff.costs || '-'}, Lợi nhuận: ${ff.profit || '-'}${ff.investment ? `, Đầu tư: ${ff.investment}` : ''}.`;
        }).join('\n');
      
      case 'Professional Orientation':
        return data.map(item => {
          const po = item.professional_orientation || [];
          return `${item.unit_name}: ${po.map((p: any) => `${p.name}: ${p.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'Strategic Products':
        return data.map(item => {
          const sp = item.strategic_products || [];
          return `${item.unit_name}: ${sp.map((p: any) => `${p.name}: ${p.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'New Services 2026':
        return data.map(item => {
          const ns = item.new_services_2026 || [];
          return `${item.unit_name}: ${ns.map((n: any) => `${n.name}: ${n.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'Recruitment':
        return data.map(item => {
          const rec = item.recruitment || [];
          return `${item.unit_name}: ${rec.map((r: any) => `${r.name}: ${r.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'Conferences':
        return data.map(item => {
          const conf = item.conferences || [];
          return `${item.unit_name}: ${conf.map((c: any) => `${c.name}: ${c.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'Community Programs':
        return data.map(item => {
          const cp = item.community_programs || [];
          return `${item.unit_name}: ${cp.map((c: any) => `${c.name}: ${c.detail}`).join('; ')}.`;
        }).join('\n');
      
      case 'Revenue Recommendations':
        return data.map(item => {
          const rr = item.revenue_recommendations || [];
          return `${item.unit_name}: ${rr.map((r: any) => `${r.name}: ${r.detail}`).join('; ')}.`;
        }).join('\n');
      
      default:
        return '';
    }
  };

  // Hàm tóm tắt nội dung bằng AI
  const handleSummarize = async (contentType: string) => {
    const key = contentType;
    
    // Nếu đã có summary, chỉ toggle expanded
    if (summaries[key]?.summary) {
      setSummaries(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          isExpanded: !prev[key].isExpanded,
        },
      }));
      return;
    }

    // Bắt đầu tóm tắt
    setSummaries(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: true,
        fullContent: formatFullContentForDisplay(filteredData, contentType),
      },
    }));

    try {
      const content = formatContentForSummary(filteredData, contentType);
      if (!content || content.trim().length === 0) {
        toast({
          title: 'Không có dữ liệu',
          description: 'Không có dữ liệu để tóm tắt cho phần này.',
          variant: 'destructive',
        });
        setSummaries(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            isLoading: false,
          },
        }));
        return;
      }

      const result = await summarizeContentAction({
        content,
        contentType,
      });

      if (result.success && result.data) {
        setSummaries(prev => ({
          ...prev,
          [key]: {
            summary: result.data.summary,
            fullContent: formatFullContentForDisplay(filteredData, contentType),
            isLoading: false,
            isExpanded: false,
          },
        }));
      } else {
        throw new Error(result.message || 'Không thể tóm tắt');
      }
    } catch (error: any) {
      console.error('Error summarizing:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tóm tắt nội dung. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setSummaries(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          isLoading: false,
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadData}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về trang chủ
          </Button>
        </Link>
        <Button onClick={loadData} variant="outline" size="sm">
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc đơn vị */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lọc theo đơn vị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="unit-filter" className="whitespace-nowrap">
              Chọn đơn vị:
            </Label>
            <Select value={selectedUnit} onValueChange={handleUnitFilterChange}>
              <SelectTrigger id="unit-filter" className="w-[300px]">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {unitNames.map((unitName) => (
                  <SelectItem key={unitName} value={unitName}>
                    {unitName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUnit !== 'all' && (
              <Badge variant="secondary" className="ml-auto">
                Đang lọc: {selectedUnit}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thống kê tổng quan */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số đơn vị</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">đơn vị đã gửi kế hoạch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn vị cam kết</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{committedUnits}</div>
            <p className="text-xs text-muted-foreground">
              {totalUnits > 0 ? Math.round((committedUnits / totalUnits) * 100) : 0}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">dự kiến năm 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách đơn vị */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách đơn vị</CardTitle>
              <CardDescription>
                Danh sách tất cả các đơn vị đã điền và gửi kế hoạch
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
            >
              {isTableExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Mở rộng
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isTableExpanded && (
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Chưa có đơn vị nào gửi kế hoạch
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('unit_name')}
                          className="flex items-center hover:text-foreground"
                        >
                          Tên đơn vị
                          <SortIcon field="unit_name" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('unit_leader')}
                          className="flex items-center hover:text-foreground"
                        >
                          Người lãnh đạo
                          <SortIcon field="unit_leader" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('revenue')}
                          className="flex items-center hover:text-foreground"
                        >
                          Tổng doanh thu
                          <SortIcon field="revenue" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center hover:text-foreground"
                        >
                          Ngày gửi
                          <SortIcon field="created_at" />
                        </button>
                      </TableHead>
                      <TableHead>Cam kết</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.unit_name}</TableCell>
                        <TableCell>{item.unit_leader}</TableCell>
                        <TableCell>{formatCurrency(getRevenueValue(item))}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          {item.commitment ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Có
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" />
                              Không
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Các card tóm tắt */}
      {data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* SWOT Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phân tích SWOT</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('SWOT')}
                  disabled={summaries['SWOT']?.isLoading}
                >
                  {summaries['SWOT']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['SWOT']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['SWOT']?.summary && (
                <div className="space-y-2">
                  {summaries['SWOT'].isExpanded && summaries['SWOT'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['SWOT'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['SWOT'].summary}
                    </p>
                  )}
                  {summaries['SWOT'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('SWOT')}
                    >
                      {summaries['SWOT'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['SWOT']?.summary && !summaries['SWOT']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt nội dung SWOT từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* BSC Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mục tiêu BSC</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('BSC')}
                  disabled={summaries['BSC']?.isLoading}
                >
                  {summaries['BSC']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['BSC']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['BSC']?.summary && (
                <div className="space-y-2">
                  {summaries['BSC'].isExpanded && summaries['BSC'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['BSC'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['BSC'].summary}
                    </p>
                  )}
                  {summaries['BSC'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('BSC')}
                    >
                      {summaries['BSC'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['BSC']?.summary && !summaries['BSC']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt mục tiêu BSC từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Plans Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kế hoạch hành động</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Action Plans')}
                  disabled={summaries['Action Plans']?.isLoading}
                >
                  {summaries['Action Plans']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Action Plans']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Action Plans']?.summary && (
                <div className="space-y-2">
                  {summaries['Action Plans'].isExpanded && summaries['Action Plans'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Action Plans'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Action Plans'].summary}
                    </p>
                  )}
                  {summaries['Action Plans'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Action Plans')}
                    >
                      {summaries['Action Plans'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Action Plans']?.summary && !summaries['Action Plans']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt kế hoạch hành động từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dự báo tài chính</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Financial')}
                  disabled={summaries['Financial']?.isLoading}
                >
                  {summaries['Financial']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Financial']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Financial']?.summary && (
                <div className="space-y-2">
                  {summaries['Financial'].isExpanded && summaries['Financial'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Financial'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Financial'].summary}
                    </p>
                  )}
                  {summaries['Financial'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Financial')}
                    >
                      {summaries['Financial'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Financial']?.summary && !summaries['Financial']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt dự báo tài chính từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Professional Orientation Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Định hướng chuyên môn</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Professional Orientation')}
                  disabled={summaries['Professional Orientation']?.isLoading}
                >
                  {summaries['Professional Orientation']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Professional Orientation']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Professional Orientation']?.summary && (
                <div className="space-y-2">
                  {summaries['Professional Orientation'].isExpanded && summaries['Professional Orientation'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Professional Orientation'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Professional Orientation'].summary}
                    </p>
                  )}
                  {summaries['Professional Orientation'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Professional Orientation')}
                    >
                      {summaries['Professional Orientation'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Professional Orientation']?.summary && !summaries['Professional Orientation']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt định hướng chuyên môn từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Strategic Products Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sản phẩm chiến lược</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Strategic Products')}
                  disabled={summaries['Strategic Products']?.isLoading}
                >
                  {summaries['Strategic Products']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Strategic Products']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Strategic Products']?.summary && (
                <div className="space-y-2">
                  {summaries['Strategic Products'].isExpanded && summaries['Strategic Products'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Strategic Products'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Strategic Products'].summary}
                    </p>
                  )}
                  {summaries['Strategic Products'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Strategic Products')}
                    >
                      {summaries['Strategic Products'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Strategic Products']?.summary && !summaries['Strategic Products']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt sản phẩm chiến lược từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* New Services 2026 Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dịch vụ mới 2026</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('New Services 2026')}
                  disabled={summaries['New Services 2026']?.isLoading}
                >
                  {summaries['New Services 2026']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['New Services 2026']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['New Services 2026']?.summary && (
                <div className="space-y-2">
                  {summaries['New Services 2026'].isExpanded && summaries['New Services 2026'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['New Services 2026'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['New Services 2026'].summary}
                    </p>
                  )}
                  {summaries['New Services 2026'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('New Services 2026')}
                    >
                      {summaries['New Services 2026'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['New Services 2026']?.summary && !summaries['New Services 2026']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt dịch vụ mới 2026 từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recruitment Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tuyển dụng</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Recruitment')}
                  disabled={summaries['Recruitment']?.isLoading}
                >
                  {summaries['Recruitment']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Recruitment']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Recruitment']?.summary && (
                <div className="space-y-2">
                  {summaries['Recruitment'].isExpanded && summaries['Recruitment'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Recruitment'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Recruitment'].summary}
                    </p>
                  )}
                  {summaries['Recruitment'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Recruitment')}
                    >
                      {summaries['Recruitment'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Recruitment']?.summary && !summaries['Recruitment']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt kế hoạch tuyển dụng từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Conferences Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hội nghị hội thảo</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Conferences')}
                  disabled={summaries['Conferences']?.isLoading}
                >
                  {summaries['Conferences']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Conferences']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Conferences']?.summary && (
                <div className="space-y-2">
                  {summaries['Conferences'].isExpanded && summaries['Conferences'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Conferences'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Conferences'].summary}
                    </p>
                  )}
                  {summaries['Conferences'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Conferences')}
                    >
                      {summaries['Conferences'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Conferences']?.summary && !summaries['Conferences']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt kế hoạch hội nghị hội thảo từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Community Programs Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chương trình cộng đồng</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Community Programs')}
                  disabled={summaries['Community Programs']?.isLoading}
                >
                  {summaries['Community Programs']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Community Programs']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Community Programs']?.summary && (
                <div className="space-y-2">
                  {summaries['Community Programs'].isExpanded && summaries['Community Programs'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Community Programs'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Community Programs'].summary}
                    </p>
                  )}
                  {summaries['Community Programs'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Community Programs')}
                    >
                      {summaries['Community Programs'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Community Programs']?.summary && !summaries['Community Programs']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt chương trình cộng đồng từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Revenue Recommendations Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kiến nghị và đề xuất</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize('Revenue Recommendations')}
                  disabled={summaries['Revenue Recommendations']?.isLoading}
                >
                  {summaries['Revenue Recommendations']?.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {summaries['Revenue Recommendations']?.summary ? 'Đọc tóm tắt' : 'Tóm tắt bằng AI'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaries['Revenue Recommendations']?.summary && (
                <div className="space-y-2">
                  {summaries['Revenue Recommendations'].isExpanded && summaries['Revenue Recommendations'].fullContent ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {summaries['Revenue Recommendations'].fullContent}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {summaries['Revenue Recommendations'].summary}
                    </p>
                  )}
                  {summaries['Revenue Recommendations'].fullContent && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSummarize('Revenue Recommendations')}
                    >
                      {summaries['Revenue Recommendations'].isExpanded ? 'Thu gọn' : 'Đọc toàn bộ'}
                    </Button>
                  )}
                </div>
              )}
              {!summaries['Revenue Recommendations']?.summary && !summaries['Revenue Recommendations']?.isLoading && (
                <p className="text-sm text-muted-foreground">
                  Nhấn nút "Tóm tắt bằng AI" để xem tóm tắt kiến nghị và đề xuất từ tất cả các đơn vị.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog xem chi tiết */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết kế hoạch - {selectedItem?.unit_name}</DialogTitle>
            <DialogDescription>
              Ngày gửi: {selectedItem && formatDate(selectedItem.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="swot">SWOT</TabsTrigger>
                  <TabsTrigger value="bsc">BSC</TabsTrigger>
                  <TabsTrigger value="actions">Hành động</TabsTrigger>
                  <TabsTrigger value="financial">Tài chính</TabsTrigger>
                  <TabsTrigger value="other">Khác</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Thông tin đơn vị</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tên đơn vị:</strong> {selectedItem.unit_name}</p>
                        <p><strong>Loại đơn vị:</strong> {selectedItem.unit_type || '-'}</p>
                        <p><strong>Người lãnh đạo:</strong> {selectedItem.unit_leader}</p>
                        <p><strong>Người lập kế hoạch:</strong> {selectedItem.planner || '-'}</p>
                        <p><strong>Cam kết:</strong> {selectedItem.commitment ? 'Có' : 'Không'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="swot" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Điểm mạnh</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedItem.swot
                          ?.filter((item: any) => item.type === 'strengths')
                          .map((item: any, idx: number) => (
                            <li key={idx}>{item.description}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Điểm yếu</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedItem.swot
                          ?.filter((item: any) => item.type === 'weaknesses')
                          .map((item: any, idx: number) => (
                            <li key={idx}>{item.description}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-600">Cơ hội</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedItem.swot
                          ?.filter((item: any) => item.type === 'opportunities')
                          .map((item: any, idx: number) => (
                            <li key={idx}>{item.description}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-orange-600">Thách thức</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedItem.swot
                          ?.filter((item: any) => item.type === 'threats')
                          .map((item: any, idx: number) => (
                            <li key={idx}>{item.description}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bsc" className="space-y-4">
                  <div className="grid gap-4">
                    {['financial', 'customer', 'internal', 'learning'].map((perspective) => {
                      const items = selectedItem.bsc?.filter(
                        (item: any) => item.perspective === perspective
                      ) || [];
                      const labels: Record<string, string> = {
                        financial: 'Tài chính',
                        customer: 'Khách hàng',
                        internal: 'Quy trình nội bộ',
                        learning: 'Học tập và phát triển',
                      };
                      return (
                        <div key={perspective}>
                          <h4 className="font-semibold mb-2">{labels[perspective]}</h4>
                          <div className="space-y-2">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="border rounded p-3 text-sm">
                                <p><strong>Mục tiêu:</strong> {item.objective}</p>
                                <p><strong>KPI:</strong> {item.kpi}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-3">
                    {selectedItem.action_plans?.map((plan: any, idx: number) => (
                      <div key={idx} className="border rounded p-4">
                        <h4 className="font-semibold mb-2">Kế hoạch {idx + 1}</h4>
                        <div className="grid gap-2 text-sm">
                          <p><strong>Nội dung:</strong> {plan.plan}</p>
                          <p><strong>Người phụ trách:</strong> {plan.lead}</p>
                          <p><strong>Thời gian:</strong> {plan.time}</p>
                          <p><strong>Ngân sách:</strong> {plan.budget}</p>
                          <p><strong>KPI:</strong> {plan.kpi}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Dự báo tài chính</h4>
                      <div className="grid gap-2 text-sm">
                        <p><strong>Doanh thu:</strong> {selectedItem.financial_forecast?.revenue || '-'}</p>
                        <p><strong>Chi phí:</strong> {selectedItem.financial_forecast?.costs || '-'}</p>
                        <p><strong>Lợi nhuận:</strong> {selectedItem.financial_forecast?.profit || '-'}</p>
                        {selectedItem.financial_forecast?.investment && (
                          <p><strong>Đầu tư:</strong> {selectedItem.financial_forecast.investment}</p>
                        )}
                      </div>
                    </div>
                    {selectedItem.financial_forecast?.attachment && (
                      <div>
                        <h4 className="font-semibold mb-2">File đính kèm</h4>
                        <div className="space-y-2">
                          {Array.isArray(selectedItem.financial_forecast.attachment) ? (
                            selectedItem.financial_forecast.attachment.map((file: any, idx: number) => (
                              <a
                                key={idx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {file.name || `File ${idx + 1}`}
                              </a>
                            ))
                          ) : (
                            <a
                              href={selectedItem.financial_forecast.attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {selectedItem.financial_forecast.attachment.name || 'File đính kèm'}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="other" className="space-y-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedItem.professional_orientation && (
                        <div>
                          <h4 className="font-semibold mb-2">Định hướng chuyên môn</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.professional_orientation.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.strategic_products && (
                        <div>
                          <h4 className="font-semibold mb-2">Sản phẩm chiến lược</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.strategic_products.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.new_services_2026 && (
                        <div>
                          <h4 className="font-semibold mb-2">Dịch vụ mới 2026</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.new_services_2026.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.recruitment && (
                        <div>
                          <h4 className="font-semibold mb-2">Tuyển dụng</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.recruitment.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.conferences && (
                        <div>
                          <h4 className="font-semibold mb-2">Hội nghị hội thảo</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.conferences.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.community_programs && (
                        <div>
                          <h4 className="font-semibold mb-2">Chương trình cộng đồng</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.community_programs.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.revenue_recommendations && (
                        <div>
                          <h4 className="font-semibold mb-2">Kiến nghị và đề xuất</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedItem.revenue_recommendations.map((item: any, idx: number) => (
                              <li key={idx}>
                                <strong>{item.name}:</strong> {item.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

