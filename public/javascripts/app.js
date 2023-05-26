window.onload = function () {
  var options = {
    valueNames: ["title", "rating"],
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
  console.log(webtoonList);

  // 첫 번째 웹툰 선택
  const firstWebtoon = webtoonList[0];
  firstWebtoon.click();
};
