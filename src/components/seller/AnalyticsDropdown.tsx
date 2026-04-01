import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart3, TrendingUp, DollarSign, Star, FileText, Receipt } from "lucide-react";

interface AnalyticsDropdownProps {
  onSelectReport: (reportType: string, timeframe?: string) => void;
}

export function AnalyticsDropdown({ onSelectReport }: AnalyticsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
          <span className="inline sm:hidden">Reports</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Sales Report */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Sales Report</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onSelectReport("sales", "daily")}>Daily Sales</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("sales", "weekly")}>Weekly Sales</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("sales", "monthly")}>Monthly Sales</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Gain and Losses */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Gain & Losses</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "daily")}>Daily View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "weekly")}>Weekly View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "monthly")}>Monthly View</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Costs and Expenses */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Costs & Expenses</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onSelectReport("expenses", "daily")}>Daily Breakdown</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("expenses", "weekly")}>Weekly Breakdown</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("expenses", "monthly")}>Monthly Breakdown</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Reviews */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Star className="h-4 w-4" />
            <span>Reviews</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onSelectReport("reviews", "positive")}>Positive Reviews</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("reviews", "negative")}>Negative Reviews</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectReport("reviews", "neutral")}>Neutral Reviews</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSelectReport("reviews", "all")}>All Reviews Summary</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Invoices */}
        <DropdownMenuItem onClick={() => onSelectReport("invoices")} className="gap-2">
          <Receipt className="h-4 w-4" />
          <span>Invoices</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
