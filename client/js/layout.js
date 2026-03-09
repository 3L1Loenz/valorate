async function loadPartial(selector, filePath) {
  const element = document.querySelector(selector);
  if (!element) return;

  try {
    const response = await fetch(filePath);
    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Failed to load partial: ${filePath}`, error);
  }
}

async function loadLayout() {
  await loadPartial("#site-head", "/partials/head.html");
  await loadPartial("#site-navbar", "/partials/navbar.html");
  await loadPartial("#site-footer", "/partials/footer.html");

  const pageTitle = document.body.dataset.title;
  if (pageTitle) {
    document.title = pageTitle;
  }

  const metaDescription = document.body.dataset.description;
  if (metaDescription) {
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", metaDescription);
  }

  const ogTitle = document.body.dataset.ogTitle || pageTitle;
  if (ogTitle) {
    updateMetaProperty("og:title", ogTitle);
    updateMetaName("twitter:title", ogTitle);
  }

  const ogDescription = document.body.dataset.ogDescription || metaDescription;
  if (ogDescription) {
    updateMetaProperty("og:description", ogDescription);
    updateMetaName("twitter:description", ogDescription);
  }

  const ogUrl = document.body.dataset.ogUrl;
  if (ogUrl) {
    updateMetaProperty("og:url", ogUrl);
  }
}

function updateMetaProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateMetaName(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

loadLayout();