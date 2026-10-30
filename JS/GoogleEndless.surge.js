// Google Endless Search (auto-pagination) for Surge
// Based on Endless Google by tumpio (MIT) / ddgksf2013 adaptation
// Injects infinite scroll script into Google search result pages.

let body = $response.body;

if (body && /<\/html>|<\/body>/i.test(body)) {
  body = body.replace(/<\/body>/i, `
<script>
(function(){
  if (location.href.indexOf("tbm=isch") !== -1) return; // skip image search
  if (window.top !== window.self) return; // skip iframes

  const centerElement = "#center_col";
  const loadWindowSize = 1.6;
  const filtersAll = ["#foot", "#bottomads"];
  const filtersCol = filtersAll.concat(["#extrares", "#imagebox_bigimages"]);
  let msg = null;

  const css = \`
.page-number {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  margin-bottom: 2em;
  color: #808080;
}
.page-number::before {
  content: "";
  background-color: #ededed;
  height: 1px;
  width: 100%;
  margin: 1em 3em;
}
.endless-msg {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 5px 10px;
  background: darkred;
  color: white;
  font-size: 11px;
  display: none;
  z-index: 9999;
}
.endless-msg.shown {
  display: block;
}
\`;

  let pageNumber = 1;
  let prevScrollY = 0;
  let nextPageLoading = false;

  function requestNextPage() {
    nextPageLoading = true;
    let nextPage = new URL(location.href);
    if (!nextPage.searchParams.has("q")) return;

    nextPage.searchParams.set("start", String(pageNumber * 10));
    if (msg && !msg.classList.contains("shown")) msg.classList.add("shown");

    fetch(nextPage.href)
      .then(response => response.text())
      .then(text => {
        let parser = new DOMParser();
        let htmlDocument = parser.parseFromString(text, "text/html");
        let content = htmlDocument.documentElement.querySelector(centerElement);
        if (!content) {
          nextPageLoading = false;
          if (msg) msg.classList.remove("shown");
          return;
        }

        content.id = "col_" + pageNumber;
        filter(content, filtersCol);

        let pageMarker = document.createElement("div");
        pageMarker.textContent = String(pageNumber + 1);
        pageMarker.className = "page-number";

        let col = document.createElement("div");
        col.className = "next-col";
        col.appendChild(pageMarker);
        col.appendChild(content);
        const main = document.querySelector(centerElement);
        if (main) main.appendChild(col);

        if (!content.querySelector("#rso")) {
          // end of results
          window.removeEventListener("scroll", onScrollDocumentEnd);
          nextPageLoading = false;
          if (msg) msg.classList.remove("shown");
          return;
        }

        pageNumber++;
        nextPageLoading = false;
        if (msg) msg.classList.remove("shown");
      })
      .catch(() => {
        nextPageLoading = false;
        if (msg) msg.classList.remove("shown");
      });
  }

  function onScrollDocumentEnd() {
    let y = window.scrollY;
    let delta = y - prevScrollY;
    if (!nextPageLoading && delta > 0 && isDocumentEnd(y)) {
      requestNextPage();
    }
    prevScrollY = y;
  }

  function isDocumentEnd(y) {
    return y + window.innerHeight * loadWindowSize >= document.body.clientHeight;
  }

  function filter(node, filters) {
    for (let filter of filters) {
      let child = node.querySelector(filter);
      if (child && child.parentNode) {
        child.parentNode.removeChild(child);
      }
    }
  }

  function init() {
    prevScrollY = window.scrollY;
    window.addEventListener("scroll", onScrollDocumentEnd);
    filter(document, filtersAll);
    let style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    msg = document.createElement("div");
    msg.className = "endless-msg";
    msg.innerText = "Loading next page...";
    document.body.appendChild(msg);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>
</body>`);
}

$done({ body });
