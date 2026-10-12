const form = document.querySelector("#report-form");
const languageToggle = document.querySelector("#language-toggle");
const photoInput = document.querySelector("#photo-input");
const photoGrid = document.querySelector("#photo-grid");
const photoSummary = document.querySelector("#photo-summary");
const productEntryList = document.querySelector("#product-entry-list");
const narrativeInput = document.querySelector("#narrative");
const createReportButton = document.querySelector("#create-report");
const statusMessage = document.querySelector("#status-message");
const reportPreview = document.querySelector("#report-preview");
const reportDocument = document.querySelector("#report-document");
const EMAIL_DESTINATION = "horimotoandassociates@gmail.com";
const TEXT_DESTINATION = "+13237904678";
const MAX_PHOTOS = 48;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;
const IMAGE_QUALITY = 0.84;

let interfaceLanguage = "en";
let photos = [];
let productEntries = [{ name: "", manufacturer: "", price: "", usage: "", reaction: "" }];

const messages = {
  en: {
    photoCount: (count) => `${count} ${count === 1 ? "photo" : "photos"} added`,
    noPhotos: "No photos added. You can still create your report.",
    photoLimit: `You can add up to ${MAX_PHOTOS} photos to one report.`,
    fileTooLarge: (name) => `${name} is larger than 15 MB and was not added.`,
    invalidImage: (name) => `${name} could not be opened as an image and was not added.`,
    processingPhotos: "Preparing photos…",
    ready: "Your report is ready to review.",
    required: "Please complete the required fields: event name, location, staff name, and date.",
    emailOpened: "Your email app should open with the report filled in. Check it and tap Send.",
    emailTooLong: "This report is too long to open in an email draft. Download the raw data and attach it to an email instead.",
    textTooLong: "This report is too long for a reliable text message. Please use email instead.",
    textOpened: "Your text-message app should open with the report filled in. Check it and tap Send.",
    rawDownloaded: "Raw report data downloaded.",
    shareFailed: "Could not open the message app. Try downloading the raw data instead.",
    emailSubject: "Food demonstration report",
    photoFiles: "Selected photo file names:",
    noPhotosSelected: "No photos selected.",
    photosNotAttached: "Photo files are not attached to this message; send them separately if needed.",
    imageError: "One or more photos could not be prepared. Remove them and try again.",
    removePhoto: (name) => `Remove ${name}`,
    photoPage: (page, total) => `Event photos / イベント写真 (${page}/${total})`,
    photoAlt: (index) => `Event photo ${index}`,
    reportTitle: "試食販売 実施報告書",
    subtitle: "FOOD DEMONSTRATION REPORT · HORIMOTO LLC",
    overview: "実施概要 / Event details",
    event: "催事名 / Event name",
    location: "実施店舗 / Store or location",
    staff: "担当者 / Staff name",
    date: "実施日時 / Date and time",
    observations: "実施内容・所感 / Observations",
    productHeading: "商品別のお客様の反応 / Product feedback",
    productName: "商品名 / Product name",
    manufacturer: "メーカー / Manufacturer",
    price: "価格 / Price",
    usage: "試食 使用量 / Sample usage",
    reaction: "お客様の主な反応 / Main customer comments",
    noProducts: "商品情報の入力はありません。 / No product details provided.",
    noNarrative: "所感の入力はありません。 / No observations provided.",
    noPhotoTitle: "イベント写真 / Event photos",
    noPhotoMessage: "写真は添付されていません。 / No photos were attached."
  },
  ja: {
    photoCount: (count) => `${count}枚の写真を追加しました`,
    noPhotos: "写真なしでも報告書を作成できます。",
    photoLimit: `写真は1つの報告書につき${MAX_PHOTOS}枚まで追加できます。`,
    fileTooLarge: (name) => `${name} は15MBを超えているため追加できませんでした。`,
    invalidImage: (name) => `${name} を画像として読み込めなかったため追加できませんでした。`,
    processingPhotos: "写真を準備しています…",
    ready: "報告書ができました。内容をご確認ください。",
    required: "必須項目を入力してください：催事名、実施店舗、担当者、実施日。",
    emailOpened: "メールアプリが開き、報告内容が入力されます。内容を確認して「送信」をタップしてください。",
    emailTooLong: "メールの下書きに入力するには報告内容が長すぎます。入力データを保存して、メールに添付してください。",
    textTooLong: "報告内容が長すぎるため、テキスト送信できません。メールを使用してください。",
    textOpened: "メッセージアプリが開き、報告内容が入力されます。内容を確認して「送信」をタップしてください。",
    rawDownloaded: "入力データをダウンロードしました。",
    shareFailed: "メッセージアプリを開けませんでした。入力データをダウンロードしてください。",
    emailSubject: "試食販売 実施報告書",
    photoFiles: "選択した写真のファイル名：",
    noPhotosSelected: "写真は選択されていません。",
    photosNotAttached: "写真ファイルはメッセージに添付されません。必要な場合は別途送信してください。",
    imageError: "準備できない写真があります。写真を削除して、もう一度お試しください。",
    removePhoto: (name) => `${name}を削除`,
    photoPage: (page, total) => `イベント写真 / Event photos (${page}/${total})`,
    photoAlt: (index) => `イベント写真 ${index}`,
    reportTitle: "試食販売 実施報告書",
    subtitle: "試食販売 実施報告書 · HORIMOTO LLC",
    overview: "実施概要 / Event details",
    event: "催事名 / Event name",
    location: "実施店舗 / Store or location",
    staff: "担当者 / Staff name",
    date: "実施日時 / Date and time",
    observations: "実施内容・所感 / Observations",
    productHeading: "商品別のお客様の反応 / Product feedback",
    productName: "商品名 / Product name",
    manufacturer: "メーカー / Manufacturer",
    price: "価格 / Price",
    usage: "試食 使用量 / Sample usage",
    reaction: "お客様の主な反応 / Main customer comments",
    noProducts: "商品情報の入力はありません。 / No product details provided.",
    noNarrative: "所感の入力はありません。 / No observations provided.",
    noPhotoTitle: "イベント写真 / Event photos",
    noPhotoMessage: "写真は添付されていません。 / No photos were attached."
  }
};

