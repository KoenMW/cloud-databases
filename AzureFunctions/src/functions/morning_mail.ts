import { app, InvocationContext, Timer } from "@azure/functions";
import {
  ensureTableExists,
  getDbClient,
  markNotificationsSent,
} from "../lib/pg";
import { EmailList } from "../lib/types";
import { createMortgagePdf } from "../lib/pdf";
import { uploadPdfAndGetSasUrl } from "../lib/blob";

const getUnsendMailList = async () => {
  await ensureTableExists();
  const client = await getDbClient();
  try {
    const res = await client.query<EmailList>(
      `
      SELECT id, full_name, email, accepted, loan_amount FROM processed_mortgages
      WHERE notifications_sent = FALSE AND accepted = TRUE;
    `,
    );

    const rows = res.rows.map((row) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      accepted: row.accepted,
      loan_amount: Number(row.loan_amount),
    }));
    return rows;
  } finally {
    client.release();
  }
};

export async function morning_mail(
  _: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Morning mail function executed at:", new Date().toISOString());

  const emailList = await getUnsendMailList();
  context.log(`Found ${emailList.length} emails to send morning mail to.`);
  for (const emailEntry of emailList) {
    try {
      context.log(
        `Sending morning mail to ${emailEntry.full_name} at ${emailEntry.email} it was ${
          emailEntry.accepted ? "ACCEPTED" : "REJECTED"
        }`,
      );
      const pdf = await createMortgagePdf(emailEntry);
      const pdfUrl = await uploadPdfAndGetSasUrl(
        `mortgage_${emailEntry.full_name.toLowerCase().replace(/ /g, "_")}.pdf`,
        pdf,
        60 * 24,
      );
      await markNotificationsSent(emailEntry.id);

      context.log(
        `Morning mail sent to ${emailEntry.email} with PDF URL: ${pdfUrl}`,
      );
    } catch (error) {
      context.error(
        `Failed to send morning mail to ${emailEntry.email}:`,
        error,
      );
    }
  }
}

app.timer("morning_mail", {
  schedule: !!process.env.TESTING ? "0 */2 * * * *" : "0 0 7 * * *", // {second} {minute} {hour} {day} {month} {day of week}
  handler: morning_mail,
});
