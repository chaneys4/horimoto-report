const rawReportInput = document.querySelector("#raw-report-input");
const rawFileInput = document.querySelector("#raw-file-input");
const clientForm = document.querySelector("#client-report-form");
const adminStatus = document.querySelector("#admin-status");
const adminProductList = document.querySelector("#admin-product-list");
const adminPhotoInput = document.querySelector("#admin-photo-input");
const adminPhotoGrid = document.querySelector("#admin-photo-grid");
const adminPhotoSummary = document.querySelector("#admin-photo-summary");
const clientPreview = document.querySelector("#client-preview");
const clientReportDocument = document.querySelector("#client-report-document");
const ADMIN_MAX_PHOTOS = 48;
const ADMIN_MAX_FILE_SIZE = 15 * 1024 * 1024;
const ADMIN_MAX_IMAGE_EDGE = 2000;

let adminProducts = [];
let adminPhotos = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setAdminStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.hidden = false;
  adminStatus.classList.toggle("is-error", isError);
}

function clearAdminStatus() {
  adminStatus.hidden = true;
  adminStatus.classList.remove("is-error");
  adminStatus.textContent = "";
}

function readField(source, fieldName) {
  const expression = new RegExp(`^${fieldName}:\\s*(.*)$`, "im");
  return source.match(expression)?.[1]?.trim() || "";
}

function parseProductBlock(block) {
  const fieldNames = ["Product name", "Manufacturer", "Price", "Sample usage", "Customer comments"];
  const values = {};
  fieldNames.forEach((name, index) => {
    const expression = new RegExp(`^${name}:\\s*`, "im");
    const match = expression.exec(block);
    if (!match) {
      values[name] = "";
      return;
    }
    const start = match.index + match[0].length;
    const nextField = fieldNames.slice(index + 1).map((field) => {
      const nextMatch = new RegExp(`^${field}:\\s*`, "im").exec(block.slice(start));
      return nextMatch ? start + nextMatch.index : -1;
    }).filter((position) => position >= 0);
    const end = nextField.length ? Math.min(...nextField) : block.length;
    values[name] = block.slice(start, end).trim();
  });
  return {
    name: values["Product name"],
    manufacturer: values.Manufacturer,
    price: values.Price,
    usage: values["Sample usage"],
    reactionEn: values["Customer comments"],
    reactionJa: ""
  };
}

function parseStaffReport(rawText) {
  const normalized = rawText.replace(/\r\n?/g, "\n").trim();
  if (!normalized.includes("FOOD DEMONSTRATION REPORT")) {
    throw new Error("Could not find the Horimoto staff report header. Paste the full report message or use manual entry.");
  }
  const eventSection = normalized.split("\nOBSERVATIONS")[0] || "";
  const observationParts = normalized.split("\nOBSERVATIONS\n");
  if (observationParts.length < 2) {
    throw new Error("Could not find the OBSERVATIONS section. Please paste the complete staff report.");
  }
  const afterObservations = observationParts.slice(1).join("\nOBSERVATIONS\n");
  const observation = afterObservations.split("\n\nPRODUCT FEEDBACK")[0]?.trim() || "";
  const productParts = afterObservations.split("\n\nPRODUCT FEEDBACK\n");
  const productSection = productParts[1]?.split("\n\nEVENT PHOTOS")[0] || "";
  const productBlocks = [...productSection.matchAll(/(?:^|\n)Product \d+\n/g)];
  const products = productBlocks.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < productBlocks.length ? productBlocks[index + 1].index : productSection.length;
    return parseProductBlock(productSection.slice(start, end));
  }).filter((product) => Object.values(product).some((value) => value.trim()));

  const photoPart = afterObservations.split("\n\nEVENT PHOTOS\n")[1] || "";
  const photoNames = photoPart.split("\n")
    .map((line) => line.match(/^\d+\.\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);

  return {
    eventName: readField(eventSection, "Event name"),
    location: readField(eventSection, "Store / location"),
    staffName: readField(eventSection, "Staff name"),
    eventDate: readField(eventSection, "Date"),
    eventTime: readField(eventSection, "Time"),
    narrativeEn: observation === "Not provided" ? "" : observation,
    products,
    photoNames
  };
}

