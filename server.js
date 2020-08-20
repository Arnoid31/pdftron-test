const express = require('express');
const { PDFNet } = require('@pdftron/pdfnet-node');
const path = require('path');

const app = express();
const router = express.Router();

const port = 4004;

router.route('/').get(async (req, res) => {
  try {
    await PDFNet.initialize();
    const libPath = path.resolve(path.dirname(require.resolve("@pdftron/pdfnet-node/package.json")), './lib');
    await PDFNet.HTML2PDF.setModulePath(libPath);
  
    const pdf = await PDFNet.PDFDoc.create();
    const html2pdf = await PDFNet.HTML2PDF.create();
  
    const settings = await PDFNet.HTML2PDF.WebPageSettings.create();
    settings.setLoadImages(true);
    settings.setPrintMediaType(true);
    settings.setExternalLinks(true);
  
    const htmlString = `<!DOCTYPE html>
    <html>
      <head>
      <style type="text/css">
        @media print {
          tr {
            page-break-inside: avoid;
          }
        }
        table {
          width: 50%;
          border: 1px;
          border-color: black;
        }
        td, th {
          width: 50%;
          border: 1px;
          border-color: black;
        }
        tr {
          border: 1px;
          border-color: black;
        }
        img {
          width: 50%;
          height: 50%;
        }
      </style>
      </head>
      <body>
          <table>
            <tr>
              <th>Lorem</th><th>ipsum</th><th>dolor</th><th>sit</th><th>amet</th><th>consectetur</th><th>adipiscing</th><th>elit, sed do eiusmod tempor incididunt</th>
            </tr>
            <tr>
              <td>Lorem</td><td>ipsum</td><td>dolor</td><td>sit</td><td>amet</td><td>consectetur</td><td>adipiscing</td><td>elit, sed do eiusmod tempor incididunt</td>
            </tr>
            <tr>
              <td>Lorem</td><td>ipsum</td><td>dolor</td><td>sit</td><td>amet</td><td>consectetur</td><td>adipiscing</td><td>elit, sed do eiusmod tempor incididunt</td>
            </tr>
            <tr>
              <td>Lorem</td><td>ipsum</td><td>dolor</td><td>sit</td><td>amet</td><td>consectetur</td><td>adipiscing</td><td>elit, sed do eiusmod tempor incididunt</td>
            </tr>
            <!-- <tr> should NOT be spreaded on both pages (page-break-inside: avoid) -->
            <tr>
              <td>Lorem</td><td>ipsum</td><td>dolor</td><td>sit</td><td>amet</td><td>consectetur</td><td>adipiscing</td><td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</td>
            </tr>
          </table>
          <!-- Looks like pdftron chokes when img is given -->
          <!-- img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpg" / -->
      </body>
    </html>`;
  
    await html2pdf.insertFromHtmlString2(htmlString, settings);
    await html2pdf.convert(pdf);

    const pageCount = await pdf.getPageCount();

    const stamper = await PDFNet.Stamper.create(PDFNet.Stamper.SizeType.e_absolute_size, 100, 100);
    stamper.setAlignment(PDFNet.Stamper.HorizontalAlignment.e_horizontal_center, PDFNet.Stamper.VerticalAlignment.e_vertical_center);
    stamper.setFontColor(await PDFNet.ColorPt.init(1, 0, 0));
  
    Array.from({ length: pageCount }).forEach(async (item, index) => {
      const pageNb = index + 1;
      // stamper does not print anything :(
      stamper.stampText(pdf, `Page ${pageNb} of ${pageCount}`, await PDFNet.PageSet.createSinglePage(pageNb));
    });
  
    const buf = await pdf.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_remove_unused);
  
    res.contentType('application/pdf').status(200).write(Buffer.from(buf.buffer));
    return res.send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
});

app.use(router);

app.listen(port, (err) => {
  if (err) throw err;

  console.log(`Listening on port ${port}`)
})