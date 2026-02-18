import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SalesReport } from "./SalesReport";
import { GainAndLosses } from "./GainAndLosses";
import { CostsAndExpenses } from "./CostsAndExpenses";
import { ReviewsAnalytics } from "./ReviewsAnalytics";
import { Invoices } from "./Invoices";
import { X } from "lucide-react";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: string;
  timeframe?: string;
}

export function AnalyticsModal({
  isOpen,
  onClose,
  reportType = "sales",
  timeframe = "monthly",
}: AnalyticsModalProps) {
  const getReportComponent = () => {
    switch (reportType) {
      case "sales":
        return <SalesReport timeframe={timeframe as "daily" | "weekly" | "monthly"} />;
      case "gainLoss":
        return <GainAndLosses timeframe={timeframe as "daily" | "weekly" | "monthly"} />;
      case "expenses":
        return <CostsAndExpenses timeframe={timeframe as "daily" | "weekly" | "monthly"} />;
      case "reviews":
        return <ReviewsAnalytics reviewType={timeframe as "positive" | "negative" | "neutral" | "all"} />;
      case "invoices":
        return <Invoices />;
      default:
        return <SalesReport timeframe={timeframe as "daily" | "weekly" | "monthly"} />;
    }
  };

  const getTitle = () => {
    switch (reportType) {
      case "sales":
        return "Sales Report";
      case "gainLoss":
        return "Gain & Losses Report";
      case "expenses":
        return "Costs & Expenses Report";
      case "reviews":
        return "Reviews Analytics";
      case "invoices":
        return "Invoices";
      default:
        return "Analytics Report";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl md:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{getTitle()}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-6">
            {getReportComponent()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
