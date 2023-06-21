import flask_cors
from flask_cors import cross_origin
from flask import Flask, request, jsonify
import ebooklib
from ebooklib import epub
import json
from json import JSONEncoder
import openai

app = Flask(__name__)
flask_cors.CORS(app,
                origins='http://127.0.0.1/:5500',
                allow_headers=['Content-Type'],
                supports_credentials=True)

# app.config['CORS_HEADERS'] = 'Content-Type'


# chapters = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
class MyEncoder(JSONEncoder):

    def default(self, o):
        if isinstance(o, epub.Link) or isinstance(o, epub.Section):
            return {"link": o.href, "title": o.title}

        return super().default(o)


def dec(chapter):
    return bytes(chapter.get_content()).decode('utf-8')


@app.route("/upload", methods=["POST"])
@cross_origin()
def upload():
    print(request.files)
    return 'a'


"""
{
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "BLA BLA BLA",
                "role": "assistant"
            }
        }
    ],
    "created": 1687043937,
    "id": "chatcmpl-7SZU1wqpHV7FKohlvK6LphNUSWD21",
    "model": "gpt-4-0314",
    "object": "chat.completion",
    "usage": {
        "completion_tokens": 82,
        "prompt_tokens": 243,
        "total_tokens": 325
    }
}
"""
with open("config.json") as f:
    config = json.load(f)
    openai.api_key = config['OPEN_AI_KEY']


@app.route("/text_annotation", methods=["POST"])
@cross_origin()
def text_annotation():
    data = request.get_json()
    book = data['book']
    text = data['text']

    prompt = f'###Write a 2 to 5 sentence analysis of the following text from "{book}". DO NOT mention the name of the book or author###\n\n"""{text}"""'
    print(prompt)
    # make request
    response = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                            messages=[{
                                                "role":
                                                "system",
                                                "content":
                                                "You are a helpful assistant."
                                            }, {
                                                "role": "user",
                                                "content": prompt
                                            }])

    return get_gpt_response(response)


def get_gpt_response(json_response):
    return json_response["choices"][0]["message"]["content"]


@app.route("/image_annotation", methods=["POST"])
@cross_origin()
def image_annotation():
    data = request.get_json()
    text = data['text']
    prompt = f'"""{text}"""\n\n' + "###Write only a 10 word description of this scene###\n\n"
    print("simplification prompt", prompt)

    scenePrompt = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "system",
            "content": "You are a helpful assistant."
        }, {
            "role": "user",
            "content": prompt
        }],
    )

    simplified_prompt = get_gpt_response(scenePrompt)
    print("simplified propmt", simplified_prompt)
    response = openai.Image.create(
        prompt=simplified_prompt,
        n=1,
        size="512x512",
        response_format="b64_json",
    )
    if response["data"][0]["b64_json"]:
        print("got it")
    return response["data"][0]["b64_json"]


def find_chapter(chapter, book):
    for chap in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
        if chapter in chap.file_name:
            return (chap, dec(chap))


# curl "http://localhost:5000/get_chapter?book=book.epub&href=chapter01.html"
@app.route("/get_chapter", methods=["GET"])
@cross_origin()
def get_chapters():  # frontm.html#pref04
    chapter = request.args.get('href')
    book_name = request.args.get('book')
    book = epub.read_epub(book_name)
    print(find_chapter(chapter, book)[0].get_content())
    return find_chapter(chapter, book)[1]


@app.route("/flattened_chapters", methods=["GET"])
@cross_origin()
def get_flattened_chapter():
    book_name = request.args.get('book')
    book = epub.read_epub(book_name)

    def flatten(arr):
        if hasattr(arr, "__iter__"):
            ret = []
            for x in arr:
                ret += flatten(x)
            return ret
        else:
            return [arr]

    return json.dumps(flatten(book.toc), cls=MyEncoder)


@app.route("/toc", methods=["GET"])
@cross_origin()
def toc():
    book_name = request.args.get('book')
    book = epub.read_epub(book_name)

    return json.dumps(book.toc, cls=MyEncoder)

    # return jsonify(book.toc)


