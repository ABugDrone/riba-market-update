import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira } from "@/data/mock";
import { mockInvoices, type Invoice } from "@/data/invoicesData";
import { downloadAsCSV, generatePDF } from "@/utils/analyticsExport";
import { Download, Printer, Eye, Search, X } from "lucide-react";

interface InvoicesProps {
  timeframe?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  returned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const statusIcons: Record<string, string> = {
  pending: "⏳",
  delivered: "✓",
  returned: "↩️",
};

export function Invoices({ timeframe }: InvoicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);

  // Filter and search invoices
  const filteredInvoices = useMemo(() => {
    let items = [...mockInvoices];

    // Apply status filter
    if (statusFilter !== "all") {
      items = items.filter((inv) => inv.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((inv) =>
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.customerName.toLowerCase().includes(query) ||
        inv.customerEmail.toLowerCase().includes(query) ||
        inv.customerPhone.toLowerCase().includes(query) ||
        inv.date.includes(query) ||
        inv.items.some((item) => item.productId.toLowerCase().includes(query))
      );
    }

    return items;
  }, [searchQuery, statusFilter]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const delivered = filteredInvoices.filter((inv) => inv.status === "delivered");
    const pending = filteredInvoices.filter((inv) => inv.status === "pending");
    const returned = filteredInvoices.filter((inv) => inv.status === "returned");

    return {
      totalInvoices: filteredInvoices.length,
      deliveredCount: delivered.length,
      pendingCount: pending.length,
      returnedCount: returned.length,
      totalRevenue: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
      deliveredRevenue: delivered.reduce((sum, inv) => sum + inv.total, 0),
    };
  }, [filteredInvoices]);

  const handlePrint = () => {
    const htmlContent = `
      <div class="header">
        <h1>Invoices Report</h1>
        <p style="color: #999; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="summary">
        <h3>Summary</h3>
        <div class="summary-item">
          <div class="summary-label">Total Invoices</div>
          <div class="summary-value">${summary.totalInvoices}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">${formatNaira(summary.totalRevenue)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Delivered</div>
          <div class="summary-value">${summary.deliveredCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Pending</div>
          <div class="summary-value">${summary.pendingCount}</div>
        </div>
      </div>
      <h3>Invoices</h3>
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredInvoices
            .map(
              (inv) => `
            <tr>
              <td>${inv.invoiceNumber}</td>
              <td>${inv.customerName}</td>
              <td>${inv.customerEmail}</td>
              <td>${inv.customerPhone}</td>
              <td>${inv.date}</td>
              <td>${formatNaira(inv.total)}</td>
              <td>${inv.status}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    generatePDF(htmlContent, "invoices-report.pdf");
  };

  const handleDownloadCSV = () => {
    const csvData = filteredInvoices.map((inv) => ({
      "Invoice Number": inv.invoiceNumber,
      "Customer Name": inv.customerName,
      "Email": inv.customerEmail,
      "Phone": inv.customerPhone,
      "Date": inv.date,
      "Total": formatNaira(inv.total),
      "Status": inv.status,
      "Items": inv.items.map((item) => `${item.productName} (x${item.quantity})`).join("; "),
    }));
    downloadAsCSV(csvData as unknown as Array<Record<string, unknown>>, "invoices-report.csv");
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-primary">{summary.totalInvoices}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{summary.deliveredCount}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/30 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">{formatNaira(summary.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Product ID, Invoice #, Customer Name, Email, Phone, or Date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No invoices found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{invoice.customerEmail}</TableCell>
                      <TableCell className="text-sm">{invoice.customerPhone}</TableCell>
                      <TableCell className="text-sm">{invoice.date}</TableCell>
                      <TableCell className="text-sm">
                        {invoice.items.length} item(s)
                      </TableCell>
                      <TableCell className="font-bold text-primary">{formatNaira(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {statusIcons[invoice.status]} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewInvoice(invoice)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogClose />
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-muted-foreground">{selectedInvoice.customerEmail}</p>
                    <p className="text-muted-foreground">{selectedInvoice.customerPhone}</p>
                    <p className="text-muted-foreground mt-2">{selectedInvoice.deliveryAddress}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Invoice Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{selectedInvoice.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{selectedInvoice.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={statusColors[selectedInvoice.status]}>
                        {statusIcons[selectedInvoice.status]} {selectedInvoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{item.productName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.productId}</TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{formatNaira(item.price)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatNaira(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="space-y-2 border-t pt-4 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatNaira(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (12%):</span>
                  <span className="font-medium">{formatNaira(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">{formatNaira(selectedInvoice.shippingCost)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-base font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatNaira(selectedInvoice.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <p className="font-semibold mb-1">Notes:</p>
                  <p className="text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
