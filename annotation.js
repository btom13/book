window.addEventListener("DOMContentLoaded", () => {
  const api = "http://localhost:5000/";
  const dialog = document.getElementById("question-dialog");
  const textContainer = document.getElementById("text-container");
  const annotationContainer = document.getElementById("annotation-container");
  const annotations = [];
  const annotationViewer = document.getElementById("annotation-viewer");
  const annotationShower = document.getElementById("annotations");
  const questionButton = document.getElementById("quest");
  let currentQuestions = [];
  const questions = document.getElementById("questions");
  function getQuestions() {
    if (currentQuestions.length === 0) {
      currentQuestions = [
        "What is the main idea?",
        "What is the author's purpose?",
        "What is the author's tone?",
      ];

      for (const question of currentQuestions) {
        let words = document.createElement("p");
        words.classList.add("question");
        words.textContent = question;
        questions.appendChild(words);
        let textarea = document.createElement("textarea");
        textarea.classList.add("response");
        questions.appendChild(textarea);
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

        let query = {
          data: [
            {
              question: "...",
              answer: "...",
            },
            {
              question: "...",
              answer: "...",
            },
          ],
          chapter: 1,
        };
        // send req to backend
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
        createAnnotation.bind(null, newNode)
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

  function createAnnotation(newNode) {
    const annotation = "New Annotation";
    lastHighlight = undefined;

    newNode.addEventListener(
      "mouseover",
      showAnnotation.bind(null, annotation)
    );
    newNode.addEventListener("mouseout", hideAnnotation);
    newNode.addEventListener("click", deleteAnnotation);

    annotations.push({ element: newNode, annotation: annotation });
    updateAnnotations();
    hideButtons();
  }

  function cancelAnnotation(newNode, buttonContainer) {
    newNode.outerHTML = newNode.innerHTML;
    buttonContainer.parentNode.removeChild(buttonContainer);
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
    updateAnnotations();
  }

  function hideAnnotation() {
    annotationViewer.textContent = "";
  }

  function updateAnnotations() {
    annotationShower.innerHTML = "";
    for (const annotation of annotations) {
      annotationShower.innerHTML += annotation.annotation + "<br>";
    }
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
    var title = tempElement.getElementsByTagName("title");
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
  }
  fetch(api + "get_chapter?book=book.epub&href=chapter10.html", {
    method: "GET",
  })
    .then((res) => res.text())
    .then((res) => {
      console.log(res);
      parseHTMLToPlainText(res);
    });
});
