from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import re

app = Flask(__name__)

# Enable CORS for all routes, allowing requests from any origin (you can restrict this later)
CORS(app)

# Initialize the OpenAI client for NVIDIA service with the first code's API key
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

# Helper function for generating code descriptions
def get_code_description(code):
    """Helper function to send code to NVIDIA's API and get the description."""
    try:
        completion = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[{"role": "user",
                       "content": f"Analyze the following code carefully and provide a one or two-line description of the code's functionality and also predict what the code could be about. Be specific and do not generalize, only describe exactly what this particular function is supposed to do. Do not forget the predict and only give the prediction and description in one line. Code: {code}"}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=100,
            stream=True
        )

        description = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                description += chunk.choices[0].delta.content

        return description.strip()

    except Exception as e:
        raise Exception(f"Error in getting description: {str(e)}")


# First set of endpoints
@app.route('/describe_code', methods=['POST'])
def describe_code():
    """Endpoint to get a description of the code."""
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"error": "Code input is required"}), 400

    try:
        description = get_code_description(code)
        return jsonify({
            "code": code,
            "description": description
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/complete_code', methods=['POST'])
def complete_code():
    """Endpoint to generate the complete code based on the current code."""
    data = request.get_json()
    incomplete_code = data.get("code")
    description = get_code_description(incomplete_code)

    if not incomplete_code:
        return jsonify({"error": "Code input is required"}), 400

    try:
        # Step 1: Send the code to the model for completion
        completion = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Here is an incomplete code snippet: {incomplete_code}. "
                        f"Here is a description of the code snippet: {description}. "
                        "Please complete this code without adding any additional explanations or descriptions. "
                        "Only provide the corrected code. If the original code has no indentation, maintain that style. "
                        "If there are any existing indentations, ensure the returned code matches those indentations accurately. "
                        "The goal is to return a clean, valid code block that only contains the completed code, "
                        "keeping the structure consistent with the given input."
                    )
                }
            ],
            temperature=0.2,
            top_p=0.7,
            max_tokens=512,
            stream=True
        )

        completed_code = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                completed_code += chunk.choices[0].delta.content  # Append additional code

        return jsonify({
            "completed_code": completed_code.strip()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/comment_code', methods=['POST'])
def comment_code():
    """Endpoint to add comments to the code and return it with the same formatting."""
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"error": "Code input is required"}), 400

    try:
        completion = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Here is a code snippet: {code}. "
                        "Please add comments to this code, explaining the functionality of each part. "
                        "Keep the formatting the same as the original code, "
                        "and make sure the comments are concise and clear."
                        "Please complete this code without adding any additional explanations or descriptions. "
                        "Only provide the corrected code. If the original code has no indentation, maintain that style. "
                        "If there are any existing indentations, ensure the returned code matches those indentations accurately. "
                        "The goal is to return a clean, valid code block that only contains the completed code, "
                        "keeping the structure consistent with the given input."
                    )
                }
            ],
            temperature=0.2,
            top_p=0.7,
            max_tokens=512,
            stream=True
        )

        commented_code = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                commented_code += chunk.choices[0].delta.content  # Append the commented code

        return jsonify({
            "commented_code": commented_code.strip()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Second set of endpoints
def generate_code(description, task_type, max_tokens, temperature, top_p):
    system_content = {
        "competitive_programming": "You are a competitive programming code generator. Provide optimal C++ code without explanations or comments.",
        "ai_ml": "You are an AI/ML code generator. Provide Python code without explanations or comments. If there is any additional information or explanation needed keep it as a comment only.",
        "web_development": "You are a web development code generator. Provide HTML, CSS, and JavaScript code without explanations or comments."
    }

    response = client.chat.completions.create(
        model="nvidia/nemotron-4-340b-instruct",
        messages=[
            {"role": "system", "content": system_content[task_type]},
            {"role": "user", "content": description}
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p
    )

    code = response.choices[0].message.content.strip()
    return re.sub(r'```[\w\s]*\n|```', '', code)  # Remove backticks and language identifiers


def handle_competitive_programming(description):
    prompt = f"""Generate the best possible C++ code for the following problem with optimal time complexity. Also, provide 3 test cases to verify the code:
    {description}
    Format:
    <CODE>
    [Your C++ code here]
    </CODE>
    <TESTCASES>
    [Your 3 test cases here, each on a new line in the format Input: followed by Output:]
    </TESTCASES>
    """
    response = generate_code(prompt, "competitive_programming", 1024, 0.3, 0.8)

    code_match = re.search(r'<CODE>(.*?)</CODE>', response, re.DOTALL)
    testcases_match = re.search(r'<TESTCASES>(.*?)</TESTCASES>', response, re.DOTALL)

    code = code_match.group(1).strip() if code_match else "Code generation failed"
    testcases = testcases_match.group(1).strip().split('\n') if testcases_match else []

    return {"code": code, "test_cases": testcases}


def handle_ai_ml(description):
    return {"code": generate_code(description, "ai_ml", 1024, 0.4, 0.75)}


def handle_web_development(description):
    prompt = f"""Enhance and implement the following web development task. Provide HTML, CSS, and JavaScript code:
    {description}
    Format:
    <CODE>
    [Your HTML code here with <HTML> tag]
    </CODE>
    <CSS>
    [Your CSS code here]
    </CSS>
    <JS>
    [Your JavaScript code here]
    </JS>
    """
    response = generate_code(prompt, "web_development", 2048, 0.5, 0.85)

    html_match = re.search(r'<CODE>(.*?)</CODE>', response, re.DOTALL)
    css_match = re.search(r'<CSS>(.*?)</CSS>', response, re.DOTALL)
    js_match = re.search(r'<JS>(.*?)</JS>', response, re.DOTALL)

    return {
        "html": html_match.group(1).strip() if html_match else "",
        "css": css_match.group(1).strip() if css_match else "",
        "js": js_match.group(1).strip() if js_match else ""
    }


@app.route("/generate-code", methods=["POST", "OPTIONS"])
def generate_code_endpoint():
    if request.method == "OPTIONS":
        response = jsonify({"message": "preflight"})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    data = request.get_json()

    if "type" not in data or "description" not in data:
        return jsonify({"error": "Please provide both 'type' and 'description'."}), 400

    task_type = data["type"]
    description = data["description"]

    if task_type == "competitive_programming":
        response = handle_competitive_programming(description)
    elif task_type == "ai_ml":
        response = handle_ai_ml(description)
    elif task_type == "web_development":
        response = handle_web_development(description)
    else:
        return jsonify({"error": "Invalid task type provided."}), 400

    return jsonify(response)


# Main execution
if __name__ == "__main__":
    app.run(debug=True)
