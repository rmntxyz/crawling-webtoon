window.onload = function () {
  // 카테고리
  const category = document.querySelector("#selectBox");

  selectBox.addEventListener("change", function () {
    var path = selectBox.value;
    window.location = path;
  });

  // 검색 기능
  const options = {
    valueNames: ["title", "author", "state", "index", "view", "rating", "fav"],
  };
  const list = new List("webtoonList", options);

  // 리스트 선택 기능
  const webtoonList = document.querySelectorAll("#webtoonList > ul > li");
  const wrapper = document.querySelector(".wrapper");

  let selected = null;
  let isBest = window.location.pathname === "/best";

  async function selectWebtoon(event) {
    let li = event.target;
    while (li.tagName !== "LI") {
      li = li.closest("li");
    }

    const id = li.dataset.id;
    let url = `/webtoon/${id}`;
    if (isBest) {
      url += "?best=true";
    }
    const res = await fetch(url);
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

  // 즐겨찾기 기능
  const storage = window.localStorage;
  const itemName = isBest ? "best_favorite" : "webtoon_favorite";
  const data = storage.getItem(itemName);
  const favorite = JSON.parse(data) || [];
  const setFavorite = (id) => {
    const index = favorite.indexOf(id);
    if (index === -1) {
      favorite.push(id);
    } else {
      favorite.splice(index, 1);
    }
    storage.setItem(itemName, JSON.stringify(favorite));
  };

  const stars = document.querySelectorAll("ul.list i.fa-star");
  stars.forEach((star) => {
    const li = star.closest("li");
    while (li.tagName !== "LI") {
      li = li.closest("li");
    }

    const id = li.dataset.id;
    if (favorite.includes(id)) {
      star.classList.add("active");
      star.innerHTML = "★";
    } else {
      star.classList.remove("active");
      star.innerHTML = "☆";
    }

    star.addEventListener("click", (e) => {
      e.stopPropagation();
      setFavorite(id);
      if (star.classList.contains("active")) {
        star.classList.remove("active");
        star.innerHTML = "☆";
      } else {
        star.classList.add("active");
        star.innerHTML = "★";
      }
      list.reIndex();
    });
  });
  list.reIndex();

  // 결과 표시 기능
  const total = document.querySelector("#total");
  const totalNum = document.querySelector("#totalNum");
  const searched = document.querySelector("#searched");
  const searchedNum = document.querySelector("#searchedNum");
  const searchedSuffix = document.querySelector("#searchedSuffix");
  const notFound = document.querySelector("#notFound");
  const totalCount = webtoonList.length;
  totalNum.innerHTML = totalCount;
  searchedSuffix.innerHTML = ` / ${totalCount} searched`;

  function updateResult() {
    const current = document.querySelectorAll("#webtoonList > ul > li").length;
    if (current === 0) {
      total.classList.add("hidden");
      searched.classList.add("hidden");
      notFound.classList.remove("hidden");
    } else if (current === totalCount) {
      total.classList.remove("hidden");
      searched.classList.add("hidden");
      notFound.classList.add("hidden");
    } else {
      searchedNum.innerHTML = current;
      total.classList.add("hidden");
      searched.classList.remove("hidden");
      notFound.classList.add("hidden");
    }
  }
  updateResult();

  // 검색 하이라이트 기능
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
    setTimeout(() => {
      CSS.highlights.clear();

      updateResult();

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
    }, 200);
  });
};
