import { EmailList } from "./types";
import PDFDocument from "pdfkit";

export const createMortgagePdf = async (mail: EmailList): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text("Mortgage Application Result", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Applicant: ${mail.full_name}`);
    doc.moveDown();

    doc.fontSize(14).text(`Loan Amount: $${mail.loan_amount.toFixed(2)}`);
    doc.moveDown();

    doc.text(`Status: ${mail.accepted ? "ACCEPTED ✅" : "REJECTED ❌"}`);

    doc.moveDown(2);
    doc
      .fontSize(10)
      .text(
        "This document is available for a limited time only. save it for your records.",
        { align: "center" },
      );

    doc.end();
  });
};
