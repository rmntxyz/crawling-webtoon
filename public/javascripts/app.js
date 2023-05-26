window.onload = function () {
  var options = {
    valueNames: ["title", "author", "rating"],
  };

  var list = new List("webtoonList", options);

  const webtoonList = document.querySelectorAll("#webtoonList > ul > li");
  const wrapper = document.querySelector(".wrapper");

  let selected = null;

  async function selectWebtoon(event) {
    let li = event.target;
    if (li.tagName !== "LI") {
      li = li.closest("li");
    }

    const id = li.dataset.id;
    const res = await fetch(`/webtoon/${id}`);
    const html = await res.text();
    wrapper.innerHTML = html;

    if (selected) {
      selected.classList.remove("selected");
    }
    li.classList.add("selected");
    selected = li;

    wrapper.scrollIntoView();
  }

  webtoonList.forEach((li) => li.addEventListener("click", selectWebtoon));

  // 첫 번째 웹툰 선택
  const firstWebtoon = webtoonList[0];
  firstWebtoon.click();

  const query = document.querySelector("input.search");
  const main = document.querySelector("ul.list");

  // Find all text nodes in the main element.
  const treeWalker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const allTextNodes = [];
  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    allTextNodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  query.addEventListener("input", () => {
    CSS.highlights.clear();

    const str = query.value.trim().toLowerCase();
    if (!str) {
      return;
    }

    const ranges = allTextNodes
      .map((el) => {
        return { el, text: el.textContent.toLowerCase() };
      })
      .filter(({ text }) => text.includes(str))
      .map(({ text, el }) => {
        // Find all instances of str in el.textContent
        const indices = [];
        let startPos = 0;
        while (startPos < text.length) {
          const index = text.indexOf(str, startPos);
          if (index === -1) break;
          indices.push(index);
          startPos = index + str.length;
        }

        return indices.map((index) => {
          const range = new Range();
          range.setStart(el, index);
          range.setEnd(el, index + str.length);
          return range;
        });
      });

    const highlight = new Highlight(...ranges.flat());
    CSS.highlights.set("search-result-highlight", highlight);
  });
};
