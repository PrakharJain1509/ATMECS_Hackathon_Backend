from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from openai import OpenAI
import os

app = Flask(__name__)

# Enable CORS for all routes, allowing requests from any origin (you can restrict this later)
CORS(app)

# Initialize the OpenAI client for NVIDIA service
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
    # Ensure to set the NVIDIA API key in environment variables
)


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

        # Step 3: Return only the corrected code as JSON
        return jsonify({
            "completed_code": completed_code.strip()  # Only the corrected code is returned
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
