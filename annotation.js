window.addEventListener("DOMContentLoaded", () => {
  const api = "http://localhost:5000";
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
        "What is the main idea?What is the main idea?What is the main idea?What is the main idea?What is the main idea?What is the main idea?What is the main idea?What is the main idea?",
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
    titleContainer.innerHTML = title[0].innerText;
    title[0].innerHTML = "";

    var text = tempElement.innerText.replace(/\n\s*\n/g, "<br><br>").trim();

    tempElement = null;

    textContainer.innerHTML = text;
  }

  parseHTMLToPlainText(`<?xml version="1.0" encoding="UTF-8" standalone="no"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:svg="http://www.w3.org/2000/svg" xml:lang="en-gb">
<head>
<title>Chapter 10</title>
<link href="9780141185064.css" rel="stylesheet" type="text/css"/>
<link href="page-template.xpgt" rel="stylesheet" type="application/vnd.adobe-page-template+xml"/>
<meta name="Inept.resource" content="urn:uuid:00000000-0000-0000-0000-000000000000"/>
</head>
<body>
<h2 id="page_94"><a id="ch10"/><em>Chapter 10</em></h2>
<p class="No-indent">When the truck had gone, loaded with implements, with heavy tools, with beds and springs, with every movable thing that might be sold, Tom hung around the place. He mooned into the barn shed, into the empty stalls, and he walked into the implement lean-to and kicked the refuse that was left, turned a broken mower tooth with his foot. He visited places he remembered—the red bank where the swallows nested, the willow tree over the pig pen. Two shoats grunted and squirmed at him through the fence, black pigs, sunning and comfortable. And then his pilgrimage was over, and he went to sit on the doorstep where the shade was lately fallen. Behind him Ma moved about in the kitchen, washing children’s clothes in a bucket; and her strong freckled arms dripped soapsuds from the elbows. She stopped her rubbing when he sat down. She looked at him a long time, and at the back of his head when he turned and stared out at the hot sunlight. And then she went back to her rubbing.</p>
<p class="indent">She said, “Tom, I hope things is all right in California.”</p>
<p class="indent">He turned and looked at her. “What makes you think they ain’t?” he asked.</p>
<p class="indent">“Well—nothing. Seems too nice, kinda. I seen the han’bills fellas pass out, an’ how much work they is, an’ high wages an’ all; an’ I seen in the paper how they want folks to come an’ pick grapes an’ oranges an’ peaches. That’d be nice work, Tom, pickin’ peaches. Even if they wouldn’t let you eat none, you could maybe snitch a little ratty one sometimes. An’ it’d be nice under the trees, workin’ in the shade. I’m scared of stuff so nice. I ain’t got faith. I’m scared somepin ain’t so nice about it.”</p>
<p class="indent">Tom said, “Don’t roust your faith bird-high an’ you won’t do no crawlin’ with the worms.”</p>
<p class="indent" id="page_95">“I know that’s right. That’s Scripture, ain’t it?”</p>
<p class="indent">“I guess so,” said Tom. “I never could keep Scripture straight sence I read a book name’ <em>The Winning of Barbara Worth</em>.”</p>
<p class="indent">Ma chuckled lightly and scrounged the clothes in and out of the bucket. And she wrung out overalls and shirts, and the muscles of her forearms corded out. “Your Pa’s pa, he quoted Scripture all the time. He got it all roiled up, too. It was the <em>Dr. Miles’ Almanac</em> he got mixed up. Used to read ever’ word in that almanac out loud—letters from folks that couldn’t sleep or had lame backs. An’ later he’d give them people for a lesson, an’ he’d say, ‘That’s a par’ble from Scripture.’ Your Pa an’ Uncle John troubled ’im some about it when they’d laugh.” She piled wrung clothes like cord wood on the table. “They say it’s two thousan’ miles where we’re goin’. How far ya think that is, Tom? I seen it on a map, big mountains like on a post card, an’ we’re goin’ right through ’em. How long ya s’pose it’ll take to go that far, Tommy?”</p>
<p class="indent">“I dunno,” he said. “Two weeks, maybe ten days if we got luck. Look, Ma, stop your worryin’.I’m a-gonna tell you somepin about bein’ in the pen. You can’t go thinkin’ when you’re gonna be out. You’d go nuts. You got to think about that day, an’ then the nex’ day, about the ball game Sat’dy. That’s what you got to do. Ol’ timers does that. A new young fella gets buttin’ his head on the cell door. He’s thinkin’ how long it’s gonna be. Whyn’t you do that? Jus’ take ever’ day.”</p>
<p class="indent">“That’s a good way,” she said, and she filled up her bucket with hot water from the stove, and she put in dirty clothes and began punching them down into the soapy water. “Yes, that’s a good way. But I like to think how nice it’s gonna be, maybe, in California. Never cold. An’ fruit ever’place, an’ people just bein’ in the nicest places, little white houses in among the orange trees. I wonder—that is, if we all get jobs an’ all work—maybe we can get one of them little white houses. An’ the little fellas go out an’ pick oranges right off the tree. They ain’t gonna be able to stand it, they’ll get to yellin’ so.”</p>
<p class="indent">Tom watched her working, and his eyes smiled. “It done you good jus’ thinkin’ about it. I knowed a fella from California. He didn’t talk like us. You’d of knowed he come from some far-off place jus’ the way he talked. But he says they’s too many folks lookin’ for work right there now. An’ he says the folks that pick the fruit live in dirty ol’ camps an’ <a id="page_96"/> don’t hardly get enough to eat. He says wages is low an’ hard to get any.”</p>
<p class="indent">A shadow crossed her face. “Oh, that ain’t so,” she said. “Your father got a han’bill on yella paper, tellin’ how they need folks to work. They wouldn’t go to that trouble if they wasn’t plenty work. Costs ’em good money to get them han’-bills out. What’d they want ta lie for, an’ costin’ ’em money to lie?”</p>
<p class="indent">Tom shook his head. “I don’ know, Ma. It’s kinda hard to think why they done it. Maybe —” He looked out at the hot sun, shining on the red earth.</p>
<p class="indent">“Maybe what?”</p>
<p class="indent">“Maybe it’s nice, like you says. Where’d Grampa go? Where’d the preacher go?”</p>
<p class="indent">Ma was going out of the house, her arms loaded high with the clothes. Tom moved aside to let her pass. “Preacher says he’s gonna walk aroun’. Grampa’s asleep here in the house. He comes in here in the day an’ lays down sometimes.” She walked to the line and began to drape pale blue jeans and blue shirts and long gray underwear over the wire.</p>
<p class="indent">Behind him Tom heard a shuffling step, and he turned to look in. Grampa was emerging from the bedroom, and as in the morning, he fumbled with the buttons of his fly. “I heerd talkin’,” he said. “Sons-a-bitches won’t let a ol’ fella sleep. When you bastards get dry behin’ the ears, you’ll maybe learn to let a ol’ fella sleep.” His furious fingers managed to flip open the only two buttons on his fly that had been buttoned. And his hand forgot what it had been trying to do. His hand reached in and contentedly scratched under the testicles. Ma came in with wet hands, and her palms puckered and bloated from hot water and soap.</p>
<p class="indent">“Thought you was sleepin’. Here, let me button you up.” And though he struggled, she held him and buttoned his underwear and his shirt and his fly. “You go aroun’ a sight,” she said, and let him go.</p>
<p class="indent">And he spluttered angrily, “Fella’s come to a nice—to a nice—when somebody buttons ’em. I want ta be let be to button my own pants.”</p>
<p class="indent">Ma said playfully, “They don’t let people run aroun’ with their clothes unbutton’ in California.”</p>
<p class="indent">“They don’t, hey! Well, I’ll show ’em. They think they’re gonna show <a id="page_97"/> me how to act out there? Why, I’ll go aroun’ a-hangin’ out if I wanta!”</p>
<p class="indent">Ma said, “Seems like his language gets worse ever’ year. Showin’ off, I guess.”</p>
<p class="indent">The old man thrust out his bristly chin, and he regarded Ma with his shrewd, mean, merry eyes. “Well, sir,” he said, “we’ll be a-startin’ ’fore long now. An’, by God, they’s grapes out there, just a-hangin’ over inta the road. Know what I’m a-gonna do? I’m gonna pick me a wash tub full a grapes, an’ I’m gonna set in ’em, an’ scrooge aroun’, an’ let the juice run down my pants.”</p>
<p class="indent">Tom laughed. “By God, if he lives to be two hunderd you never will get Grampa house broke,” he said. “You’re all set on goin’, ain’t you, Grampa?”</p>
<p class="indent">The old man pulled out a box and sat down heavily on it. “Yes, sir,” he said. “An’ goddamn near time, too. My brother went on out there forty years ago. Never did hear nothin’ about him. Sneaky son-of-a-bitch, he was. Nobody loved him. Run off with a single-action Colt of mine. If I ever run across him or his kids, if he got any out in California, I’ll ask ’em for that Colt. But if I know ’im, an’ he got any kids, he cuckoo’d ’em, an’ somebody else is a-raisin’ ’em. I sure will be glad to get out there. Got a feelin’ it’ll make a new fella outa me. Go right to work in the fruit.”</p>
<p class="indent">Ma nodded. “He means it, too,” she said. “Worked right up to three months ago, when he throwed his hip out the last time.”</p>
<p class="indent">“Damn right,” said Grampa.</p>
<p class="indent">Tom looked outward from his seat on the doorstep. “Here comes that preacher, walkin’ aroun’ from the back side a the barn.”</p>
<p class="indent">Ma said, “Curiousest grace I ever heerd, that he give this mornin’. Wasn’t hardly no grace at all. Jus’ talkin’, but the sound of it was like a grace.”</p>
<p class="indent">“He’s a funny fella,” said Tom. “Talks funny all the time. Seems like he’s talkin’ to hisself, though. He ain’t tryin’ to put nothin’ over.”</p>
<p class="indent">“Watch the look in his eye,” said Ma. “He looks baptized. Got that look they call lookin’ through. He sure looks baptized. An’ a-walkin’ with his head down, a-starin’ at nothin’ on the groun’. There <em>is</em> a man that’s baptized.” And she was silent, for Casy had drawn near the door.</p>
<p class="indent">“You gonna get sun-shook, walkin’ around like that,” said Tom.</p>
<p class="indent" id="page_98">Casy said, “Well, yeah—maybe.” He appealed to them all suddenly, to Ma and Grampa and Tom. “I got to get goin’ west. I got to go. I wonder if I kin go along with you folks.” And then he stood, embarrassed by his own speech.</p>
<p class="indent">Ma looked to Tom to speak, because he was a man, but Tom did not speak. She let him have the chance that was his right, and then she said, “Why, we’d be proud to have you. ’Course I can’t say right now; Pa says all the men’ll talk tonight and figger when we gonna start. I guess maybe we better not say till all the men come. John an’ Pa an’ Noah an’ Tom an’ Grampa an’ Al an’ Connie, they’re gonna figger soon’s they get back. But if they’s room I’m pretty sure we’ll be proud to have ya.”</p>
<p class="indent">The preacher sighed. “I’ll go anyways,” he said. “Somepin’s happening. I went up an’ I looked, an’ the houses is all empty, an’ the lan’ is empty, an’ this whole country is empty. I can’t stay here no more. I got to go where the folks is goin’.I’ll work in the fiel’s, an’ maybe I’ll be happy.”</p>
<p class="indent">“An’ you ain’t gonna preach?” Tom asked.</p>
<p class="indent">“I ain’t gonna preach.”</p>
<p class="indent">“An’ you ain’t gonna baptize?” Ma asked.</p>
<p class="indent">“I ain’t gonna baptize. I’m gonna work in the fiel’s, in the green fiel’s, an’ I’m gonna be near to folks. I ain’t gonna try to teach ’em nothin’. I’m gonna try to learn. Gonna learn why the folks walks in the grass, gonna hear ’em talk, gonna hear ’em sing. Gonna listen to kids eatin’ mush. Gonna hear husban’ an’ wife a-poundin’ the mattress in the night. Gonna eat with ’em an’ learn.” His eyes were wet and shining. “Gonna lay in the grass, open an’ honest with anybody that’ll have me. Gonna cuss an’ swear an’ hear the poetry of folks talkin’. All that’s holy, all that’s what I didn’ understan’. All them things is the good things.”</p>
<p class="indent">Ma said, “A-men.”</p>
<p class="indent">The preacher sat humbly down on the chopping block beside the door. “I wonder what they is for a fella so lonely.”</p>
<p class="indent">Tom coughed delicately. “For a fella that don’t preach no more —” he began.</p>
<p class="indent">“Oh, I’m a talker!” said Casy. “No gettin’ away from that. But I ain’t preachin’. Preachin’ is tellin’ folks stuff. I’m askin’ ’em. That ain’t preachin’, is it?”</p>
<p class="indent" id="page_99">“I don’ know,” said Tom. “Preachin’s a kinda tone a voice, an’ preachin’s a way a lookin’ at things. Preachin’s bein’ good to folks when they wanna kill ya for it. Las’ Christmus in McAlester, Salvation Army come an’ done us good. Three solid hours a cornet music, an’ we set there. They was bein’ nice to us. But if one of us tried to walk out, we’d a-drawed solitary. That’s preachin’. Doin’ good to a fella that’s down an’ can’t smack ya in the puss for it. No, you ain’t no preacher. But don’t you blow no cornets aroun’ here.”</p>
<p class="indent">Ma threw some sticks into the stove. “I’ll get you a bite now, but it ain’t much.”</p>
<p class="indent">Grampa brought his box outside and sat on it and leaned against the wall, and Tom and Casy leaned back against the house wall. And the shadow of the afternoon moved out from the house.</p>
<p class="dspace">In the late afternoon the truck came back, bumping and rattling through the dust, and there was a layer of dust in the bed, and the hood was covered with dust, and the headlights were obscured with a red flour. The sun was setting when the truck came back, and the earth was bloody in its setting light. Al sat bent over the wheel, proud and serious and efficient, and Pa and Uncle John, as befitted the heads of the clan, had the honor seats beside the driver. Standing in the truck bed, holding onto the bars of the sides, rode the others, twelve-year-old Ruthie and ten-year-old Winfield, grime-faced and wild, their eyes tired but excited, their fingers and the edges of their mouths black and sticky from licorice whips, whined out of their father in town. Ruthie, dressed in a real dress of pink muslin that came below her knees, was a little serious in her young-ladiness. But Winfield was still a trifle of a snot-nose, a little of a brooder back of the barn, and an inveterate collector and smoker of snipes. And whereas Ruthie felt the might, the responsibility, and the dignity of her developing breasts, Winfield was kid-wild and calfish. Beside them, clinging lightly to the bars, stood Rose of Sharon, and she balanced, swaying on the balls of her feet, and took up the road shock in her knees and hams. For Rose of Sharon was pregnant and careful. Her hair, braided and wrapped around her head, made an ash-blond crown. Her round soft face, which had been voluptuous and inviting a few months ago, had already put on the barrier of pregnancy, the <a id="page_100"/> self-sufficient smile, the knowing perfection-look; and her plump body—full soft breasts and stomach, hard hips and buttocks that had swung so freely and provocatively as to invite slapping and stroking—her whole body had become demure and serious. Her whole thought and action were directed inward on the baby. She balanced on her toes now, for the baby’s sake. And the world was pregnant to her; she thought only in terms of reproduction and of motherhood. Connie, her nineteen-year-old husband, who had married a plump, passionate hoyden, was still frightened and bewildered at the change in her; for there were no more cat fights in bed, biting and scratching with muffled giggles and final tears. There was a balanced, careful, wise creature who smiled shyly but very firmly at him. Connie was proud and fearful of Rose of Sharon. Whenever he could, he put a hand on her or stood close, so that his body touched her at hip and shoulder, and he felt that this kept a relation that might be departing. He was a sharp-faced, lean young man of a Texas strain, and his pale blue eyes were sometimes dangerous and sometimes kindly, and sometimes frightened. He was a good hard worker and would make a good husband. He drank enough, but not too much; fought when it was required of him; and never boasted. He sat quietly in a gathering and yet managed to be there and to be recognized.</p>
<p class="indent">Had he not been fifty years old, and so one of the natural rulers of the family, Uncle John would have preferred not to sit in the honor place beside the driver. He would have liked Rose of Sharon to sit there. This was impossible, because she was young and a woman. But Uncle John sat uneasily, his lonely haunted eyes were not at ease, and his thin strong body was not relaxed. Nearly all the time the barrier of loneliness cut Uncle John off from people and from appetites. He ate little, drank nothing, and was celibate. But underneath, his appetites swelled into pressures until they broke through. Then he would eat of some craved food until he was sick; or he would drink jake or whisky until he was a shaken paralytic with red wet eyes; or he would raven with lust for some whore in Sallisaw. It was told of him that once he went clear to Shawnee and hired three whores in one bed, and snorted and rutted on their unresponsive bodies for an hour. But when one of his appetites was sated, he was sad and ashamed and lonely again. He hid from people, <a id="page_101"/>and by gifts tried to make up to all people for himself. Then he crept into houses and left gum under pillows for children; then he cut wood and took no pay. Then he gave away any possession he might have: a saddle, a horse, a new pair of shoes. One could not talk to him then, for he ran away, or if confronted hid within himself and peeked out of frightened eyes. The death of his wife, followed by months of being alone, had marked him with guilt and shame and had left an unbreaking loneliness on him.</p>
<p class="indent">But there were things he could not escape. Being one of the heads of the family, he had to govern; and now he had to sit on the honor seat beside the driver.</p>
<p class="indent">The three men on the seat were glum as they drove toward home over the dusty road. Al, bending over the wheel, kept shifting eyes from the road to the instrument panel, watching the ammeter needle, which jerked suspiciously, watching the oil gauge and the heat indicator. And his mind was cataloguing weak points and suspicious things about the car. He listened to the whine, which might be the rear end, dry; and he listened to tappets lifting and falling. He kept his hand on the gear lever, feeling the turning gears through it. And he had let the clutch out against the brake to test for slipping clutch plates. He might be a musking goat sometimes, but this was his responsibility, this truck, its running, and its maintenance. If something went wrong it would be his fault, and while no one would say it, everyone, and Al most of all, would know it was his fault. And so he felt it, watched it, and listened to it. And his face was serious and responsible. And everyone respected him and his responsibility. Even Pa, who was the leader, would hold a wrench and take orders from Al.</p>
<p class="indent">They were all tired on the truck. Ruthie and Winfield were tired from seeing too much movement, too many faces, from fighting to get licorice whips; tired from the excitement of having Uncle John secretly slip gum into their pockets.</p>
<p class="indent">And the men in the seat were tired and angry and sad, for they had got eighteen dollars for every movable thing from the farm: the horses, the wagon, the implements, and all the furniture from the house. Eighteen dollars. They had assailed the buyer, argued; but they were routed when his interest seemed to flag and he had told them he didn’t <a id="page_102"/> want the stuff at any price. Then they were beaten, believed him, and took two dollars less than he had first offered. And now they were weary and frightened because they had gone against a system they did not understand and it had beaten them. They knew the team and the wagon were worth much more. They knew the buyer man would get much more, but they didn’t know how to do it. Merchandising was a secret to them.</p>
<p class="indent">Al, his eyes darting from road to panel board, said, “That fella, he ain’t a local fella. Didn’ talk like a local fella. Clothes was different, too.”</p>
<p class="indent">And Pa explained, “When I was in the hardware store I talked to some men I know. They say there’s fellas comin’ in jus’ to buy up the stuff us fellas got to sell when we get out. They say these new fellas is cleaning up. But there ain’t nothin’ we can do about it. Maybe Tommy should of went. Maybe he could of did better.”</p>
<p class="indent">John said, “But the fella wasn’t gonna take it at all. We couldn’ haul it back.”</p>
<p class="indent">“These men I know told about that,” said Pa. “Said the buyer fellas always done that. Scairt folks that way. We jus’ don’ know how to go about stuff like that. Ma’s gonna be disappointed. She’ll be mad an’ disappointed.”</p>
<p class="indent">Al said, “When ya think we’re gonna go, Pa?”</p>
<p class="indent">“I dunno. We’ll talk her over tonight an’ decide. I’m sure glad Tom’s back. That makes me feel good. Tom’s a good boy.”</p>
<p class="indent">Al said, “Pa, some fellas was talkin’ about Tom, an’ they says he’s parole’. An’ they says that means he can’t go outside the State, or if he goes, an’ they catch him, they send ’im back for three years.”</p>
<p class="indent">Pa looked startled. “They said that? Seem like fellas that knowed? Not jus’ blowin’ off?”</p>
<p class="indent">“I don’ know,” said Al. “They was just a-talkin’ there, an’ I didn’ let on he’s my brother. I jus’ stood an’ took it in.”</p>
<p class="indent">Pa said, “Jesus Christ, I hope that ain’t true! We need Tom. I’ll ask ’im about that. We got trouble enough without they chase the hell out of us. I hope it ain’t true. We got to talk that out in the open.”</p>
<p class="indent">Uncle John said, “Tom, he’ll know.”</p>
<p class="indent">They fell silent while the truck battered along. The engine was noisy, full of little clashings, and the brake rods banged. There was a wooden <a id="page_103"/> creaking from the wheels, and a thin jet of steam escaped through a hole in the top of the radiator cap. The truck pulled a high whirling column of red dust behind it. They rumbled up the last little rise while the sun was still half-face above the horizon, and they bore down on the house as it disappeared. The brakes squealed when they stopped, and the sound printed in Al’s head—no lining left.</p>
<p class="indent">Ruthie and Winfield climbed yelling over the side walls and dropped to the ground. They shouted, “Where is he? Where’s Tom?” And then they saw him standing beside the door, and they stopped, embarrassed, and walked slowly toward him and looked shyly at him.</p>
<p class="indent">And when he said, “Hello, how you kids doin’?” they replied softly, “Hello! All right.” And they stood apart and watched him secretly, the great brother who had killed a man and been in prison. They remembered how they had played prison in the chicken coop and fought for the right to be prisoner.</p>
<p class="indent">Connie Rivers lifted the high tail-gate out of the truck and got down and helped Rose of Sharon to the ground; and she accepted it nobly, smiling her wise, self-satisfied smile, mouth tipped at the corners a little fatuously.</p>
<p class="indent">Tom said, “Why, it’s Rosasharn. I didn’ know you was comin’ with them.”</p>
<p class="indent">“We was walkin’,” she said. “The truck come by an’ picked us up.” And then she said, “This is Connie, my husband.” And she was grand, saying it.</p>
<p class="indent">The two shook hands, sizing each other up, looking deeply into each other; and in a moment each was satisfied, and Tom said, “Well, I see you been busy.”</p>
<p class="indent">She looked down. “You do not see, not yet.”</p>
<p class="indent">“Ma tol’ me. When’s it gonna be?”</p>
<p class="indent">“Oh, not for a long time! Not till nex’ winter.”</p>
<p class="indent">Tom laughed. “Gonna get ’im bore in a orange ranch, huh? In one a them white houses with orange trees all aroun’.”</p>
<p class="indent">Rose of Sharon felt her stomach with both her hands. “You do not see,” she said, and she smiled her complacent smile and went into the house. The evening was hot, and the thrust of light still flowed up from the western horizon. And without any signal the family gathered by <a id="page_104"/> the truck, and the congress, the family government, went into session.</p>
<p class="indent">The film of evening light made the red earth lucent, so that its dimensions were deepened, so that a stone, a post, a building had greater depth and more solidity than in the daytime light; and these objects were curiously more individual—a post was more essentially a post, set off from the earth it stood in and the field of corn it stood out against. And plants were individuals, not the mass of crop; and the ragged willow tree was itself, standing free of all other willow trees. The earth contributed a light to the evening. The front of the gray, paintless house, facing the west, was luminous as the moon is. The gray dusty truck, in the yard before the door, stood out magically in this light, in the overdrawn perspective of a stereopticon.</p>
<p class="indent">The people too were changed in the evening, quieted. They seemed to be a part of an organization of the unconscious. They obeyed impulses which registered only faintly in their thinking minds. Their eyes were inward and quiet, and their eyes, too, were lucent in the evening, lucent in dusty faces.</p>
<p class="indent">The family met at the most important place, near the truck. The house was dead, and the fields were dead; but this truck was the active thing, the living principle. The ancient Hudson, with bent and scarred radiator screen, with grease in dusty globules at the worn edges of every moving part, with hub caps gone and caps of red dust in their places—this was the new hearth, the living center of the family; half passenger car and half truck, high-sided and clumsy.</p>
<p class="indent">Pa walked around the truck, looking at it, and then he squatted down in the dust and found a stick to draw with. One foot was flat to the ground, the other rested on the ball and slightly back, so that one knee was higher than the other. Left forearm rested on the lower, left, knee; the right elbow on the right knee, and the right fist cupped for the chin. Pa squatted there, looking at the truck, his chin in his cupped fist. And Uncle John moved toward him and squatted down beside him. Their eyes were brooding. Grampa came out of the house and saw the two squatting together, and he jerked over and sat on the running board of the truck, facing them. That was the nucleus. Tom and Connie and Noah strolled in and squatted, and the line was a half-circle with Grampa in the opening. And then Ma came out of the house, and Granma with <a id="page_105"/> her, and Rose of Sharon behind, walking daintily. They took their places behind the squatting men; they stood up and put their hands on their hips. And the children, Ruthie and Winfield, hopped from foot to foot beside the women; the children squidged their toes in the red dust, but they made no sound. Only the preacher was not there. He, out of delicacy, was sitting on the ground behind the house. He was a good preacher and knew his people.</p>
<p class="indent">The evening light grew softer, and for a while the family sat and stood silently. Then Pa, speaking to no one, but to the group, made his report. “Got skinned on the stuff we sold. The fella knowed we couldn’t wait. Got eighteen dollars only.”</p>
<p class="indent">Ma stirred restively, but she held her peace.</p>
<p class="indent">Noah, the oldest son, asked, “How much, all added up, we got?”</p>
<p class="indent">Pa drew figures in the dust and mumbled to himself for a moment. “Hunderd fifty-four,” he said. “But Al here says we gonna need better tires. Says these here won’t last.”</p>
<p class="indent">This was Al’s first participation in the conference. Always he had stood behind with the women before. And now he made his report solemnly. “She’s old an’ she’s ornery,” he said gravely. “I gave the whole thing a good goin’-over ’fore we bought her. Didn’ listen to the fella talkin’ what a hell of a bargain she was. Stuck my finger in the differential and they wasn’t no sawdust. Opened the gear box an’ they wasn’t no sawdust. Test’ her clutch an’ rolled her wheels for line. Went under her an’ her frame ain’t splayed none. She never been rolled. Seen they was a cracked cell in her battery an’ made the fella put in a good one. The tires ain’t worth a damn, but they’re a good size. Easy to get. She’ll ride like a bull calf, but she ain’t shootin’ no oil. Reason I says buy her is she was a pop’lar car. Wreckin’ yards is full a Hudson Super-Sixes, an’ you can buy parts cheap. Could a got a bigger, fancier car for the same money, but parts too hard to get, an’ too dear. That’s how I figgered her anyways.” The last was his submission to the family. He stopped speaking and waited for their opinions.</p>
<p class="indent">Grampa was still the titular head, but he no longer ruled. His position was honorary and a matter of custom. But he did have the right of first comment, no matter how silly his old mind might be. And the squatting men and the standing women waited for him. “You’re all right, Al,” <a id="page_106"/> Grampa said. “I was a squirt jus’ like you, a-fartin’ aroun’ like a dog-wolf. But when they was a job, I done it. You’ve growed up good.” He finished in the tone of a benediction, and Al reddened a little with pleasure.</p>
<p class="indent">Pa said, “Sounds right-side-up to me. If it was horses we wouldn’ have to put the blame on Al. But Al’s the on’y automobile fella here.”</p>
<p class="indent">Tom said, “I know some. Worked some in McAlester. Al’s right. He done good.” And now Al was rosy with the compliment. Tom went on, “I’d like to say—well, that preacher—he wants to go along.” He was silent. His words lay in the group, and the group was silent. “He’s a nice fella,” Tom added. “We’ve knowed him a long time. Talks a little wild sometimes, but he talks sensible.” And he relinquished the proposal to the family.</p>
<p class="indent">The light was going gradually. Ma left the group and went into the house, and the iron clang of the stove came from the house. In a moment she walked back to the brooding council.</p>
<p class="indent">Grampa said, “They was two ways a thinkin’. Some folks use’ ta figger that a preacher was poison luck.”</p>
<p class="indent">Tom said, “This fella says he ain’t a preacher no more.”</p>
<p class="indent">Grampa waved his hand back and forth. “Once a fella’s a preacher, he’s always a preacher. That’s somepin you can’t get shut of. They was some folks figgered it was a good respectable thing to have a preacher along. Ef somebody died, preacher buried ’em. Weddin’ come due, or overdue, an’ there’s your preacher. Baby come, an’ you got a christener right under the roof. Me, I always said they was preachers <em>an</em>’ preachers. Got to pick ’em. I kinda like this fella. He ain’t stiff.”</p>
<p class="indent">Pa dug his stick into the dust and rolled it between his fingers so that it bored a little hole. “They’s more to this than is he lucky, or is he a nice fella,” Pa said. “We got to figger close. It’s a sad thing to figger close. Le’s see, now. There’s Grampa an’ Granma—that’s two. An’ me an’ John an’ Ma—that’s five. An’ Noah an’ Tommy an’ Al—that’s eight. Rosasharn an’ Connie is ten, an’ Ruthie an’ Winfiel’ is twelve. We got to take the dogs ’cause what’ll we do else? Can’t shoot a good dog, an’ there ain’t nobody to give ’em to. An’ that’s fourteen.”</p>
<p class="indent">“Not countin’ what chickens is left, an’ two pigs,” said Noah.</p>
<p class="indent">Pa said, “I aim to get those pigs salted down to eat on the way. We gonna need meat. Carry the salt kegs right with us. But I’m wonderin’ <a id="page_107"/> if we can all ride, an’ the preacher too. An’ kin we feed a extra mouth?” Without turning his head he asked, “Kin we, Ma?”</p>
<p class="indent">Ma cleared her throat. “It ain’t kin we? It’s will we?” she said firmly. “As far as ‘kin,’ we can’t do nothin’, not go to California or nothin’; but as far as ‘will,’ why, we’ll do what we will. An’ as far as ‘will’—it’s a long time our folks been here and east before, an’ I never heerd tell of no Joads or no Hazletts, neither, ever refusin’ food an’ shelter or a lift on the road to anybody that asked. They’s been mean Joads, but never that mean.”</p>
<p class="indent">Pa broke in, “But s’pose there just ain’t room?” He had twisted his neck to look up at her, and he was ashamed. Her tone had made him ashamed. “S’pose we jus’ can’t all get in the truck?”</p>
<p class="indent">“There ain’t room now,” she said. “There ain’t room for more’n six, an’ twelve is goin’ sure. One more ain’t gonna hurt; an’ a man, strong an’ healthy, ain’t never no burden. An’ any time when we got two pigs an’ over a hunderd dollars, an’ we wonderin’ if we kin feed a fella —” She stopped, and Pa turned back, and his spirit was raw from the whipping.</p>
<p class="indent">Granma said, “A preacher is a nice thing to be with us. He give a nice grace this morning.”</p>
<p class="indent">Pa looked at the face of each one for dissent, and then he said, “Want to call ’im over, Tommy? If he’s goin’, he ought ta be here.”</p>
<p class="indent">Tom got up from his hams and went toward the house, calling, “Casy—oh, Casy!”</p>
<p class="indent">A muffled voice replied from behind the house. Tom walked to the corner and saw the preacher sitting back against the wall, looking at the flashing evening star in the light sky. “Calling me?” Casy asked.</p>
<p class="indent">“Yeah. We think long as you’re goin’ with us, you ought to be over with us, helpin’ to figger things out.”</p>
<p class="indent">Casy got to his feet. He knew the government of families, and he knew he had been taken into the family. Indeed his position was eminent, for Uncle John moved sideways, leaving space between Pa and himself for the preacher. Casy squatted down like the others, facing Grampa enthroned on the running board.</p>
<p class="indent">Ma went to the house again. There was a screech of a lantern hood and the yellow light flashed up in the dark kitchen. When she lifted the <a id="page_108"/> lid of the big pot, the smell of boiling side-meat and beet greens came out the door. They waited for her to come back across the darkening yard, for Ma was powerful in the group.</p>
<p class="indent">Pa said, “We got to figger when to start. Sooner the better. What we got to do ’fore we go is get them pigs slaughtered an’ in salt, an’ pack our stuff an’ go. Quicker the better, now.”</p>
<p class="indent">Noah agreed, “If we pitch in, we kin get ready tomorrow, an’ we kin go bright the nex’ day.”</p>
<p class="indent">Uncle John objected, “Can’t chill no meat in the heat a the day. Wrong time a year for slaughterin’. Meat’ll be sof’ if it don’ chill.”</p>
<p class="indent">“Well, le’s do her tonight. She’ll chill tonight some. Much as she’s gonna. After we eat, le’s get her done. Got salt?”</p>
<p class="indent">Ma said, “Yes. Got plenty salt. Got two nice kegs, too.”</p>
<p class="indent">“Well, le’s get her done, then,” said Tom.</p>
<p class="indent">Grampa began to scrabble about, trying to get a purchase to arise. “Gettin’ dark,” he said. “I’m gettin’ hungry. Come time we get to California I’ll have a big bunch a grapes in my han’ all the time, a-nibblin’ off it all the time, by God!” He got up, and the men arose.</p>
<p class="indent">Ruthie and Winfield hopped excitedly about in the dust, like crazy things. Ruthie whispered hoarsely to Winfield, “Killin’ pigs <em>and</em> goin’ to California. Killin’ pigs <em>and</em> goin’—all the same time.”</p>
<p class="indent">And Winfield was reduced to madness. He stuck his finger against his throat, made a horrible face, and wobbled about, weakly shrilling, “I’m a ol’ pig. Look! I’m a ol’ pig. Look at the blood, Ruthie!” And he staggered and sank to the ground, and waved arms and legs weakly.</p>
<p class="indent">But Ruthie was older, and she knew the tremendousness of the time. “<em>And</em> goin’ to California,” she said again. And she knew this was the great time in her life so far.</p>
<p class="indent">The adults moved toward the lighted kitchen through the deep dusk, and Ma served them greens and side-meat in tin plates. But before Ma ate, she put the big round wash tub on the stove and started the fire to roaring. She carried buckets of water until the tub was full, and then around the tub she clustered the buckets, full of water. The kitchen became a swamp of heat, and the family ate hurriedly, and went out to sit on the doorstep until the water should get hot. They sat looking out at the dark, at the square of light the kitchen lantern threw on the <a id="page_109"/> ground outside the door, with a hunched shadow of Grampa in the middle of it. Noah picked his teeth thoroughly with a broom straw. Ma and Rose of Sharon washed up the dishes and piled them on the table.</p>
<p class="indent">And then, all of a sudden, the family began to function. Pa got up and lighted another lantern. Noah, from a box in the kitchen, brought out the bow-bladed butchering knife and whetted it on a worn little carborundum stone. And he laid the scraper on the chopping block, and the knife beside it. Pa brought two sturdy sticks, each three feet long, and pointed the ends with the ax, and he tied strong ropes, double half-hitched, to the middle of the sticks.</p>
<p class="indent">He grumbled, “Shouldn’t of sold those singletrees—all of ’em.”</p>
<p class="indent">The water in the pots steamed and rolled.</p>
<p class="indent">Noah asked, “Gonna take the water down there or bring the pigs up here?”</p>
<p class="indent">“Pigs up here,” said Pa. “You can’t spill a pig and scald yourself like you can hot water. Water about ready?”</p>
<p class="indent">“Jus’ about,” said Ma.</p>
<p class="indent">“Aw right. Noah, you an’ Tom an’ Al come along. I’ll carry the light. We’ll slaughter down there an’ bring ’em up here.”</p>
<p class="indent">Noah took his knife, and Al the ax, and the four men moved down on the sty, their legs flickering in the lantern light. Ruthie and Winfield skittered along, hopping over the ground. At the sty Pa leaned over the fence, holding the lantern. The sleepy young pigs struggled to their feet, grunting suspiciously. Uncle John and the preacher walked down to help.</p>
<p class="indent">“All right,” said Pa. “Stick ’em, an’ we’ll run ’em up and bleed an’ scald at the house.” Noah and Tom stepped over the fence. They slaughtered quickly and efficiently. Tom struck twice with the blunt head of the ax; and Noah, leaning over the felled pigs, found the great artery with his curving knife and released the pulsing streams of blood. Then over the fence with the squealing pigs. The preacher and Uncle John dragged one by the hind legs, and Tom and Noah the other. Pa walked along with the lantern, and the black blood made two trails in the dust.</p>
<p class="indent">At the house, Noah slipped his knife between tendon and bone of the hind legs; the pointed sticks held the legs apart, and the carcasses were hung from the two-by-four rafters that stuck out from the house. <a id="page_110"/> Then the men carried the boiling water and poured it over the black bodies. Noah slit the bodies from end to end and dropped the entrails out on the ground. Pa sharpened two more sticks to hold the bodies open to the air, while Tom with the scrubber and Ma with a dull knife scraped the skins to take out the bristles. Al brought a bucket and shoveled the entrails into it, and dumped them on the ground away from the house, and two cats followed him, mewing loudly, and the dogs followed him, growling lightly at the cats.</p>
<p class="indent">Pa sat on the doorstep and looked at the pigs hanging in the lantern light. The scraping was done now, and only a few drops of blood continued to fall from the carcasses into the black pool on the ground. Pa got up and went to the pigs and felt them with his hand, and then he sat down again. Granma and Grampa went toward the barn to sleep, and Grampa carried a candle lantern in his hand. The rest of the family sat quietly about the doorstep, Connie and Al and Tom on the ground, leaning their backs against the house wall, Uncle John on a box, Pa in the doorway. Only Ma and Rose of Sharon continued to move about. Ruthie and Winfield were sleepy now, but fighting it off. They quarreled sleepily out in the darkness. Noah and the preacher squatted side by side, facing the house. Pa scratched himself nervously, and took off his hat and ran his fingers through his hair. “Tomorra we’ll get that pork salted early in the morning, an’ then we’ll get the truck loaded, all but the beds, an’ nex’ morning off we’ll go. Hardly is a day’s work in all that,” he said uneasily.</p>
<p class="indent">Tom broke in, “We’ll be moonin’ aroun’ all day, lookin’ for somepin to do.” The group stirred uneasily. “We could get ready by daylight an’ go,” Tom suggested. Pa rubbed his knee with his hand. And the restiveness spread to all of them.</p>
<p class="indent">Noah said, “Prob’ly wouldn’ hurt that meat to git her right down in salt. Cut her up, she’d cool quicker anyways.”</p>
<p class="indent">It was Uncle John who broke over the edge, his pressures too great. “What we hangin’ aroun’ for? I want to get shut of this. Now we’re goin’, why don’t we go?”</p>
<p class="indent">And the revulsion spread to the rest. “Whyn’t we go? Get sleep on the way.” And a sense of hurry crept into them.</p>
<p class="indent">Pa said, “They say it’s two thousan’ miles. That’s a hell of a long ways. <a id="page_111"/> We oughta go. Noah, you an’ me can get that meat cut up an’ we can put all the stuff in the truck.”</p>
<p class="indent">Ma put her head out of the door. “How about if we forgit somepin, not seein’ it in the dark?”</p>
<p class="indent">“We could look ’round after daylight,” said Noah. They sat still then, thinking about it. But in a moment Noah got up and began to sharpen the bow-bladed knife on his little worn stone. “Ma,” he said, “git that table cleared.” And he stepped to a pig, cut a line down one side of the backbone and began peeling the meat forward, off the ribs.</p>
<p class="indent">Pa stood up excitedly. “We got to get the stuff together,” he said. “Come on, you fellas.”</p>
<p class="indent">Now that they were committed to going, the hurry infected all of them. Noah carried the slabs of meat into the kitchen and cut it into small salting blocks, and Ma patted the coarse salt in, laid it piece by piece in the kegs, careful that no two pieces touched each other. She laid the slabs like bricks, and pounded salt in the spaces. And Noah cut up the side-meat and he cut up the legs. Ma kept her fire going, and as Noah cleaned the ribs and the spines and leg bones of all the meat he could, she put them in the oven to roast for gnawing purposes.</p>
<p class="indent">In the yard and in the barn the circles of lantern light moved about, and the men brought together all the things to be taken, and piled them by the truck. Rose of Sharon brought out all the clothes the family possessed: the overalls, the thick-soled shoes, the rubber boots, the worn best suits, the sweaters and sheepskin coats. And she packed these tightly into a wooden box and got into the box and tramped them down. And then she brought out the print dresses and shawls, the black cotton stockings and the children’s clothes—small overalls and cheap print dresses—and she put these in the box and tramped them down.</p>
<p class="indent">Tom went to the tool shed and brought what tools were left to go, a hand saw and a set of wrenches, a hammer and a box of assorted nails, a pair of pliers and a flat file and a set of rat-tail files.</p>
<p class="indent">And Rose of Sharon brought out the big piece of tarpaulin and spread it on the ground behind the truck. She struggled through the door with the mattresses, three double ones and a single. She piled them on the tarpaulin and brought arm-loads of folded ragged blankets and piled them up.</p>
<p class="indent" id="page_112">Ma and Noah worked busily at the carcasses, and the smell of roasting pork bones came from the stove. The children had fallen by the way in the late night. Winfield lay curled up in the dust outside the door; and Ruthie, sitting on a box in the kitchen where she had gone to watch the butchering, had dropped her head back against the wall. She breathed easily in her sleep, and her lips were parted over her teeth.</p>
<p class="indent">Tom finished with the tools and came into the kitchen with his lantern, and the preacher followed him. “God in a buckboard,” Tom said, “smell that meat! An’ listen to her crackle.”</p>
<p class="indent">Ma laid the bricks of meat in a keg and poured salt around and over them and covered the layer with salt and patted it down. She looked up at Tom and smiled a little at him, but her eyes were serious and tired. “Be nice to have pork bones for breakfas’,” she said.</p>
<p class="indent">The preacher stepped beside her. “Leave me salt down this meat,” he said. “I can do it. There’s other stuff for you to do.”</p>
<p class="indent">She stopped her work then and inspected him oddly, as though he suggested a curious thing. And her hands were crusted with salt, pink with fluid from the fresh pork. “It’s women’s work,” she said finally.</p>
<p class="indent">“It’s all work,” the preacher replied. “They’s too much of it to split it up to men’s or women’s work. You got stuff to do. Leave me salt the meat.”</p>
<p class="indent">Still for a moment she stared at him, and then she poured water from a bucket into the tin wash basin and she washed her hands. The preacher took up the blocks of pork and patted on the salt while she watched him. And he laid them in the kegs as she had. Only when he had finished a layer and covered it carefully and patted down the salt was she satisfied. She dried her bleached and bloated hands.</p>
<p class="indent">Tom said, “Ma, what stuff we gonna take from here?”</p>
<p class="indent">She looked quickly about the kitchen. “The bucket,” she said. “All the stuff to eat with: plates an’ the cups, the spoons an’ knives an’ forks. Put all them in that drawer, an’ take the drawer. The big fry pan an’ the big stew kettle, the coffee pot. When it gets cool, take the rack outa the oven. That’s good over a fire. I’d like to take the wash tub, but I guess there ain’t room. I’ll wash clothes in the bucket. Don’t do no good to take little stuff. You can cook little stuff in a big kettle, but you can’t cook big stuff in a little pot. Take the bread pans, all of ’em. They fit <a id="page_113"/> down inside each other.” She stood and looked about the kitchen. “You jus’ take that stuff I tol’ you, Tom. I’ll fix up the rest, the big can a pepper an’ the salt an’ the nutmeg an’ the grater. I’ll take all that stuff jus’ at the last.” She picked up a lantern and walked heavily into the bedroom, and her bare feet made no sound on the floor.</p>
<p class="indent">The preacher said, “She looks tar’d.”</p>
<p class="indent">“Women’s always tar’d,” said Tom. “That’s just the way women is, ’cept at meetin’ once an’ again.”</p>
<p class="indent">“Yeah, but tar’der’n that. Real tar’d, like she’s sick-tar’d.”</p>
<p class="indent">Ma was just through the door, and she heard his words. Slowly her relaxed face tightened, and the lines disappeared from the taut muscular face. Her eyes sharpened and her shoulders straightened. She glanced about the stripped room. Nothing was left in it except trash. The mattresses which had been on the floor were gone. The bureaus were sold. On the floor lay a broken comb, an empty talcum powder can, and a few dust mice. Ma set her lantern on the floor. She reached behind one of the boxes that had served as chairs and brought out a stationery box, old and soiled and cracked at the corners. She sat down and opened the box. Inside were letters, clippings, photographs, a pair of earrings, a little gold signet ring, and a watch chain braided of hair and tipped with gold swivels. She touched the letters with her fingers, touched them lightly, and she smoothed a newspaper clipping on which there was an account of Tom’s trial. For a long time she held the box, looking over it, and her fingers disturbed the letters and then lined them up again. She bit her lower lip, thinking, remembering. And at last she made up her mind. She picked out the ring, the watch charm, the earrings, dug under the pile and found one gold cuff link. She took a letter from an envelope and dropped the trinkets in the envelope. She folded the envelope over and put it in her dress pocket. Then gently and tenderly she closed the box and smoothed the top carefully with her fingers. Her lips parted. And then she stood up, took her lantern, and went back into the kitchen. She lifted the stove lid and laid the box gently among the coals. Quickly the heat browned the paper. A flame licked up and over the box. She replaced the stove lid and instantly the fire sighed up and breathed over the box.</p>
<p class="center">*</p>
<p class="No-indent"><a id="page_114"/>Out in the dark yard, working in the lantern light, Pa and Al loaded the truck. Tools on the bottom, but handy to reach in case of a breakdown. Boxes of clothes next, and kitchen utensils in a gunny sack; cutlery and dishes in their box. Then the gallon bucket tied on behind. They made the bottom of the load as even as possible, and filled the spaces between boxes with rolled blankets. Then over the top they laid the mattresses, filling the truck in level. And last they spread the big tarpaulin over the load and Al made holes in the edge, two feet apart, and inserted little ropes, and tied it down to the side-bars of the truck.</p>
<p class="indent">“Now, if it rains,” he said, “we’ll tie it to the bar above, an’ the folks can get underneath, out of the wet. Up front we’ll be dry enough.”</p>
<p class="indent">And Pa applauded. “That’s a good idear.”</p>
<p class="indent">“That ain’t all,” Al said. “First chance I git I’m gonna fin’ a long plank an’ make a ridge pole, an’ put the tarp over that. An’ then it’ll be covered in, an’ the folks’ll be outa the sun, too.”</p>
<p class="indent">And Pa agreed, “That’s a good idear. Whyn’t you think a that before?”</p>
<p class="indent">“I ain’t had time,” said Al.</p>
<p class="indent">“Ain’t had time? Why, Al, you had time to coyote all over the country. God knows where you been this las’ two weeks.”</p>
<p class="indent">“Stuff a fella got to do when he’s leavin’ the country,” said Al. And then he lost some of his assurance. “Pa,” he asked. “You glad to be goin’, Pa?”</p>
<p class="indent">“Huh? Well—sure. Leastwise—yeah. We had hard times here. ’Course it’ll be all different out there—plenty work, an’ ever’thing nice an’ green, an’ little white houses an’ oranges growin’ aroun’.”</p>
<p class="indent">“Is it all oranges ever’where?”</p>
<p class="indent">“Well, maybe not ever’where, but plenty places.”</p>
<p class="indent">The first gray of daylight began in the sky. And the work was done—the kegs of pork ready, the chicken coop ready to go on top. Ma opened the oven and took out the pile of roasted bones, crisp and brown, with plenty of gnawing meat left. Ruthie half awakened, and slipped down from the box, and slept again. But the adults stood around the door, shivering a little and gnawing at the crisp pork.</p>
<p class="indent">“Guess we oughta wake up Granma an’ Grampa,” Tom said. “Gettin’ along on toward day.”</p>
<p class="indent" id="page_115">Ma said, “Kinda hate to, till the las’ minute. They need the sleep. Ruthie an’ Winfield ain’t hardly got no real rest neither.”</p>
<p class="indent">“Well, they kin all sleep on top a the load,” said Pa. “It’ll be nice an’ comf ’table there.”</p>
<p class="indent">Suddenly the dogs started up from the dust and listened. And then, with a roar, went barking off into the darkness. “Now what in hell is that?” Pa demanded. In a moment they heard a voice speaking reassuringly to the barking dogs and the barking lost its fierceness. Then footsteps, and a man approached. It was Muley Graves, his hat pulled low.</p>
<p class="indent">He came near timidly. “Morning, folks,” he said.</p>
<p class="indent">“Why, Muley.” Pa waved the ham bone he held. “Step in an’ get some pork for yourself, Muley.”</p>
<p class="indent">“Well, no,” said Muley. “I ain’t hungry, exactly.”</p>
<p class="indent">“Oh, get it, Muley, get it. Here!” And Pa stepped into the house and brought out a hand of spareribs.</p>
<p class="indent">“I wasn’t aiming to eat none a your stuff,” he said. “I was jus’ walkin’ aroun’, an’ I thought how you’d be goin’, an’ I’d maybe say good-by.”</p>
<p class="indent">“Goin’ in a little while now,” said Pa. “You’d a missed us if you’d come an hour later. All packed up—see?”</p>
<p class="indent">“All packed up.” Muley looked at the loaded truck. “Sometimes I wisht I’d go an’ fin’ my folks.”</p>
<p class="indent">Ma asked, “Did you hear from ’em out in California?”</p>
<p class="indent">“No,” said Muley, “I ain’t heard. But I ain’t been to look in the post office. I oughta go in sometimes.”</p>
<p class="indent">Pa said, “Al, go down, wake up Granma, Grampa. Tell ’em to come an’ eat. We’re goin’ before long.” And as Al sauntered toward the barn, “Muley, ya wanta squeeze in with us an’ go? We’d try to make room for ya.”</p>
<p class="indent">Muley took a bite of meat from the edge of a rib bone and chewed it. “Sometimes I think I might. But I know I won’t,” he said. “I know perfectly well the las’ minute I’d run an’ hide like a damn ol’ graveyard ghos’.”</p>
<p class="indent">Noah said, “You gonna die out in the fiel’ some day, Muley.”</p>
<p class="indent">“I know. I thought about that. Sometimes it seems pretty lonely, an’ sometimes it seems all right, an’ sometimes it seems good. It don’t make <a id="page_116"/> no difference. But if ya come acrost my folks—that’s really what I come to say—if ya come on any my folks in California, tell ’em I’m well. Tell ’em I’m doin’ all right. Don’t let on I’m livin’ this way. Tell ’em I’ll come to ’em soon’s I git the money.”</p>
<p class="indent">Ma asked, “An’ will ya?”</p>
<p class="indent">“No,” Muley said softly. “No, I won’t. I can’t go away. I got to stay now. Time back I might of went. But not now. Fella gits to thinkin’, an’ he gits to knowin’. I ain’t never goin’.”</p>
<p class="indent">The light of the dawn was a little sharper now. It paled the lanterns a little. Al came back with Grampa struggling and limping by his side. “He wasn’t sleepin’,” Al said. “He was settin’ out back of the barn. They’s somepin wrong with ’im.”</p>
<p class="indent">Grampa’s eyes had dulled, and there was none of the old meanness in them. “Ain’t nothin’ the matter with me,” he said. “I jus’ ain’t a-goin’.”</p>
<p class="indent">“Not goin’?” Pa demanded. “What you mean you ain’t a-goin’? Why, here we’re all packed up, ready. We got to go. We got no place to stay.”</p>
<p class="indent">“I ain’t sayin’ for you to stay,” said Grampa. “You go right on along. Me—I’m stayin’. I give her a goin’-over all night mos’ly. This here’s my country. I b’long here. An’ I don’t give a goddamn if they’s oranges an’ grapes crowdin’ a fella outa bed even. I ain’t a-goin’. This country ain’t no good, but it’s my country. No, you all go ahead. I’ll jus’ stay right here where I b’long.”</p>
<p class="indent">They crowded near to him. Pa said, “You can’t, Grampa. This here lan’ is goin’ under the tractors. Who’d cook for you? How’d you live? You can’t stay here. Why, with nobody to take care of you, you’d starve.”</p>
<p class="indent">Grampa cried, “Goddamn it, I’m a ol’ man, but I can still take care a myself. How’s Muley here get along? I can get along as good as him. I tell ya I ain’t goin’, an’ ya can lump it. Take Granma with ya if ya want, but ya ain’t takin’ me, an’ that’s the end of it.”</p>
<p class="indent">Pa said helplessly, “Now listen to me, Grampa. Jus’ listen to me, jus’ a minute.”</p>
<p class="indent">“Ain’t a-gonna listen. I tol’ ya what I’m a-gonna do.”</p>
<p class="indent">Tom touched his father on the shoulder. “Pa, come in the house. I wanta tell ya somepin.” And as they moved toward the house, he called, “Ma—come here a minute, will ya?”</p>
<p class="indent">In the kitchen one lantern burned and the plate of pork bones was <a id="page_117"/> still piled high. Tom said, “Listen, I know Grampa got the right to say he ain’t goin’, but he can’t stay. We know that.”</p>
<p class="indent">“Sure he can’t stay,” said Pa.</p>
<p class="indent">“Well, look. If we got to catch him an’ tie him down, we li’ble to hurt him, an’ he’ll git so mad he’ll hurt himself. Now we can’t argue with him. If we could get him drunk it’d be all right. You got any whisky?”</p>
<p class="indent">“No,” said Pa. “There ain’t a drop a’ whisky in the house. An’ John got no whisky. He never has none when he ain’t drinkin’.”</p>
<p class="indent">Ma said, “Tom, I got a half a bottle soothin’ sirup I got for Winfiel’ when he had them earaches. Think that might work? Use ta put Winfiel’ ta sleep when his earache was bad.”</p>
<p class="indent">“Might,” said Tom. “Get it, Ma. We’ll give her a try anyways.”</p>
<p class="indent">“I throwed it out on the trash pile,” said Ma. She took the lantern and went out, and in a moment she came back with a bottle half full of black medicine.</p>
<p class="indent">Tom took it from her and tasted it. “Don’ taste bad,” he said. “Make up a cup a black coffee, good an’ strong. Le’s see—says one teaspoon. Better put in a lot, coupla tablespoons.”</p>
<p class="indent">Ma opened the stove and put a kettle inside, down next to the coals, and she measured water and coffee into it. “Have to give it to ’im in a can,” she said. “We got the cups all packed.”</p>
<p class="indent">Tom and his father went back outside. “Fella got a right to say what he’s gonna do. Say, who’s eatin’ spareribs?” said Grampa.</p>
<p class="indent">“We’ve et,” said Tom. “Ma’s fixin’ you a cup a coffee an’ some pork.”</p>
<p class="indent">He went into the house, and he drank his coffee and ate his pork. The group outside in the growing dawn watched him quietly, through the door. They saw him yawn and sway, and they saw him put his arms on the table and rest his head on his arms and go to sleep.</p>
<p class="indent">“He was tar’d anyways,” said Tom. “Leave him be.”</p>
<p class="indent">Now they were ready. Granma, giddy and vague, saying, “What’s all this? What you doin’ now, so early?” But she was dressed and agreeable. And Ruthie and Winfield were awake, but quiet with the pressure of tiredness and still half dreaming. The light was sifting rapidly over the land. And the movement of the family stopped. They stood about, reluctant to make the first active move to go. They were afraid, now that the time had come—afraid in the same way Grampa was afraid. <a id="page_118"/> They saw the shed take shape against the light, and they saw the lanterns pale until they no longer cast their circles of yellow light. The stars went out, few by few, toward the west. And still the family stood about like dream walkers, their eyes focused panoramically, seeing no detail, but the whole dawn, the whole land, the whole texture of the country at once.</p>
<p class="indent">Only Muley Graves prowled about restlessly, looking through the bars into the truck, thumping the spare tires hung on the back of the truck. And at last Muley approached Tom. “You goin’ over the State line?” he asked. “You gonna break your parole?”</p>
<p class="indent">And Tom shook himself free of the numbness. “Jesus Christ, it’s near sunrise,” he said loudly. “We got to get goin’.” And the others came out of their numbness and moved toward the truck.</p>
<p class="indent">“Come on,” Tom said. “Le’s get Grampa on.” Pa and Uncle John and Tom and Al went into the kitchen where Grampa slept, his forehead down on his arms, and a line of drying coffee on the table. They took him under the elbows and lifted him to his feet, and he grumbled and cursed thickly, like a drunken man. Out the door they boosted him, and when they came to the truck Tom and Al climbed up, and, leaning over, hooked their hands under his arms and lifted him gently up, and laid him on top of the load. Al untied the tarpaulin, and they rolled him under and put a box under the tarp beside him, so that the weight of the heavy canvas would not be upon him.</p>
<p class="indent">“I got to get that ridge pole fixed,” Al said. “Do her tonight when we stop.” Grampa grunted and fought weakly against awakening, and when he was finally settled he went deeply to sleep again.</p>
<p class="indent">Pa said, “Ma, you an’ Granma set in with Al for a while. We’ll change aroun’ so it’s easier, but you start out that way.” They got into the cab, and then the rest swarmed up on top of the load, Connie and Rose of Sharon, Pa and Uncle John, Ruthie and Winfield, Tom and the preacher. Noah stood on the ground, looking up at the great load of them sitting on top of the truck.</p>
<p class="indent">Al walked around, looking underneath at the springs. “Holy Jesus,” he said, “them springs is flat as hell. Lucky I blocked under ’em.”</p>
<p class="indent">Noah said, “How about the dogs, Pa?”</p>
<p class="indent">“I forgot the dogs,” Pa said. He whistled shrilly, and one bouncing <a id="page_119"/> dog ran in, but only one. Noah caught him and threw him up on the top, where he sat rigid and shivering at the height. “Got to leave the other two,” Pa called. “Muley, will you look after ’em some? See they don’t starve?”</p>
<p class="indent">“Yeah,” said Muley. “I’ll like to have a couple dogs. Yeah! I’ll take ’em.”</p>
<p class="indent">“Take them chickens, too,” Pa said.</p>
<p class="indent">Al got into the driver’s seat. The starter whirred and caught, and whirred again. And then the loose roar of the six cylinders and a blue smoke behind. “So long, Muley,” Al called.</p>
<p class="indent">And the family called, “Good-by, Muley.”</p>
<p class="indent">Al slipped in the low gear and let in the clutch. The truck shuddered and strained across the yard. And the second gear took hold. They crawled up the little hill, and the red dust arose about them. “Chr-ist, what a load!” said Al. “We ain’t makin’ no time on this trip.”</p>
<p class="indent">Ma tried to look back, but the body of the load cut off her view. She straightened her head and peered straight ahead along the dirt road. And a great weariness was in her eyes.</p>
<p class="indent">The people on top of the load did look back. They saw the house and the barn and a little smoke still rising from the chimney. They saw the windows reddening under the first color of the sun. They saw Muley standing forlornly in the dooryard looking after them. And then the hill cut them off. The cotton fields lined the road. And the truck crawled slowly through the dust toward the highway and the west.</p>
</body>
</html>`);
});
