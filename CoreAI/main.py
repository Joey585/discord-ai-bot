import tensorflow as tf
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, TFAutoModelForCausalLM
from data_process import process_text
import os
from absl import logging

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
physical_devices = tf.config.list_physical_devices('GPU')
tf.config.set_visible_devices(physical_devices[0], 'GPU')
logging.use_absl_handler()

app = Flask(__name__)

model_name = "joeylieb/human-discord-gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = TFAutoModelForCausalLM.from_pretrained(model_name)

@app.route("/generate", methods=["POST"])
def generate():
    raw_data = request.get_json()
    conversation = "\n".join(process_text(raw_data["conversation"])) + "\nuser2:"
    input_ids = tokenizer.encode(conversation, return_tensors="tf")

    output = model.generate(
        input_ids,
        max_length=len(conversation),
        temperature=0.8,
        top_k=50,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.encode('\nuser')[0],
    )

    response = tokenizer.decode(output[0], skip_special_tokens=True)
    ai_bot = response.split("\n")[len(response.split("\n")) - 2]
    return jsonify({"status": 200, "response": ai_bot})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


