import { useState } from "react";
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
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  FileText,
  Download,
  Printer,
  Receipt,
  Lock,
} from "lucide-react";

interface AnalyticsDropdownProps {
  onSelectReport: (reportType: string, timeframe?: string) => void;
  isPro: boolean;
}

export function AnalyticsDropdown({ onSelectReport, isPro }: AnalyticsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
          <span className="inline sm:hidden">Reports</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!isPro && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Detailed reports require PRO
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Sales Report */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`gap-2 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <FileText className="h-4 w-4" />
            <span>Sales Report</span>
            {!isPro && <Lock className="h-3 w-3 ml-auto" />}
          </DropdownMenuSubTrigger>
          {isPro && (
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSelectReport("sales", "daily")}>
                Daily Sales
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("sales", "weekly")}>
                Weekly Sales
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("sales", "monthly")}>
                Monthly Sales
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          )}
        </DropdownMenuSub>

        {/* Gain and Losses */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`gap-2 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <TrendingUp className="h-4 w-4" />
            <span>Gain & Losses</span>
            {!isPro && <Lock className="h-3 w-3 ml-auto" />}
          </DropdownMenuSubTrigger>
          {isPro && (
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "daily")}>
                Daily View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "weekly")}>
                Weekly View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("gainLoss", "monthly")}>
                Monthly View
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          )}
        </DropdownMenuSub>

        {/* Costs and Expenses */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`gap-2 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <DollarSign className="h-4 w-4" />
            <span>Costs & Expenses</span>
            {!isPro && <Lock className="h-3 w-3 ml-auto" />}
          </DropdownMenuSubTrigger>
          {isPro && (
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSelectReport("expenses", "daily")}>
                Daily Breakdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("expenses", "weekly")}>
                Weekly Breakdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("expenses", "monthly")}>
                Monthly Breakdown
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          )}
        </DropdownMenuSub>

        {/* Reviews */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`gap-2 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <Star className="h-4 w-4" />
            <span>Reviews</span>
            {!isPro && <Lock className="h-3 w-3 ml-auto" />}
          </DropdownMenuSubTrigger>
          {isPro && (
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSelectReport("reviews", "positive")}>
                Positive Reviews
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("reviews", "negative")}>
                Negative Reviews
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectReport("reviews", "neutral")}>
                Neutral Reviews
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSelectReport("reviews", "all")}>
                All Reviews Summary
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          )}
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Invoices */}
        <DropdownMenuItem 
          onClick={() => isPro && onSelectReport("invoices")} 
          className={`gap-2 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Receipt className="h-4 w-4" />
          <span>Invoices</span>
          {!isPro && <Lock className="h-3 w-3 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
