const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

// Register the Handlebars helper
handlebars.registerHelper("getStatusClass", function (status) {
  switch (status.toLowerCase()) {
    case "paid":
      return "status-paid";
    case "unpaid":
      return "status-unpaid";
    case "overdue":
    case "duetoday":
      return "status-overdue";
    default:
      return "";
  }
});

exports.convertToupcomingPaymentPDF = async (req, res) => {
  let { data, statistics } = req.body;
  console.log(data, statistics);

  // Preprocess status to be used as CSS classes
  data = data.map((item) => ({
    ...item,
    statusClass: handlebars.helpers.getStatusClass(item.status),
  }));
  // Determine the current month
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Collect unique statuses from the data
  const statuses = [...new Set(data.map((item) => item.status.toLowerCase()))];

  // Determine the report title based on the statuses
  let reportTitle = `${currentMonth} - upcoming Payment report`;

  if (statuses.length === 1) {
    switch (statuses[0]) {
      case "paid":
        reportTitle = `${currentMonth} - upcoming Payment paid report`;
        break;
      case "unpaid":
        reportTitle = `${currentMonth} - upcoming Payment unpaid report`;
        break;
      case "duetoday":
        reportTitle = `${currentMonth} - upcoming Payment duetoday report`;
        break;
      case "overdue":
        reportTitle = `${currentMonth} - upcoming Payment overdue report`;
        break;
      default:
        break;
    }
  } else {
    if (
      statuses.includes("paid") &&
      statuses.includes("unpaid") &&
      statuses.includes("duetoday") &&
      statuses.includes("overdue")
    ) {
      reportTitle = `${currentMonth} - upcoming Payment report`;
    } else {
      reportTitle = `${currentMonth} - upcoming Payment (${statuses.join(
        ", "
      )}) report`;
    }
  }

  // Read the HTML template
  const source = fs.readFileSync(
    path.join(__dirname, "../template/upcomingPaymentTemplate.html"),
    "utf8"
  );
  const template = handlebars.compile(source);
  const html = template({ data, statistics, reportTitle });

  const pdf = await convertHTMLToPDF(html, "data.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=data.pdf");
  res.send(pdf);
};

async function convertHTMLToPDF(
  htmlContent,
  pdfFilePath,
  margins = { top: "10mm", right: "1mm", bottom: "10mm", left: "1mm" }
) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdf = await page.pdf({
    format: "A3",
    margin: margins,
    printBackground: true, // Ensure background colors are printed
  });
  await browser.close();
  return pdf;
}
