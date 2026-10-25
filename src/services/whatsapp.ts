import { Student, FeeRecord, TestRecord, TestMark, CentreProfile } from '../types';

export function formatWhatsAppPhone(phone: string): string {
  // Extract numbers only
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  return digits;
}

export function openWhatsApp(phone: string, message: string) {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;
  window.open(url, '_blank');
}

export function buildFeeReminderMessage(
  student: Student,
  fee: FeeRecord,
  centre: CentreProfile,
  tone: 'polite' | 'urgent' = 'polite'
): string {
  const balance = fee.amountDue - fee.amountPaid;
  const upiLink = `upi://pay?pa=${centre.upiId}&pn=${encodeURIComponent(centre.upiName)}&am=${balance}&cu=INR&tn=${encodeURIComponent(
    `Tuition Fee ${student.name} ${fee.month}`
  )}`;

  if (tone === 'urgent') {
    return `🚨 *IMPORTANT: Tuition Fee Overdue Notice*

Dear ${student.parentName || 'Parent'},
This is a gentle reminder from *${centre.name}*.

The tuition fee for *${student.name}* (${student.classGrade} - ${student.batch}) for *${fee.month}* is pending.

📌 *Fee Details:*
• Total Due: ₹${fee.amountDue}
• Amount Paid: ₹${fee.amountPaid}
• *Pending Balance: ₹${balance}*
• Due Date was: ${fee.dueDate}

💳 *Quick UPI Payment:*
• UPI ID: \`${centre.upiId}\`
• Name: ${centre.upiName}
• Direct UPI Pay Link: ${upiLink}

Please clear the pending fee at your earliest convenience or share the screenshot if already paid.

Regards,
*${centre.name}*
📞 ${centre.phone}`;
  }

  return `🙏 *Namaste ${student.parentName || 'Parent'},*

Warm greetings from *${centre.name}*!

This is a friendly reminder regarding the tuition fee for *${student.name}* (${student.classGrade}) for the month of *${fee.month}*.

📌 *Fee Summary:*
• Pending Amount: *₹${balance}*
• Due Date: ${fee.dueDate}

💳 *Pay via UPI (GPay / PhonePe / Paytm):*
• UPI ID: \`${centre.upiId}\`
• Account Name: ${centre.upiName}

After payment, please reply with the payment screenshot or reference number. Thank you for your continued support!

Warm regards,
*${centre.name}*
📞 ${centre.phone}`;
}

export function buildAbsentAlertMessage(
  student: Student,
  date: string,
  batch: string,
  centre: CentreProfile
): string {
  return `⚠️ *Attendance Alert: Student Absent*

Dear ${student.parentName || 'Parent'},
This is an alert from *${centre.name}*.

*${student.name}* was marked *ABSENT* for today's class on *${date}*.
• Batch: ${batch || student.batch}
• Class: ${student.classGrade}

If you had prior intimation or your child is unwell, please let us know so we can arrange any missed notes or doubts.

Regards,
*${centre.name}*
📞 ${centre.phone}`;
}

export function buildTestReportMessage(
  student: Student,
  test: TestRecord,
  mark: TestMark,
  centre: CentreProfile,
  highestScore: number,
  batchAverage: number
): string {
  const percentage = Math.round((mark.marksObtained / test.totalMarks) * 100);
  const statusEmoji = percentage >= 80 ? '🌟 Excellent' : percentage >= 50 ? '👍 Good' : '⚠️ Needs Focus';

  return `📊 *Test Performance Report - ${centre.name}*

Dear ${student.parentName || 'Parent'},
Here is the performance report for *${student.name}* in the recent test.

📝 *Test Details:*
• Subject: ${test.subject}
• Test: ${test.title}
• Date: ${test.date}

🎯 *Score & Rank:*
• Marks Obtained: *${mark.marksObtained} / ${test.totalMarks}* (${percentage}%)
• *Batch Rank: #${mark.rank || 1}*
• Performance: ${statusEmoji}
• Highest in Batch: ${highestScore} / ${test.totalMarks}
• Batch Average: ${batchAverage} / ${test.totalMarks}

💬 *Tutor Feedback:*
"${mark.feedback || 'Keep up the good effort and practice regularly!'}"

We encourage you to review the question paper with ${student.name}.

Best regards,
*${centre.name}*
📞 ${centre.phone}`;
}

export function buildHomeworkAlertMessage(
  batch: string,
  subject: string,
  title: string,
  description: string,
  dueDate: string,
  centre: CentreProfile
): string {
  return `📚 *Homework Announcement - ${centre.name}*

Batch: *${batch}*
Subject: *${subject}*

📌 *Assignment:*
*${title}*
${description}

⏰ *Submission Due Date: ${dueDate}*

Parents are requested to ensure their ward completes and submits this on time.

Regards,
*${centre.name}*`;
}