function setFormField(name, value) {
  const field = clientForm.elements.namedItem(name);
  if (field) field.value = value || "";
}

function fillFromStaffMessage() {
  clearAdminStatus();
  try {
    const report = parseStaffReport(rawReportInput.value);
    setFormField("eventName", report.eventName);
    setFormField("location", report.location);
    setFormField("staffName", report.staffName);
    setFormField("eventDate", report.eventDate);
    setFormField("eventTime", report.eventTime === "Not provided" ? "" : report.eventTime);
    setFormField("narrativeEn", report.narrativeEn);
    setFormField("narrativeJa", "");
    adminProducts = report.products;
    renderAdminProducts();
    renderClientReport();
    clientPreview.hidden = true;
    setAdminStatus(`Imported report for ${report.eventName || "event"}${report.products.length ? `, including ${report.products.length} product(s)` : ""}. Check the details below.`);
    clientForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Could not import the staff report.", error);
    setAdminStatus(error.message, true);
  }
}

function renderAdminProducts() {
  adminProductList.replaceChildren();
  adminProducts.forEach((product, index) => {
    const card = element("section", "admin-product-card");
    const heading = element("div", "admin-product-heading");
    heading.append(element("strong", "", `Product ${index + 1}`));
    const remove = element("button", "admin-remove-product", "Remove");
    remove.type = "button";
    remove.disabled = adminProducts.length === 1;
    remove.addEventListener("click", () => {
      adminProducts.splice(index, 1);
      renderAdminProducts();
      invalidateClientPreview();
    });
    heading.append(remove);

    const fields = element("div", "admin-product-fields");
    const definitions = [
      ["name", "Product name", "text", "e.g. Yomogimochi"],
      ["manufacturer", "Manufacturer", "text", "e.g. Seika Foods"],
      ["price", "Price", "text", "e.g. $2.99"],
      ["usage", "Sample usage", "text", "e.g. 2 cups"],
      ["reactionEn", "Customer comments (English)", "textarea", "Staff comments"],
      ["reactionJa", "Customer comments (Japanese, optional)", "textarea", "Add reviewed Japanese text if needed"]
    ];
    definitions.forEach(([key, labelText, type, placeholder]) => {
      const label = element("label", `field${key.startsWith("reaction") ? " comment-field" : ""}`);
      label.append(element("span", "", labelText));
      const input = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      if (type !== "textarea") input.type = "text";
      if (type === "textarea") input.rows = 3;
      input.placeholder = placeholder;
      input.value = product[key] || "";
      input.addEventListener("input", () => {
        adminProducts[index][key] = input.value;
        invalidateClientPreview();
      });
      label.append(input);
      fields.append(label);
    });
    card.append(heading, fields);
    adminProductList.append(card);
  });
}

function invalidateClientPreview() {
  clientPreview.hidden = true;
}

function addAdminImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(`Could not open ${file.name} as an image.`));
      image.onload = () => {
        const scale = Math.min(1, ADMIN_MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error(`Could not prepare ${file.name}.`));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, dataUrl: canvas.toDataURL("image/jpeg", 0.84) });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleAdminPhotos(files) {
  clearAdminStatus();
  const available = ADMIN_MAX_PHOTOS - adminPhotos.length;
  const accepted = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= ADMIN_MAX_FILE_SIZE).slice(0, available);
  if (!accepted.length && files.length) {
    setAdminStatus(`Choose image files under 15 MB each. You can add up to ${ADMIN_MAX_PHOTOS} photos.`, true);
    adminPhotoInput.value = "";
    return;
  }
  try {
    const results = await Promise.allSettled(accepted.map(addAdminImage));
    const failures = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") adminPhotos.push(result.value);
      else failures.push(result.reason.message || `Could not read ${accepted[index].name}.`);
    });
    if (files.length > accepted.length) failures.push(`Only image files under 15 MB are accepted; the limit is ${ADMIN_MAX_PHOTOS} photos.`);
    if (failures.length) setAdminStatus(failures.join(" "), true);
  } finally {
    adminPhotoInput.value = "";
    renderAdminPhotos();
  }
}

