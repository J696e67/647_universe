from flask import Flask, request, Response, send_from_directory
import requests

app = Flask(__name__, static_folder='.', static_url_path='')

OLLAMA_URL = 'http://localhost:11434'


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/api/generate', methods=['POST'])
def proxy_ollama():
    """Proxy Ollama API so external users don't need local Ollama."""
    data = request.get_json()
    try:
        resp = requests.post(
            f'{OLLAMA_URL}/api/generate',
            json=data,
            stream=True,
            timeout=60
        )
        return Response(
            resp.iter_content(chunk_size=1024),
            content_type=resp.headers.get('Content-Type', 'application/json'),
            status=resp.status_code
        )
    except requests.ConnectionError:
        return {'error': 'Ollama not running'}, 502


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9090)
