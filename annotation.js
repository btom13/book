window.addEventListener("DOMContentLoaded", () => {
  const api = "http://localhost:8000/";
  // const api = "https://a06c-2607-f140-6000-f-dbd-7c97-4484-12b3.ngrok.io/";
  // const api = "https://monthlyblanduserinterface.nealconway1.repl.co/";
  const dialog = document.getElementById("question-dialog");
  const textContainer = document.getElementById("text-container");
  const annotationContainer = document.getElementById("annotation-container");
  let annotations = [];
  let current_index = -1;
  const annotationViewer = document.getElementById("annotation-viewer");
  let current_chapter = undefined;
  const all_chapters = [];
  const difference = 300;
  const velocity = 500;
  let paragraphs = [];
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  const theme_button = document.getElementById("thing");
  theme_button.addEventListener("click", () => {
    document.getElementById("selector").classList.toggle("hidden");
  });
  const themes = {
    default: {
      background: "#f2f2f2",
      foreground: "#fff",
      border: "black",
      highlight: "rgb(255, 255, 156)",
      themecolor: "white",
    },
    sepia: {
      background: "#F5F0EB",
      foreground: "rgb(247,241,228)",
      border: "#D1C3B7",
      highlight: "rgb(211,204,190)",
      themecolor: "rgb(247,241,228)",
      textcolor: "#59524C",
    },
    night: {
      background: "#333333",
      foreground: "#666666",
      border: "#111111",
      highlight: "rgb(87, 87, 87)",
      themecolor: "#666666",
      textcolor: "rgb(247,241,228)",
    },
    gray: {
      background: "#222222",
      foreground: "rgb(72,72,72)",
      border: "black",
      highlight: "rgb(113, 113, 113)",
      themecolor: "rgb(72,72,72)",
      textcolor: "rgb(213,213,213)",
    },
    purple: {
      background: "rgb(8,1,32)",
      foreground: "rgb(37,40,58)",
      border: "rgb(20,22,31)",
      highlight: "rgb(63,68,80)",
      themecolor: "rgb(37,40,58)",
      textcolor: "rgb(147,150,196)",
    },
  };
  const selectors = document.getElementsByClassName("selecting");
  const root_theme = document.querySelector(":root");
  for (let i = 0; i < selectors.length; i++) {
    selectors[i].addEventListener("click", () => {
      root_theme.style.setProperty(
        "--background",
        themes[selectors[i].id].background
      );
      root_theme.style.setProperty(
        "--foreground",
        themes[selectors[i].id].foreground
      );
      root_theme.style.setProperty("--border", themes[selectors[i].id].border);
      root_theme.style.setProperty(
        "--highlight",
        themes[selectors[i].id].highlight
      );
      root_theme.style.setProperty(
        "--textcolor",
        themes[selectors[i].id].textcolor
      );
      root_theme.style.setProperty(
        "--themecolor",
        themes[selectors[i].id].themecolor
      );
    });
    selectors[i].style.backgroundColor = themes[selectors[i].id].themecolor;
  }

  const storage = {};
  function parseHTMLToPlainText(html) {
    const titleContainer = document.getElementById("chapter-title");

    var tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    var title = tempElement.getElementsByTagName("em");
    var paragraphs = tempElement.getElementsByTagName("p");
    for (var i = 0; i < paragraphs.length; i++) {
      var paragraph = paragraphs[i];
      var br = document.createElement("br");
      paragraph.parentNode.replaceChild(br, paragraph);
    }
    try {
      titleContainer.innerHTML = title[0].innerText;
      title[0].innerHTML = "";
    } catch {
      titleContainer.innerHTML = "";
    }

    var text = tempElement.innerText.replace(/\n\s*\n/g, "<br><br>").trim();

    tempElement = null;

    textContainer.innerHTML = text;
    // remove starting br
    while (
      textContainer.firstChild &&
      textContainer.firstChild.tagName === "BR"
    ) {
      textContainer.removeChild(textContainer.firstChild);
    }
  }
  fetch(api + "get_chapter?book=book.epub&href=chapter01.html", {
    method: "GET",
  })
    .then((res) => res.text())
    .then((res) => {
      parseHTMLToPlainText(res);
    });

  function reset(data, index, previous) {
    const url = all_chapters[index];
    // annotations.length = 0;
    // annotationContainer.innerHTML = "";
    // current_index = -1;
    // currentQuestions = [];
    // questions.innerHTML = "";
    if (previous) {
      const prev_url = all_chapters[previous];
      storage[prev_url]["annotations"] = annotations;
      storage[prev_url]["annotationContainerInnerHTML"] =
        annotationContainer.innerHTML;

      storage[prev_url]["current_index"] = current_index;
      storage[prev_url]["currentQuestions"] = currentQuestions;
      storage[prev_url]["questionsInnerHTML"] = questions.innerHTML;
      storage[prev_url]["paragraphs"] = paragraphs;
      storage[prev_url]["html"] = textContainer.innerHTML;
    }
    annotations = storage[url]["annotations"];
    annotationContainer.innerHTML =
      storage[url]["annotationContainerInnerHTML"];
    const annotation_divs =
      annotationContainer.querySelectorAll(".annotation-div");
    for (let i = 0; i < annotation_divs.length; i++) {
      annotations[i].element = annotation_divs[i];
    }
    current_index = storage[url]["current_index"];
    currentQuestions = storage[url]["currentQuestions"];
    questions.innerHTML = storage[url]["questionsInnerHTML"];
    let html_temp = document.createElement("div");
    html_temp.style.display = "none";
    html_temp.innerHTML = data;
    let paras = html_temp.getElementsByTagName("p");
    paras = Array.from(paras);
    paras = paras.map((para) => para.innerText);
    paras = paras.filter((para) => para.length > 0);
    paras = paras.sort((a, b) => b.length - a.length);
    paragraphs = paras.slice(0, 3);
    console.log(paras);
    console.log(paragraphs);
    if (storage[url]["paragraphs"].length > 0) {
      paragraphs = storage[url]["paragraphs"];
    }
    html_temp = null;
    if (storage[url]["html"] !== undefined && storage[url]["html"] !== "") {
      textContainer.innerHTML = storage[url]["html"];
      const highlights = Array.from(
        textContainer.getElementsByClassName("highlight")
      );
      highlights.forEach((newNode) => {
        newNode.addEventListener("mouseover", () => {
          let index = annotations.findIndex(
            (item) =>
              // item.newNode.offsetTop == newNode.offsetTop &&
              // item.newNode.offsetLeft == newNode.offsetLeft &&
              item.newNode.innerHTML == newNode.innerHTML
          );
          moveAnnotationsTo(index);
        });
      });
    } else {
      parseHTMLToPlainText(data);
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }

  prev.addEventListener("click", () => {
    if (current_chapter === undefined) {
      return;
    }
    if (current_chapter === 0) {
      return;
    }
    current_chapter--;
    fetch(
      api + "get_chapter?book=book.epub&href=" + all_chapters[current_chapter],
      {
        method: "GET",
        headers: {
          "Content-Type": "application/text",
        },
      }
    )
      .then((response) => response.text())
      .then((data) => {
        reset(data, current_chapter, current_chapter + 1);
      })
      .catch((error) => {
        console.log("Error fetching chapter text:", error);
      });
  });
  next.addEventListener("click", () => {
    if (current_chapter === undefined) {
      return;
    }
    if (current_chapter === all_chapters.length - 1) {
      return;
    }
    current_chapter++;
    fetch(
      api + "get_chapter?book=book.epub&href=" + all_chapters[current_chapter],
      {
        method: "GET",
        headers: {
          "Content-Type": "application/text",
        },
      }
    )
      .then((response) => response.text())
      .then((data) => {
        reset(data, current_chapter, current_chapter - 1);
      })
      .catch((error) => {
        console.log("Error fetching chapter text:", error);
      });
  });
  // const annotationShower = document.getElementById("annotations");
  const questionButton = document.getElementById("quest");
  let currentQuestions = [];
  // let paragraphs = [];
  const questions = document.getElementById("questions");
  async function getQuestions() {
    if (currentQuestions.length === 0) {
      showLoadingIcon();
      let re = await fetch(api + "generate_questions", {
        method: "POST",
        body: JSON.stringify({
          paragraphs: paragraphs,
          book: "The Grapes of Wrath",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      hideLoadingIcon();
      currentQuestions = await re.json();

      for (const question of currentQuestions) {
        let words = document.createElement("p");
        words.classList.add("question");
        words.textContent = question;
        questions.appendChild(words);
        let textarea = document.createElement("textarea");
        textarea.classList.add("response");
        questions.appendChild(textarea);
        let div = document.createElement("div");
        div.classList.add("feedback");
        questions.appendChild(div);
      }
      let submit = document.createElement("button");
      submit.textContent = "Submit";
      submit.classList.add("submit");
      questions.appendChild(submit);
      submit.addEventListener("click", async () => {
        let responses = questions.getElementsByClassName("response");
        let res = [];
        for (let i = 0; i < responses.length; i++) {
          res.push(responses[i].value);
        }
        let response = [];
        for (let i = 0; i < paragraphs.length; i++) {
          response.push({
            question: currentQuestions[i],
            user_answer: res[i],
            paragraph: paragraphs[i],
          });
        }

        let re = await fetch(api + "grade_questions", {
          method: "POST",
          body: JSON.stringify({
            data: response,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        let r = await re.json();
        let feedback = questions.getElementsByClassName("feedback");
        for (let i = 0; i < feedback.length; i++) {
          feedback[i].textContent = r[i];
        }
      });
    }
  }

  questionButton.addEventListener("click", () => {
    getQuestions();
    dialog.show();
  });
  const dialogClose = document.getElementById("close-dialog");
  dialogClose.addEventListener("click", () => {
    dialog.close();
  });
  let lastHighlight;
  textContainer.addEventListener("mousedown", () => {
    if (lastHighlight) {
      lastHighlight.click();
      lastHighlight = undefined;
    }
  });

  textContainer.addEventListener("mouseup", handleTextSelection);

  function handleTextSelection(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText !== "") {
      if (lastHighlight) {
        lastHighlight.click();
        lastHighlight = undefined;
      }
      const range = window.getSelection().getRangeAt(0);
      const newNode = document.createElement("span");
      newNode.classList.add("highlight");
      range.surroundContents(newNode);

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const annotationButton = document.createElement("button");
      const icon = document.createElement("i");
      icon.classList.add("fa-regular", "fa-comment-dots");
      // annotationButton.textContent = "💬";
      annotationButton.appendChild(icon);
      annotationButton.classList.add("annotation-button");
      annotationButton.addEventListener(
        "click",
        createAnnotation.bind(null, newNode, "text")
      );

      const imageButton = document.createElement("button");
      let icon2 = document.createElement("i");
      // <i class='fa-thin fa-image'></i>;
      icon2.classList.add("fa", "fa-image");
      imageButton.appendChild(icon2);
      // imageButton.textContent = "Image Button";
      imageButton.classList.add("image-button");
      imageButton.addEventListener(
        "click",
        createAnnotation.bind(null, newNode, "image")
      );

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "Cancel";
      cancelButton.classList.add("cancel-button");
      cancelButton.addEventListener(
        "click",
        cancelAnnotation.bind(null, newNode, buttonContainer)
      );
      lastHighlight = cancelButton;

      buttonContainer.appendChild(annotationButton);
      buttonContainer.appendChild(imageButton);
      cancelButton.style.display = "none";
      buttonContainer.appendChild(cancelButton);
      positionButtons(buttonContainer, event.clientX, event.clientY);

      document.body.appendChild(buttonContainer);

      window.getSelection().removeAllRanges();
    }
  }

  function showLoadingIcon() {
    document.querySelector(".loading-icon").style.display = "block";
  }

  function hideLoadingIcon() {
    document.querySelector(".loading-icon").style.display = "none";
  }

  async function createAnnotation(newNode, type) {
    let annotation;
    showLoadingIcon();
    if (type == "text") {
      let res = await fetch(api + "text_annotation", {
        method: "POST",
        body: JSON.stringify({
          book: "The Grapes of Wrath",
          text: newNode.textContent,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      hideLoadingIcon();
      annotation = await res.text();
      // annotation = newNode.textContent;
    } else {
      let res = await fetch(api + "image_annotation", {
        method: "POST",
        body: JSON.stringify({
          text: newNode.textContent,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      hideLoadingIcon();
      annotation = await res.text();
    }

    const annotationDiv = document.createElement("div");
    annotationDiv.classList.add("annotation-div");
    if (type == "text") {
      const annotationText = document.createElement("div");
      annotationText.classList.add("annotation-text");
      annotationText.textContent = annotation;
      annotationDiv.appendChild(annotationText);
    } else {
      const annotationImage = document.createElement("img");
      annotationImage.classList.add("annotation-image");
      annotationDiv.classList.add("annotation-image");
      annotationImage.src = "data:image/png;base64," + annotation;
      annotationDiv.appendChild(annotationImage);
    }
    annotationContainer.appendChild(annotationDiv);
    lastHighlight = undefined;

    newNode.addEventListener("mouseover", () => {
      let index = annotations.findIndex((item) => item.newNode === newNode);
      moveAnnotationsTo(index);
    });
    newNode.addEventListener("mouseout", hideAnnotation);
    newNode.addEventListener("click", deleteAnnotation);
    // newnode position
    let current = {
      newNode: newNode,
      annotation: annotation,
      position: newNode.offsetTop + newNode.offsetHeight / 2,
      x: newNode.getBoundingClientRect()["x"],
      element: annotationDiv,
    };

    annotations.push(current);
    // sort annotationContainer by position
    annotations.sort((a, b) => {
      if (a.position == b.position) return a.x - b.x;
      return a.position - b.position;
    });
    for (let i = 0; i < annotations.length; i++) {
      annotations[i].element.style.top = `${difference * i}px`;
    }
    let index = annotations.findIndex((item) => item === current);
    const center = document.body.getBoundingClientRect().height / 2;

    let movement = annotations[index].element.offsetTop - center;
    for (let i = 0; i < annotations.length; i++) {
      annotations[i].element.style.top = `${
        annotations[i].element.offsetTop - movement
      }px`;
    }
    annotationContainer.innerHTML = "";
    annotations.forEach((annotation) => {
      annotationContainer.appendChild(annotation.element);
    });

    // updateAnnotations();
    hideButtons();
  }

  let current_animation = undefined;
  function moveAnnotationsTo(index) {
    if (index === current_index) return;
    current_index = index;
    if (current_animation) {
      current_animation.remove(".annotation-div");
    }
    const center = document.body.getBoundingClientRect().height / 2;
    let movement = annotations[index].element.offsetTop - center;
    current_animation = anime({
      targets: ".annotation-div",
      top: `-=${movement}`,
      // duration: 800,
      duration: ((Math.abs(movement) / velocity) * 1000) / 1.2,
      easing: "cubicBezier(0.595, 0.950, 0.640, 1.240)",
    });
    current_animation.finished.then(() => {
      current_animation = undefined;
    });
  }
  let last_scroll = undefined;
  window.addEventListener("scroll", () => {
    if (last_scroll && Date.now() - last_scroll < 100) {
      return;
    }
    last_scroll = Date.now();
    if (annotations.length === 0) return;
    // look for closest annotation
    let currentScroll =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.body.offsetHeight / 2;
    let closest = 0;
    let closest_distance = 9999999;
    for (let i = 0; i < annotations.length; i++) {
      let distance = Math.abs(currentScroll - annotations[i].position);
      if (distance < closest_distance) {
        closest_distance = distance;
        closest = i;
      }
    }
    moveAnnotationsTo(closest);
  });

  async function createImageAnnotation(newNode) {
    let res = await fetch(api + "image_annotation", {
      method: "POST",
      body: JSON.stringify({
        text: newNode.textContent,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const url = await res.text();

    lastHighlight = undefined;

    newNode.addEventListener("mouseover", showImage.bind(null, url));
    newNode.addEventListener("mouseout", hideAnnotation);
    newNode.addEventListener("click", deleteAnnotation);

    annotations.push({ element: newNode, url: url });
    // updateAnnotations();
    hideButtons();
  }

  function cancelAnnotation(newNode, buttonContainer) {
    newNode.outerHTML = newNode.innerHTML;
    buttonContainer.parentNode.removeChild(buttonContainer);
  }
  function showImage(url) {
    annotationViewer.innerHTML = `<img src="${url}">`;
  }

  function showAnnotation(annotation) {
    annotationViewer.textContent = annotation;
  }

  function deleteAnnotation(event) {
    const deletedNode = event.target;
    const index = annotations.findIndex((item) => item.element === deletedNode);

    if (index !== -1) {
      const annotation = annotations[index];
      annotation.element.outerHTML = annotation.element.innerHTML;
      annotations.splice(index, 1);
      event.stopPropagation();
    }
    hideAnnotation();
    // updateAnnotations();
  }

  function hideAnnotation() {
    // annotationViewer.textContent = "";
  }

  function updateAnnotations() {
    // annotationShower.innerHTML = "";
    // for (const annotation of annotations) {
    //   if (annotation.annotation) {
    //     annotationShower.innerHTML += annotation.annotation + "<br>";
    //   } else {
    //     annotationShower.innerHTML += `<img src=${annotation.url}>` + "<br>";
    //   }
    // }
  }

  function positionButtons(buttonContainer, x, y) {
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    buttonContainer.style.position = "absolute";
    buttonContainer.style.left = `${x + scrollX}px`;
    buttonContainer.style.top = `${y + scrollY}px`;
  }

  function hideButtons() {
    const buttonContainer = document.querySelector(".button-container");
    if (buttonContainer) {
      buttonContainer.parentNode.removeChild(buttonContainer);
    }
  }

  function addEllipsis(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }

  const dropdown = document.getElementById("chapters");

  fetch(api + "flattened_chapters?book=book.epub", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((data) => {
      data = JSON.parse(data);
      data.forEach((chapter) => {
        storage[chapter.link] = {
          title: chapter.title,
          annotations: [],
          annotationContainerInnerHTML: "",
          current_index: -1,
          currentQuestions: [],
          questionsInnerHTML: "",
          paragraphs: [],
          html: "",
        };
        all_chapters.push(chapter.link);
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.classList.add("dropdown-item");
        link.href = chapter.link;

        link.textContent = addEllipsis(chapter.title, 15);

        listItem.appendChild(link);
        dropdown.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.log("Error fetching chapters:", error);
    });
  dropdown.addEventListener("click", (event) => {
    event.preventDefault();

    if (event.target.classList.contains("dropdown-item")) {
      if (lastHighlight) {
        lastHighlight.click();
        lastHighlight = undefined;
      }
      let chapterUrl = event.target.href.split("/").pop();
      previous_chapter = current_chapter;
      current_chapter = all_chapters.indexOf(chapterUrl);

      // Make a GET request to fetch the chapter text
      fetch(api + "get_chapter?book=book.epub&href=" + chapterUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/text",
        },
      })
        .then((response) => response.text())
        .then((data) => {
          reset(data, current_chapter, previous_chapter);
        })
        .catch((error) => {
          console.log("Error fetching chapter text:", error);
        });
    }
  });
});
