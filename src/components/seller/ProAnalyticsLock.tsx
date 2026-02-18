import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Zap, ChevronRight } from "lucide-react";

interface ProAnalyticsLockProps {
  title?: string;
  description?: string;
}

export function ProAnalyticsLock({
  title = "Analytics Available for PRO Accounts",
  description = "Upgrade to PRO to unlock advanced analytics, interactive reports, revenue tracking, and detailed business insights.",
}: ProAnalyticsLockProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <Zap className="h-5 w-5 text-amber-500 absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs w-full max-w-sm pt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Interactive charts
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Revenue tracking
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Sales analytics
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Print & export reports
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Customer insights
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
            Free analytics
          </div>
        </div>

        <Button 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 mt-4 gap-2"
        >
          <Zap className="h-4 w-4" />
          Upgrade to PRO
        </Button>
        
        <p className="text-xs text-muted-foreground">
          PRO accounts get free, unlimited analytics. <br/>
          Standard accounts get basic reports.
        </p>
      </CardContent>
    </Card>
  );
}
