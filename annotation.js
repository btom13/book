window.addEventListener("DOMContentLoaded", () => {
  const api = "http://localhost:5000/";
  // const api = "https://a06c-2607-f140-6000-f-dbd-7c97-4484-12b3.ngrok.io/";
  // const api = "https://monthlyblanduserinterface.nealconway1.repl.co/";
  const dialog = document.getElementById("question-dialog");
  const textContainer = document.getElementById("text-container");
  const annotationContainer = document.getElementById("annotation-container");
  const annotations = [];
  const annotationViewer = document.getElementById("annotation-viewer");
  // const annotationShower = document.getElementById("annotations");
  const questionButton = document.getElementById("quest");
  let currentQuestions = [];
  let paragraphs = [];
  const questions = document.getElementById("questions");
  async function getQuestions() {
    if (currentQuestions.length === 0) {
      let re = await fetch(api + "generate_questions", {
        method: "POST",
        body: JSON.stringify({
          paragraphs: paragraphs,
          book: "The Great Gatsby",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
        createAnnotation.bind(null, newNode)
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
        createImageAnnotation.bind(null, newNode)
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

  async function createAnnotation(newNode) {
    let res = await fetch(api + "text_annotation", {
      method: "POST",
      body: JSON.stringify({
        book: "The Great Gatsby",
        text: newNode.textContent,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const annotation = await res.text();

    lastHighlight = undefined;

    newNode.addEventListener(
      "mouseover",
      showAnnotation.bind(null, annotation)
    );
    newNode.addEventListener("mouseout", hideAnnotation);
    newNode.addEventListener("click", deleteAnnotation);
    // newnode position
    console.log(newNode.getBoundingClientRect());

    annotations.push({
      element: newNode,
      annotation: annotation,
      position:
        (newNode.getBoundingClientRect()["top"] +
          newNode.getBoundingClientRect()["bottom"]) /
        2,
    });
    // updateAnnotations();
    hideButtons();
  }

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
    annotationViewer.textContent = "";
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
  // fetch(api + "get_chapter?book=book.epub&href=chapter10.html", {
  //   method: "GET",
  // })
  //   .then((res) => res.text())
  //   .then((res) => {
  //     parseHTMLToPlainText(res);
  //   });

  const dropdown = document.getElementById("chapters");
  const links = [];

  fetch(api + "flattened_chapters?book=book.epub", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((data) => {
      data = JSON.parse(data);
      data.forEach((chapter) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.classList.add("dropdown-item");
        link.href = chapter.link;

        link.textContent = chapter.title;
        // links.push(chapter.link);

        listItem.appendChild(link);
        dropdown.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.log("Error fetching chapters:", error);
    });
  dropdown.addEventListener("click", (event) => {
    if (event.target.classList.contains("dropdown-item")) {
      if (lastHighlight) {
        lastHighlight.click();
        lastHighlight = undefined;
      }
      let chapterUrl = event.target.href.split("/").pop();
      // Make a GET request to fetch the chapter text
      fetch(api + "get_chapter?book=book.epub&href=" + chapterUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/text",
        },
      })
        .then((response) => response.text())
        .then((data) => {
          let html_temp = document.createElement("div");
          html_temp.style.display = "none";
          html_temp.innerHTML = data;
          let paras = html_temp.getElementsByTagName("p");
          paras = Array.from(paras);
          paras = paras.map((para) => para.innerText);
          paras = paras.filter((para) => para.length > 0);
          paras = paras.sort((a, b) => b.length - a.length);
          paragraphs = paras.slice(0, 3);
          html_temp = null;

          parseHTMLToPlainText(data);
        })
        .catch((error) => {
          console.log("Error fetching chapter text:", error);
        });

      annotations.length = 0;
      annotationViewer.innerHTML = "";
      // annotationShower.innerHTML = "";
      currentQuestions = [];
      questions.innerHTML = "";
      event.preventDefault();
    }
  });
});
