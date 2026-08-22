"use client"
import type { Invoice } from "@/types/invoice";
import type { Customer } from "@/types/customer";
import { Printer, ArrowLeft } from "lucide-react";

interface InvoicePrintProps {
  invoice: Invoice;
  customer: Customer | null;
  onBack?: () => void;
}

const COMPANY = {
  name: "Narayan Aluminium",
  address: "Bai Pass Road, Rewara Paraspur",
  city: "S.R.N. Bhadohi - 221401",
  phone: "7068207777",
  gstin: "09AOCPY4652E1ZO",
  state: "Uttar Pradesh",
  stateCode: "09",
  email: "narayanalu.123@gmail.com",
};

/* ----------------------------------------
   Formatting helpers
----------------------------------------- */

function money(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function quantity(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

/* ----------------------------------------
   Indian numbering system for words
----------------------------------------- */

function numberToWords(num: number): string {
  if (!Number.isFinite(num) || num < 0) {
    return "";
  }

  num = Math.round(num);

  if (num === 0) {
    return "Zero";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function belowThousand(n: number): string {
    let result = "";

    if (n >= 100) {
      result += `${ones[Math.floor(n / 100)]} Hundred`;
      n %= 100;

      if (n > 0) {
        result += " ";
      }
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;

      if (n > 0) {
        result += ` ${ones[n]}`;
      }
    } else if (n > 0) {
      result += ones[n];
    }

    return result;
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) {
    result += `${belowThousand(crore)} Crore`;
  }

  if (lakh > 0) {
    if (result) result += " ";
    result += `${belowThousand(lakh)} Lakh`;
  }

  if (thousand > 0) {
    if (result) result += " ";
    result += `${belowThousand(thousand)} Thousand`;
  }

  if (num > 0) {
    if (result) result += " ";
    result += belowThousand(num);
  }

  return result;
}

function amountInWords(amount: number): string {
  const rounded = Math.round(amount);
  return `INR ${numberToWords(rounded)} Only`;
}

/* ----------------------------------------
   Reusable Tailwind classes
----------------------------------------- */

const CELL = "border border-black px-1.5 py-1 align-top";
const CENTER = "text-center";
const RIGHT = "text-right";

/* ----------------------------------------
   Component
----------------------------------------- */

export default function InvoicePrint({
  invoice,
  customer,
  onBack,
}: InvoicePrintProps) {
  const items = invoice.items ?? [];

  const totalTax =
    Number(invoice.cgst_amount ?? 0) +
    Number(invoice.sgst_amount ?? 0) +
    Number(invoice.igst_amount ?? 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      {/* =========================================
         ACTION BAR (Hidden on Print)
      ========================================== */}
      <div className="mx-auto mb-6 flex w-[190mm] items-center justify-between print:hidden">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Printer className="h-4 w-4" /> Print Invoice / Save PDF
        </button>
      </div>

      {/* =========================================
         INVOICE SHEET CONTAINER
      ========================================== */}
      <div
        className="
          mx-auto
          w-[190mm]
          min-h-[277mm]
          bg-white
          p-2
          text-black
          font-sans
          text-[12px]
          leading-tight
          shadow-lg
          print:shadow-none
          print:p-0
        "
      >
        {/* Title */}
        <div className="relative mb-1 text-center">
          <h1 className="text-[15px] font-bold uppercase tracking-wide">
            Tax Invoice
          </h1>
          <span className="absolute right-0 top-0 text-[9px] italic text-slate-600">
            (ORIGINAL FOR RECIPIENT)
          </span>
        </div>

        {/* =========================================
           SELLER + INVOICE INFORMATION
        ========================================== */}
        <table className="w-full border-collapse">
          <tbody>
            {/* Row 1 */}
            <tr>
              <td rowSpan={8} className={`${CELL} w-[50%]`}>
                <div className="text-[12px] font-bold text-slate-900">
                  {COMPANY.name}
                </div>
                <div className="mt-0.5">{COMPANY.address}</div>
                <div>{COMPANY.city}</div>
                <div>Mo :- {COMPANY.phone}</div>
                <div>GSTIN/UIN: {COMPANY.gstin}</div>
                <div>
                  State Name : {COMPANY.state}, Code : {COMPANY.stateCode}
                </div>
                <div>E-Mail : {COMPANY.email}</div>
              </td>

              <td className={`${CELL} w-[25%]`}>
                <div className="flex justify-between text-[10px] text-black">
                  <span>Invoice No.</span>
                  <span>e-Way Bill No.</span>
                </div>
                <div className="mt-0.5 flex min-h-[14px] justify-between font-bold text-[12px]">
                  <span>{invoice.invoice_number}</span>
                  <span className="font-normal">{invoice.eway_bill_number}</span>
                </div>
              </td>

              <td className={`${CELL} w-[25%]`}>
                <div className="text-[10px] text-black">Dated</div>
                <div className="mt-0.5 min-h-[14px] font-bold text-[12px]">
                  {invoice.invoice_date}
                </div>
              </td>
            </tr>

            {/* Row 2 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">Delivery Note</div>
                <div className="mt-0.5 min-h-[14px]">{invoice.delivery_note}</div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Mode/Terms of Payment</div>
                <div className="mt-0.5 min-h-[14px]"></div>
              </td>
            </tr>

            {/* Row 3 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">Supplier&apos;s Ref.</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.supplier_reference}
                </div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Other Reference(s)</div>
                <div className="mt-0.5 min-h-[14px]"></div>
              </td>
            </tr>

            {/* Row 4 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">Buyer&apos;s Order No.</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.buyer_order_number}
                </div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Dated</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.buyer_order_date}
                </div>
              </td>
            </tr>

            {/* Row 5 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">Despatch Document No.</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.dispatch_document_number}
                </div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Delivery Note Date</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.delivery_note_date}
                </div>
              </td>
            </tr>

            {/* Row 6 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">Despatched through</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.dispatched_through}
                </div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Destination</div>
                <div className="mt-0.5 min-h-[14px]">{invoice.destination}</div>
              </td>
            </tr>

            {/* Row 7 */}
            <tr>
              <td className={CELL}>
                <div className="text-[10px] text-black">
                  Bill of Lading/LR-RR No.
                </div>
                <div className="mt-0.5 min-h-[14px]">{invoice.lr_rr_number}</div>
              </td>
              <td className={CELL}>
                <div className="text-[10px] text-black">Motor Vehicle No.</div>
                <div className="mt-0.5 min-h-[14px] font-bold text-[12px]">
                  {invoice.vehicle_number}
                </div>
              </td>
            </tr>

            {/* Row 8 */}
            <tr>
              <td colSpan={2} className={CELL}>
                <div className="text-[10px] text-black">Terms of Delivery</div>
                <div className="mt-0.5 min-h-[14px]">
                  {invoice.terms_of_delivery}
                </div>
              </td>
            </tr>

            {/* =====================================
                BUYER
            ====================================== */}
            <tr>
              <td colSpan={3} className={`${CELL} min-h-[30mm]`}>
                <div className="mb-1 text-[9px] font-semibold uppercase text-slate-600">
                  Buyer (Bill to)
                </div>
                <div className="text-[11px] font-bold">
                  M/s. {customer?.name || "Cash Customer"}
                </div>
                <div className="mt-1 whitespace-pre-line">
                  {customer?.address || ""}
                </div>
                {customer?.gstin_uin && (
                  <div className="mt-0.5 font-medium">
                    GSTIN/UIN : {customer.gstin_uin}
                  </div>
                )}
                <div>
                     State ID : {customer?.state_id ?? "-"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* =========================================
           ITEM TABLE
        ========================================== */}
        <table className="mt-[-1px] w-full border-collapse">
          <thead>
            <tr>
              <th className={`${CELL} ${CENTER} w-[6%]`}>
                Sl
                <br />
                No.
              </th>
              <th className={`${CELL} w-[37%]`}>Description of Goods</th>
              <th className={`${CELL} ${CENTER} w-[12%] `}>HSN/SAC</th>
              <th className={`${CELL} ${RIGHT} w-[13%]`}>Quantity</th>
              <th className={`${CELL} ${RIGHT} w-[10%]`}>Rate</th>
              <th className={`${CELL} ${CENTER} w-[8%]`}>Per</th>
              <th className={`${CELL} ${RIGHT} w-[14%]`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id ?? index} className="min-h-[9mm]">
                <td className={`${CELL} ${CENTER}`}>{index + 1}</td>
                <td className={CELL}>
                  <strong>{item.description || ""}</strong>
                </td>
                <td className={`${CELL} ${CENTER}`}>{item.hsn_sac || ""}</td>
                <td className={`${CELL} ${RIGHT}`}>
                  {quantity(item.quantity)}
                </td>
                <td className={`${CELL} ${RIGHT}`}>{money(item.rate)}</td>
                <td className={`${CELL} ${CENTER}`}>{item.unit || "Nos"}</td>
                <td className={`${CELL} ${RIGHT}`}>
                  <strong>{money(item.amount)}</strong>
                </td>
              </tr>
            ))}

            {/* Flexible blank spacer row to preserve vertical layout */}
            <tr>
              <td
                colSpan={7}
                className="h-[35mm] border-x border-black bg-transparent"
              />
            </tr>

            {/* Taxes & Totals */}
            {Number(invoice.cgst_amount ?? 0) > 0 && (
              <tr>
                <td colSpan={4} className={`${CELL} border-b-0`} />
                <td colSpan={1} className={`${CELL} ${RIGHT} font-semibold`}>
                  CGST
                </td>
                <td className={`${CELL} ${RIGHT}`}>
                  {invoice.cgst_rate ? `${invoice.cgst_rate}%` : ""}
                </td>
                <td className={`${CELL} ${RIGHT}`}>
                  {money(invoice.cgst_amount)}
                </td>
              </tr>
            )}

            {Number(invoice.sgst_amount ?? 0) > 0 && (
              <tr>
                <td colSpan={4} className={`${CELL} border-b-0 border-t-0`} />
                <td className={`${CELL} ${RIGHT} font-semibold`}>SGST</td>
                <td className={`${CELL} ${RIGHT}`}>
                  {invoice.sgst_rate ? `${invoice.sgst_rate}%` : ""}
                </td>
                <td className={`${CELL} ${RIGHT}`}>
                  {money(invoice.sgst_amount)}
                </td>
              </tr>
            )}

            {Number(invoice.igst_amount ?? 0) > 0 && (
              <tr>
                <td colSpan={4} className={`${CELL} border-b-0 border-t-0`} />
                <td className={`${CELL} ${RIGHT} font-semibold`}>IGST</td>
                <td className={`${CELL} ${RIGHT}`}>
                  {invoice.igst_rate ? `${invoice.igst_rate}%` : ""}
                </td>
                <td className={`${CELL} ${RIGHT}`}>
                  {money(invoice.igst_amount)}
                </td>
              </tr>
            )}

            <tr>
              <td colSpan={5} className={`${CELL} ${RIGHT} font-semibold`}>
                Round Off
              </td>
              <td className={CELL} />
              <td className={`${CELL} ${RIGHT}`}>{money(invoice.round_off)}</td>
            </tr>

            <tr>
              <td colSpan={6} className={`${CELL} ${RIGHT} font-bold`}>
                Total
              </td>
              <td className={`${CELL} ${RIGHT} text-[12px] font-bold`}>
                ₹ {money(invoice.grand_total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="mt-[-1px] flex min-h-[10mm] items-center gap-2 border border-t-0 border-black px-1.5 py-1">
          <span>Amount Chargeable (in words):</span>
          <strong className="text-[10px]">
            {amountInWords(Number(invoice.grand_total))}
          </strong>
          <span className="ml-auto italic">E. &amp; O.E</span>
        </div>

        {/* =========================================
           TAX SUMMARY
        ========================================== */}
        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className={`${CELL} ${CENTER}`}>
                HSN/SAC
              </th>
              <th rowSpan={2} className={`${CELL} ${RIGHT}`}>
                Taxable Value
              </th>
              <th colSpan={2} className={`${CELL} ${CENTER}`}>
                Central Tax
              </th>
              <th colSpan={2} className={`${CELL} ${CENTER}`}>
                State Tax
              </th>
              <th rowSpan={2} className={`${CELL} ${RIGHT}`}>
                Total Tax Amount
              </th>
            </tr>
            <tr>
              <th className={`${CELL} ${CENTER}`}>Rate</th>
              <th className={`${CELL} ${RIGHT}`}>Amount</th>
              <th className={`${CELL} ${CENTER}`}>Rate</th>
              <th className={`${CELL} ${RIGHT}`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTax =
                Number(item.cgst_amount ?? 0) +
                Number(item.sgst_amount ?? 0) +
                Number(item.igst_amount ?? 0);

              return (
                <tr key={`tax-${item.id ?? index}`}>
                  <td className={`${CELL} ${CENTER}`}>{item.hsn_sac || ""}</td>
                  <td className={`${CELL} ${RIGHT}`}>{money(item.amount)}</td>
                  <td className={`${CELL} ${CENTER}`}>
                    {item.cgst_rate ? `${item.cgst_rate}%` : ""}
                  </td>
                  <td className={`${CELL} ${RIGHT}`}>
                    {money(item.cgst_amount)}
                  </td>
                  <td className={`${CELL} ${CENTER}`}>
                    {item.sgst_rate ? `${item.sgst_rate}%` : ""}
                  </td>
                  <td className={`${CELL} ${RIGHT}`}>
                    {money(item.sgst_amount)}
                  </td>
                  <td className={`${CELL} ${RIGHT}`}>{money(itemTax)}</td>
                </tr>
              );
            })}

            {/* Tax Total row */}
            <tr>
              <td className={`${CELL} ${RIGHT} font-bold`}>Total</td>
              <td className={`${CELL} ${RIGHT} font-bold`}>
                {money(invoice.subtotal)}
              </td>
              <td className={CELL} />
              <td className={`${CELL} ${RIGHT} font-bold`}>
                {money(invoice.cgst_amount)}
              </td>
              <td className={CELL} />
              <td className={`${CELL} ${RIGHT} font-bold`}>
                {money(invoice.sgst_amount)}
              </td>
              <td className={`${CELL} ${RIGHT} font-bold`}>
                {money(totalTax)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in Words */}
        <div className="mt-[-1px] min-h-[10mm] border border-t-0 border-black px-1.5 py-1">
          Tax Amount (in words) :{" "}
          <strong className="text-[10px]">{amountInWords(totalTax)}</strong>
        </div>

        {/* Declaration + Signature */}
        <div className="mt-2 grid min-h-[18mm] grid-cols-2 border border-black">
          <div className="border-r border-black p-1.5 text-[9px]">
            <div className="font-semibold">Declaration</div>
            <p className="mt-0.5 text-slate-700">
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
          </div>

          <div className="relative p-1.5 text-right text-[9px]">
            <strong>for {COMPANY.name}</strong>
            <div className="absolute bottom-1 right-1 text-[9px] font-medium">
              Authorised Signatory
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1 text-center text-[8px] italic text-slate-500">
          This is a Computer Generated Invoice
        </div>
      </div>
    </div>
  );
}