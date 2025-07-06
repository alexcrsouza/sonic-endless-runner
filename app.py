import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Detecta se está em produção pela variável de ambiente
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    if is_production:
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
    else:
        app.run(debug=True)