@app.route("/grade_questions", methods=["POST"])
@cross_origin()
def grade_questions():
    data = request.get_json()
    ret = []
    for d in data['data']:
        question, user_answer, paragraph = d['question'], d['user_answer'], d[
            'paragraph']
        prompt = '###Rate the following answer out of 5. Write a 2-4 sentence critique###\n\n'
        prompt += f'Knowledge Cutoff: """{paragraph}"""\n\n'
        prompt += f'Question: """{question}"""\n\n'
        prompt += f'Answer: """{user_answer}"""'
        print("prompt", prompt)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful grader."
                },
                {
                    "role":
                    "user",
                    "content":
                    '###Rate the following answer out of 5. Write a 2-4 sentence critique###\n\nKnowledge Cutoff: """Then, with time, the squatters were no longer squatters, but owners; and their children grew up and had children on the land. And the hunger was gone from them, the feral hunger, the gnawing, tearing hunger for land, for water and earth and the good sky over it, for the green thrusting grass, for the swelling roots. They had these things so completely that they did not know about them any more. They had no more the stomach-tearing lust for a rich acre and a shining blade to plow it, for seed and a windmill beating its wings in the air. They arose in the dark no more to hear the sleepy birds’ first chittering, and the morning wind around the house while they waited for the first light to go out to the dear acres. These things were lost, and crops were reckoned in dollars, and land was valued by principal plus interest, and crops were bought and sold before they were planted. Then crop failure, drought, and flood were no longer little deaths within life, but simple losses of money. And all their love was thinned with money, and all their fierceness dribbled away in interest until they were no longer farmers at all, but little shopkeepers of crops, little manufacturers who must sell before they can make. Then those farmers who were not good shopkeepers lost their land to good shopkeepers. No matter how clever, how loving a man might be with earth and growing things, he could not survive if he were not also a good shopkeeper. And as time went on, the business men had the farms, and the farms grew larger, but there were fewer of them"""\n\nQuestion: """What factors led to the transformation of squatters into landowners, and how did the changing nature of farming and the importance of money affect their relationship with the land?"""\n\nAnswer: """The transformation of squatters into landowners was primarily driven by time and subsequent generations inhabiting the land. As the original squatters settled and had children, ownership was established and passed down"""'
                },
                {
                    "role":
                    "assistant",
                    "content":
                    "Rating: 1/5\n\nCritique: The answer provided is extremely brief and does not fully address the question. It only mentions that the transformation from squatters to landowners occurred over time and through subsequent generations. The answer fails to discuss the changing nature of farming, the role of money, and how these factors affected the squatters' relationship with the land. More elaboration and analysis are needed to provide a comprehensive response to the question."
                },
                {
                    "role": "user",
                    "content": prompt
                },
            ])
        ret.append(get_gpt_response(response))
    print(ret)
    return jsonify(ret)


@app.route("/generate_questions", methods=["POST"])
@cross_origin()
def generate_questions():
    data = request.get_json()
    book_name = data['book']
    paragraphs = data['paragraphs']

    responses = []
    for p in paragraphs:
        prompt = f"###Write a question based on this paragraph from {book_name}###\n\n" + f'"""{p}"""'
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role":
                    "user",
                    "content":
                    '###Write a question based on this paragraph from Grapes Of Wrath###\n\n"""The moving, questing people were migrants now. Those families which had lived on a little piece of land, who had lived and died on forty acres, had eaten or starved on the produce of forty acres, had now the whole West to rove in. And they scampered about, looking for work; and the highways were streams of people, and the ditch banks were lines of people. Behind them more were coming. The great highways streamed with moving people. There in the Middle-and Southwest had lived a simple agrarian folk who had not changed with industry, who had not formed with machines or known the power and danger of machines in private hands. They had not grown up in the paradoxes of industry. Their senses were still sharp to the ridiculousness of the industrial life"""'
                },
                {
                    "role":
                    "assistant",
                    "content":
                    "How did the availability of vast lands in the West impact the lives of the migrating families during this period?"
                },
                {
                    "role": "user",
                    "content": prompt
                },
            ])
        print(prompt)
        print(response)
        responses.append(get_gpt_response(response))
    print(responses)
    return jsonify(responses)


app.json_encoder = MyEncoder
app.run(debug=True)
