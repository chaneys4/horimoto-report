# Food Demonstration Report Dashboard

A mobile-friendly, single-page English/Japanese entry form for food demonstrations. The dashboard follows the supplied `ReportForm.docx` structure: event name/date and time/location/staff, observations, an itemized product feedback table (product, manufacturer, price, sample usage, and customer comments), and a dedicated event-photo page. Creating the report fills those form sections from the information entered on the dashboard.

## Start

Open `index.html` in a current browser. No build step, package installation, or internet connection is needed to create a report.

Office staff can open `admin.html` to reconstruct a client report from a staff email, SMS, or `.txt` backup. Copy the message into the import box (or load the saved text file), select **Fill report form**, verify the parsed data, add a reviewed Japanese translation if needed, and upload the actual photo files received from staff. Then create and review the landscape PDF before emailing it to the client.

The office page does not connect to the Horimoto inbox or keep a shared database. Reports must be copied from email/text into the page. Save original messages and the completed PDF in the office's normal file system for an archive.

## Create and save a report

1. Enter the event name, store/location, staff name, and date.
2. Enter observations and product details in English. The screen-language toggle only changes the dashboard labels; report text is included exactly as entered and is not automatically translated.
3. Add one or more event photos. Images are resized in the browser before being placed in the report.
4. Select **Create report**, then select **Email report (recommended)** to open an addressed email with all entered report data in the message body. Check the draft and tap Send.
5. **Text report** opens an addressed SMS draft for shorter reports. **Download raw data** saves a text file as a backup. **Save as PDF** is optional for the staff member's own records.

The email is addressed to `horimotoandassociates@gmail.com`; SMS is addressed to `+1 323-790-4678`. The browser opens the staff member's email or messaging app with a draft—it cannot send the message automatically. The report data and selected photo filenames are included, but photo files are not attached and must be sent separately if needed. SMS is limited to 1,200 characters; use email for longer reports. Landscape PDF layout is set to 11 × 8.5 inches, but browser or printer-driver settings can override page styles.

## Privacy

No report data is sent until staff choose an email or text action. Choosing one opens the corresponding email or messaging application with the report in a draft. Staff can review the draft before sending. Photos and report fields otherwise remain in the browser and are not uploaded by this application.

## Project files

- `index.html` — form and report structure
- `styles.css` — responsive screen styles and print/PDF layout
- `app.js` — bilingual screen controls, photo processing, raw report formatting, and report rendering