function renderAdminPhotos() {
  adminPhotoGrid.replaceChildren();
  adminPhotoSummary.textContent = adminPhotos.length
    ? `${adminPhotos.length} photo${adminPhotos.length === 1 ? "" : "s"} added to the client report.`
    : "No photos added. The staff message may list photo filenames; add the actual photo files here.";
  adminPhotos.forEach((photo, index) => {
    const card = element("div", "photo-card");
    const image = document.createElement("img");
    image.src = photo.dataUrl;
    image.alt = photo.name;
    const remove = element("button", "remove-photo", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${photo.name}`);
    remove.addEventListener("click", () => {
      adminPhotos.splice(index, 1);
      renderAdminPhotos();
      invalidateClientPreview();
    });
    card.append(image, remove);
    adminPhotoGrid.append(card);
  });
}

function reportDetail(label, value) {
  const item = element("div", "report-detail");
  item.append(element("dt", "", label), element("dd", "", value || "—"));
  return item;
}

function reportPhotoColumns(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

function renderClientReport() {
  const data = new FormData(clientForm);
  const title = element("h1", "report-title", "試食販売 実施報告書");
  const subtitle = element("p", "report-subtitle", "FOOD DEMONSTRATION REPORT · HORIMOTO LLC");
  const header = element("header", "client-report-header");
  header.append(title, subtitle);
  if (data.get("clientName").trim()) {
    header.append(element("p", "client-report-prepared-for", `Prepared for / 提出先: ${data.get("clientName").trim()}`));
  }

  const eventHeading = element("h2", "report-section-title", "実施概要 / Event details");
  const details = element("dl", "report-details");
  details.append(
    reportDetail("催事名 / Event name", data.get("eventName").trim()),
    reportDetail("実施店舗 / Store or location", data.get("location").trim()),
    reportDetail("担当者 / Staff name", data.get("staffName").trim()),
    reportDetail("実施日時 / Date and time", [data.get("eventDate").trim(), data.get("eventTime").trim()].filter(Boolean).join(" · "))
  );

  const observationHeading = element("h2", "report-section-title", "実施内容・所感 / Observations");
  const narrativeEn = data.get("narrativeEn").trim();
  const narrativeJa = data.get("narrativeJa").trim();
  const narratives = element("div", "client-report-narratives");
  if (narrativeEn) narratives.append(languageBlock("English", narrativeEn));
  if (narrativeJa) narratives.append(languageBlock("日本語", narrativeJa));
  if (!narrativeEn && !narrativeJa) narratives.append(languageBlock("Observations / 実施内容・所感", "Not provided."));

  const productHeading = element("h2", "report-section-title", "商品別のお客様の反応 / Product feedback");
  const table = element("table", "report-product-table");
  const thead = element("thead");
  const headerRow = element("tr");
  ["商品名 / Product name", "メーカー / Manufacturer", "価格 / Price", "試食 使用量 / Sample usage", "お客様の主な反応 / Customer comments"].forEach((label) => {
    headerRow.append(element("th", "", label));
  });
  thead.append(headerRow);
  const tbody = element("tbody");
  const populatedProducts = adminProducts.filter((product) =>
    Object.values(product).some((value) => typeof value === "string" && value.trim())
  );
  if (!populatedProducts.length) {
    const row = element("tr");
    const cell = element("td", "empty-product-cell", "No product details provided. / 商品情報の入力はありません。");
    cell.colSpan = 5;
    row.append(cell);
    tbody.append(row);
  } else {
    populatedProducts.forEach((product) => {
      const row = element("tr");
      [product.name, product.manufacturer, product.price, product.usage].forEach((value) => {
        row.append(element("td", "", value));
      });
      const comments = element("td");
      if (product.reactionEn.trim()) comments.append(element("p", "client-product-comment", product.reactionEn.trim()));
      if (product.reactionJa.trim()) comments.append(element("p", "client-product-comment", product.reactionJa.trim()));
      row.append(comments);
      tbody.append(row);
    });
  }
  table.append(thead, tbody);

  clientReportDocument.replaceChildren(header, eventHeading, details, observationHeading, narratives, productHeading, table);
  const photoPages = [];
  for (let index = 0; index < adminPhotos.length; index += 12) photoPages.push(adminPhotos.slice(index, index + 12));
  if (!photoPages.length) {
    const photoSection = element("section", "client-photo-sheet");
    photoSection.append(
      element("h2", "report-section-title", "イベント写真 / Event photos"),
      element("p", "report-narrative", "No photo files were added to this report. / 写真は追加されていません。")
    );
    clientReportDocument.append(photoSection);
    return;
  }
  photoPages.forEach((photos, pageIndex) => {
    const sheet = element("section", "client-photo-sheet");
    sheet.append(element("h2", "report-section-title", `イベント写真 / Event photos (${pageIndex + 1}/${photoPages.length})`));
    const grid = element("div", "client-photo-grid");
    const columns = reportPhotoColumns(photos.length);
    const rows = Math.ceil(photos.length / columns);
    grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    photos.forEach((photo, photoIndex) => {
      const tile = element("div", "client-photo-tile");
      const image = document.createElement("img");
      image.src = photo.dataUrl;
      image.alt = `Event photo ${pageIndex * 12 + photoIndex + 1}`;
      tile.append(image);
      grid.append(tile);
    });
    sheet.append(grid);
    clientReportDocument.append(sheet);
  });
}

function languageBlock(language, text) {
  const block = element("section", "client-report-language");
  block.append(element("h3", "", language), element("p", "", text));
  return block;
}

rawFileInput.addEventListener("change", async () => {
  const file = rawFileInput.files[0];
  if (!file) return;
  try {
    rawReportInput.value = await file.text();
    setAdminStatus(`Loaded ${file.name}. Select “Fill report form” to import it.`);
  } catch (error) {
    console.error("Could not read the report file.", error);
    setAdminStatus("Could not read that file. Try opening it and pasting its contents instead.", true);
  } finally {
    rawFileInput.value = "";
  }
});

document.querySelector("#import-report").addEventListener("click", fillFromStaffMessage);

document.querySelector("#add-admin-product").addEventListener("click", () => {
  adminProducts.push({ name: "", manufacturer: "", price: "", usage: "", reactionEn: "", reactionJa: "" });
  renderAdminProducts();
  invalidateClientPreview();
  adminProductList.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
});

adminPhotoInput.addEventListener("change", () => handleAdminPhotos(adminPhotoInput.files));

clientForm.addEventListener("input", invalidateClientPreview);
clientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearAdminStatus();
  if (!clientForm.reportValidity()) {
    setAdminStatus("Please enter the event name, location, staff name, and date.", true);
    clientForm.querySelector(":invalid")?.focus();
    return;
  }
  renderClientReport();
  clientPreview.hidden = false;
  clientPreview.scrollIntoView({ behavior: "smooth", block: "start" });
  setAdminStatus("Client report is ready. Check the report and save the landscape PDF.");
});

document.querySelector("#save-client-pdf").addEventListener("click", () => window.print());

adminPhotoInput.value = "";
renderAdminProducts();
renderAdminPhotos();
