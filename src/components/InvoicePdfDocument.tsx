import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type InvoicePdfItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoicePdfDocumentData = {
  invoiceNo: string;
  createdAt: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  advanceAmount: number;
  status: string;
  client: {
    companyName: string;
    name: string;
    email: string;
    address: string | null;
  };
  items: InvoicePdfItem[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingHorizontal: 42,
    paddingBottom: 52,
    color: "#1e293b",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 18,
  },
  invoiceTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    letterSpacing: 1.5,
  },
  invoiceNumber: {
    marginTop: 6,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },
  company: {
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  companyAddress: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 8,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 28,
  },
  detailColumn: {
    width: "48%",
  },
  detailColumnRight: {
    width: "36%",
    alignItems: "flex-end",
  },
  sectionLabel: {
    color: "#64748b",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 7,
  },
  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 4,
  },
  mutedText: {
    color: "#64748b",
    fontSize: 9,
    lineHeight: 1.45,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 7,
  },
  dateLabel: {
    color: "#64748b",
    fontSize: 9,
  },
  dateValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    paddingVertical: 9,
    paddingHorizontal: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 11,
    paddingHorizontal: 8,
  },
  description: { width: "52%" },
  quantity: { width: "12%", textAlign: "center" },
  rate: { width: "18%", textAlign: "right" },
  amount: { width: "18%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  summary: {
    width: "44%",
    marginLeft: "auto",
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    color: "#475569",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderTopColor: "#1e293b",
    marginTop: 4,
    paddingTop: 10,
    paddingBottom: 7,
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: "#1e293b",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    marginTop: 3,
    paddingTop: 8,
    fontFamily: "Helvetica-Bold",
  },
  statusBox: {
    marginTop: 26,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  statusTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 4,
  },
  statusText: {
    color: "#64748b",
    fontSize: 9,
  },
  paidStatus: { color: "#047857" },
  overdueStatus: { color: "#b91c1c" },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 23,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: 8,
  },
});

function formatAmount(amount: number) {
  return `Rs. ${amount.toFixed(2)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function statusMessage(status: string) {
  if (status === "PAID") return "Payment received in full. Thank you for your business.";
  if (status === "OVERDUE") return "This invoice is overdue. Please arrange payment at the earliest.";
  if (status === "CANCELLED") return "This invoice has been cancelled.";
  return "Please make payment by the due date. Thank you for your business.";
}

export default function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfDocumentData }) {
  const balance = Math.max(0, invoice.grandTotal - invoice.advanceAmount);
  const statusLabel = invoice.status.replace(/_/g, " ");

  return (
    <Document
      title={`Invoice ${invoice.invoiceNo}`}
      author="Enclecta Inc."
      subject={`Invoice for ${invoice.client.companyName}`}
      creator="Enclecta"
      language="en-IN"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.company}>
            <Text style={styles.companyName}>Enclecta Inc.</Text>
            <Text style={styles.companyAddress}>123 Tech Boulevard, Suite 400</Text>
            <Text style={styles.companyAddress}>San Francisco, CA 94105</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailColumn}>
            <Text style={styles.sectionLabel}>BILLED TO</Text>
            <Text style={styles.clientName}>{invoice.client.companyName}</Text>
            <Text style={styles.mutedText}>{invoice.client.name}</Text>
            <Text style={styles.mutedText}>{invoice.client.email}</Text>
            {invoice.client.address ? <Text style={styles.mutedText}>{invoice.client.address}</Text> : null}
          </View>
          <View style={styles.detailColumnRight}>
            <Text style={styles.sectionLabel}>INVOICE DETAILS</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Issue date</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due date</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.description}>DESCRIPTION</Text>
            <Text style={styles.quantity}>QTY</Text>
            <Text style={styles.rate}>RATE</Text>
            <Text style={styles.amount}>AMOUNT</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={styles.tableRow} wrap={false}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.rate}>{formatAmount(item.rate)}</Text>
              <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary} wrap={false}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{formatAmount(invoice.subtotal)}</Text>
          </View>
          {invoice.tax > 0 ? (
            <View style={styles.summaryRow}>
              <Text>Tax</Text>
              <Text>{formatAmount(invoice.tax)}</Text>
            </View>
          ) : null}
          {invoice.discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text>Discount</Text>
              <Text>- {formatAmount(invoice.discount)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text>Grand Total</Text>
            <Text>{formatAmount(invoice.grandTotal)}</Text>
          </View>
          {invoice.advanceAmount > 0 ? (
            <>
              <View style={styles.summaryRow}>
                <Text>Advance paid</Text>
                <Text>{formatAmount(invoice.advanceAmount)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>Balance due</Text>
                <Text>{formatAmount(balance)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.statusBox} wrap={false}>
          <Text
            style={
              invoice.status === "PAID"
                ? [styles.statusTitle, styles.paidStatus]
                : invoice.status === "OVERDUE"
                  ? [styles.statusTitle, styles.overdueStatus]
                  : styles.statusTitle
            }
          >
            STATUS: {statusLabel}
          </Text>
          <Text style={styles.statusText}>{statusMessage(invoice.status)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by Enclecta</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