function setInterfaceLanguage(language) {
  interfaceLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-en][data-ja]").forEach((element) => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll("[data-placeholder-en][data-placeholder-ja]").forEach((element) => {
    element.placeholder = element.dataset[`placeholder${language === "en" ? "En" : "Ja"}`];
  });
  languageToggle.setAttribute("aria-label", language === "en" ? "日本語に切り替える" : "Switch to English");
  renderPhotoGrid();
  renderProductEntries();
  if (reportDocument.childElementCount > 0) renderReport();
}

function invalidateReport() {
  reportPreview.hidden = true;
}

function showStatus(message, isError = false) {
  statusMessage.replaceChildren(makeElement("span", "", message));
  statusMessage.hidden = false;
  statusMessage.classList.toggle("is-error", isError);
}

function clearStatus() {
  statusMessage.hidden = true;
  statusMessage.classList.remove("is-error");
  statusMessage.replaceChildren();
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderPhotoGrid() {
  const copy = messages[interfaceLanguage];
  photoGrid.replaceChildren();
  photoSummary.textContent = photos.length ? copy.photoCount(photos.length) : copy.noPhotos;

  photos.forEach((photo, index) => {
    const card = makeElement("div", "photo-card");
    const image = document.createElement("img");
    image.src = photo.dataUrl;
    image.alt = photo.name;
    image.loading = "lazy";
    const removeButton = makeElement("button", "remove-photo", "×");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", copy.removePhoto(photo.name));
    removeButton.addEventListener("click", () => {
      photos.splice(index, 1);
      invalidateReport();
      renderPhotoGrid();
      clearStatus();
    });
    card.append(image, removeButton);
    photoGrid.append(card);
  });
}

function renderProductEntries() {
  const labels = messages[interfaceLanguage];
  productEntryList.replaceChildren();
  productEntries.forEach((entry, index) => {
    const card = makeElement("div", "product-entry");
    const header = makeElement("div", "product-entry-header");
    const title = makeElement("strong", "", `${interfaceLanguage === "ja" ? "商品" : "Product"} ${index + 1}`);
    const remove = makeElement("button", "remove-product", interfaceLanguage === "ja" ? "削除" : "Remove");
    remove.type = "button";
    remove.disabled = productEntries.length === 1;
    remove.setAttribute("aria-label", `${remove.textContent} ${interfaceLanguage === "ja" ? "商品" : "product"} ${index + 1}`);
    remove.addEventListener("click", () => {
      if (productEntries.length === 1) return;
      productEntries.splice(index, 1);
      renderProductEntries();
      invalidateReport();
    });
    header.append(title, remove);

    const fields = makeElement("div", "product-field-grid");
    const definitions = [
      ["name", labels.productName, "e.g. Yomogimochi", "英語で入力：例 Yomogimochi", "text"],
      ["manufacturer", labels.manufacturer, "e.g. Seika Foods", "英語で入力：例 Seika Foods", "text"],
      ["price", labels.price, "e.g. $2.99", "英語で入力：例 $2.99", "text"],
      ["usage", labels.usage, "e.g. 2 cups", "英語で入力：例 2 cups", "text"],
      ["reaction", labels.reaction, "What did customers say about this product? (English)", "お客様の反応を英語で入力してください。", "textarea"]
    ];
    definitions.forEach(([field, label, placeholderEn, placeholderJa, type]) => {
      const wrapper = makeElement("label", `field product-field${field === "reaction" ? " product-reaction-field" : ""}`);
      wrapper.append(makeElement("span", "", label));
      const control = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      if (type !== "textarea") control.type = "text";
      if (type === "textarea") control.rows = 3;
      control.value = entry[field];
      control.placeholder = interfaceLanguage === "en" ? placeholderEn : placeholderJa;
      control.dataset.productIndex = String(index);
      control.dataset.productField = field;
      wrapper.append(control);
      fields.append(wrapper);
    });
    card.append(header, fields);
    productEntryList.append(card);
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode"));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas"));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve({ name: file.name, dataUrl: canvas.toDataURL("image/jpeg", IMAGE_QUALITY) });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function addSelectedPhotos(files) {
  clearStatus();
  invalidateReport();
  const copy = messages[interfaceLanguage];
  const remaining = MAX_PHOTOS - photos.length;
  if (remaining <= 0) {
    showStatus(copy.photoLimit, true);
    photoInput.value = "";
    return;
  }

  const selectedFiles = Array.from(files);
  const validFiles = [];
  const errors = [];
  selectedFiles.forEach((file) => {
    if (!file.type.startsWith("image/")) {
      errors.push(copy.invalidImage(file.name));
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(copy.fileTooLarge(file.name));
    } else {
      validFiles.push(file);
    }
  });

  const acceptedFiles = validFiles.slice(0, remaining);
  if (validFiles.length > remaining) errors.push(copy.photoLimit);
  if (!acceptedFiles.length) {
    if (errors.length) showStatus(errors.join(" "), true);
    photoInput.value = "";
    return;
  }

  photoInput.disabled = true;
  photoSummary.textContent = copy.processingPhotos;
  try {
    const results = await Promise.allSettled(acceptedFiles.map(readImage));
    results.forEach((result, index) => {
      if (result.status === "fulfilled") photos.push(result.value);
      else errors.push(copy.invalidImage(acceptedFiles[index].name));
    });
  } finally {
    photoInput.disabled = false;
    photoInput.value = "";
    renderPhotoGrid();
  }

  if (errors.length) showStatus(errors.join(" "), true);
}

function reportDetail(label, value) {
  const wrapper = makeElement("div", "report-detail");
  wrapper.append(makeElement("dt", "", label), makeElement("dd", "", value));
  return wrapper;
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const locale = interfaceLanguage === "ja" ? "ja-JP" : "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

function buildRawReport() {
  const data = new FormData(form);
  const reportLines = [
    "HORIMOTO LLC — FOOD DEMONSTRATION REPORT",
    "",
    "EVENT DETAILS",
    `Event name: ${data.get("eventName").trim()}`,
    `Store / location: ${data.get("location").trim()}`,
    `Staff name: ${data.get("staffName").trim()}`,
    `Date: ${data.get("eventDate")}`,
    `Time: ${data.get("eventTime").trim() || "Not provided"}`,
    "",
    "OBSERVATIONS",
    data.get("narrative").trim() || "Not provided",
    "",
    "PRODUCT FEEDBACK"
  ];

  const products = productEntries.filter((product) =>
    Object.values(product).some((value) => typeof value === "string" && value.trim())
  );
  if (products.length) {
    products.forEach((product, index) => {
      reportLines.push(
        "",
        `Product ${index + 1}`,
        `Product name: ${product.name.trim() || "Not provided"}`,
        `Manufacturer: ${product.manufacturer.trim() || "Not provided"}`,
        `Price: ${product.price.trim() || "Not provided"}`,
        `Sample usage: ${product.usage.trim() || "Not provided"}`,
        `Customer comments: ${product.reaction.trim() || "Not provided"}`
      );
    });
  } else {
    reportLines.push("No product details entered.");
  }

  reportLines.push("", "EVENT PHOTOS", messages[interfaceLanguage].photoFiles);
  if (photos.length) {
    photos.forEach((photo, index) => reportLines.push(`${index + 1}. ${photo.name}`));
  } else {
    reportLines.push(messages[interfaceLanguage].noPhotosSelected);
  }
  reportLines.push("", messages[interfaceLanguage].photosNotAttached);
  return reportLines.join("\n");
}

function openMessageApp(url) {
  try {
    window.location.href = url;
    return true;
  } catch (error) {
    console.error("Could not open the message application.", error);
    showStatus(messages[interfaceLanguage].shareFailed, true);
    return false;
  }
}

function downloadRawReport() {
  const rawReport = buildRawReport();
  const eventName = new FormData(form).get("eventName").trim();
  const safeName = eventName.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "event";
  const blob = new Blob([rawReport], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = `Horimoto-report-${safeName}.txt`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  showStatus(messages[interfaceLanguage].rawDownloaded);
}

function photoColumns(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

function renderReport() {
  const copy = messages[interfaceLanguage];
  const data = new FormData(form);
  const title = makeElement("h1", "report-title", copy.reportTitle);
  const subtitle = makeElement("p", "report-subtitle", copy.subtitle);
  const overview = makeElement("h2", "report-section-title", copy.overview);
  const details = makeElement("dl", "report-details");
  details.append(
    reportDetail(copy.event, data.get("eventName").trim()),
    reportDetail(copy.location, data.get("location").trim()),
    reportDetail(copy.staff, data.get("staffName").trim()),
    reportDetail(copy.date, [formatDate(data.get("eventDate")), data.get("eventTime").trim()].filter(Boolean).join(" · "))
  );

  const observationsHeading = makeElement("h2", "report-section-title", copy.observations);
  const narrative = data.get("narrative").trim();
  const narrativeSection = makeElement("div", "report-narrative-section");
  if (narrative) {
    narrativeSection.append(makeElement("p", "report-narrative", narrative));
  } else {
    narrativeSection.append(makeElement("p", "report-narrative", copy.noNarrative));
  }

  const productsHeading = makeElement("h2", "report-section-title", copy.productHeading);
  const productTable = makeElement("table", "report-product-table");
  const tableHead = makeElement("thead");
  const headerRow = makeElement("tr");
  [copy.productName, copy.manufacturer, copy.price, copy.usage, copy.reaction].forEach((label) => {
    headerRow.append(makeElement("th", "", label));
  });
  tableHead.append(headerRow);
  const tableBody = makeElement("tbody");
  const filledProducts = productEntries.filter((entry) =>
    Object.values(entry).some((value) => typeof value === "string" && value.trim())
  );
  if (filledProducts.length) {
    filledProducts.forEach((entry) => {
      const row = makeElement("tr");
      [entry.name, entry.manufacturer, entry.price, entry.usage].forEach((value) => {
        row.append(makeElement("td", "", value));
      });
      const reactionCell = makeElement("td");
      if (entry.reaction) {
        reactionCell.append(makeElement("p", "report-narrative", entry.reaction));
      }
      row.append(reactionCell);
      tableBody.append(row);
    });
  } else {
    const row = makeElement("tr");
    const cell = makeElement("td", "empty-product-cell", copy.noProducts);
    cell.colSpan = 5;
    row.append(cell);
    tableBody.append(row);
  }
  productTable.append(tableHead, tableBody);

  reportDocument.replaceChildren(title, subtitle, overview, details, observationsHeading, narrativeSection, productsHeading, productTable);
  const pages = [];
  for (let index = 0; index < photos.length; index += 12) pages.push(photos.slice(index, index + 12));
  if (!pages.length) {
    const sheet = makeElement("section", "report-photo-sheet");
    sheet.append(makeElement("h2", "report-section-title", copy.noPhotoTitle));
    sheet.append(makeElement("p", "report-narrative", copy.noPhotoMessage));
    reportDocument.append(sheet);
    return;
  }

  pages.forEach((pagePhotos, pageIndex) => {
    const sheet = makeElement("section", "report-photo-sheet");
    sheet.append(makeElement("h2", "report-section-title", copy.photoPage(pageIndex + 1, pages.length)));
    const grid = makeElement("div", "report-photo-grid");
    const columns = photoColumns(pagePhotos.length);
    const rows = Math.ceil(pagePhotos.length / columns);
    grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    pagePhotos.forEach((photo, photoIndex) => {
      const tile = makeElement("div", "report-photo-tile");
      const image = document.createElement("img");
      image.src = photo.dataUrl;
      image.alt = copy.photoAlt(pageIndex * 12 + photoIndex + 1);
      tile.append(image);
      grid.append(tile);
    });
    sheet.append(grid);
    reportDocument.append(sheet);
  });
}

languageToggle.addEventListener("click", () => {
  setInterfaceLanguage(interfaceLanguage === "en" ? "ja" : "en");
});

document.querySelector("#add-product").addEventListener("click", () => {
  productEntries.push({ name: "", manufacturer: "", price: "", usage: "", reaction: "" });
  renderProductEntries();
  invalidateReport();
  productEntryList.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
});

productEntryList.addEventListener("input", (event) => {
  const control = event.target;
  const index = Number(control.dataset.productIndex);
  const field = control.dataset.productField;
  if (Number.isInteger(index) && field && productEntries[index]) {
    productEntries[index][field] = control.value;
  }
});

photoInput.addEventListener("change", () => addSelectedPhotos(photoInput.files));

form.addEventListener("input", () => {
  invalidateReport();
  clearStatus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearStatus();
  if (!form.reportValidity()) {
    showStatus(messages[interfaceLanguage].required, true);
    form.querySelector(":invalid")?.focus();
    return;
  }

  createReportButton.disabled = true;
  try {
    renderReport();
    reportPreview.hidden = false;
    showStatus(messages[interfaceLanguage].ready);
    reportPreview.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Could not generate the report.", error);
    showStatus(interfaceLanguage === "ja"
      ? "報告書を作成できませんでした。入力内容を確認して、もう一度お試しください。"
      : "The report could not be created. Check the entered information and try again.", true);
  } finally {
    createReportButton.disabled = false;
  }
});

document.querySelector("#print-report").addEventListener("click", () => window.print());

document.querySelector("#send-email").addEventListener("click", () => {
  const copy = messages[interfaceLanguage];
  const body = buildRawReport();
  const url = `mailto:${EMAIL_DESTINATION}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(body)}`;
  if (url.length > 7000) {
    showStatus(copy.emailTooLong, true);
    return;
  }
  showStatus(copy.emailOpened);
  openMessageApp(url);
});

document.querySelector("#send-text").addEventListener("click", () => {
  const copy = messages[interfaceLanguage];
  const body = buildRawReport();
  if (body.length > 1200) {
    showStatus(copy.textTooLong, true);
    return;
  }
  const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const separator = isAppleDevice ? "&" : "?";
  const url = `sms:${TEXT_DESTINATION}${separator}body=${encodeURIComponent(body)}`;
  showStatus(copy.textOpened);
  openMessageApp(url);
});

document.querySelector("#download-raw").addEventListener("click", downloadRawReport);

setInterfaceLanguage(interfaceLanguage);
renderPhotoGrid();
document.querySelector('[name="eventDate"]').value = new Date().toLocaleDateString("en-CA");
