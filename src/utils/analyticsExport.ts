// Utility functions for printing and downloading analytics reports

export interface PrintableData {
  title: string;
  subtitle?: string;
  generatedDate: string;
  data: Record<string, unknown>;
  summary?: Record<string, unknown>;
}

export const generatePDF = async (
  htmlContent: string,
  filename: string = "analytics-report.pdf"
) => {
  // This uses the browser's built-in print functionality
  const printWindow = window.open("", "", "width=900,height=700");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .summary-item { display: inline-block; margin-right: 30px; margin-bottom: 10px; }
          .summary-label { font-weight: bold; color: #666; }
          .summary-value { font-size: 18px; color: #333; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.print();
          setTimeout(() => window.close(), 500);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const downloadAsCSV = (
  data: Array<Record<string, unknown>>,
  filename: string = "analytics-report.csv"
) => {
  if (!data || data.length === 0) {
    console.error("No data to download");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAsJSON = (
  data: Record<string, unknown>,
  filename: string = "analytics-report.json"
) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateHTMLReport = (
  title: string,
  data: PrintableData
): string => {
  const generateDate = new Date(data.generatedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let summaryHTML = "";
  if (data.summary) {
    summaryHTML = `
      <div class="summary">
        <h3>Summary</h3>
        ${Object.entries(data.summary)
          .map(
            ([key, value]) => `
          <div class="summary-item">
            <div class="summary-label">${key}</div>
            <div class="summary-value">${
              typeof value === "number" && value > 1000
                ? `₦${(value / 1000).toFixed(0)}k`
                : value
            }</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  return `
    <div class="header">
      <h1>${title}</h1>
      ${data.subtitle ? `<p style="color: #666; font-size: 14px;">${data.subtitle}</p>` : ""}
      <p style="color: #999; font-size: 12px;">Generated on ${generateDate}</p>
    </div>
    ${summaryHTML}
    <div class="content">
      ${JSON.stringify(data.data, null, 2)}
    </div>
  `;
};

export const formatNairaForExport = (value: number): string => {
  return `₦${(value / 1000).toFixed(0)}k`;
};

export const generateTimestamp = (): string => {
  return new Date().toISOString().slice(0, -5);
};
