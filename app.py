import os
from flask import Flask, render_template

# Descobrir o caminho absoluto da pasta onde este app.py está
base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'templates')

app = Flask(__name__, template_folder=template_dir)

@app.route('/')
def index():
    # Debug: Mostrar no log o que o servidor está vendo (ajuda a achar a pasta certa)
    print(f"Diretório atual: {os.getcwd()}")
    print(f"Arquivos aqui: {os.listdir(base_dir)}")
    if os.path.exists(template_dir):
        print(f"Conteúdo da pasta templates: {os.listdir(template_dir)}")
    else:
        print("ALERTA: Pasta 'templates' NÃO ENCONTRADA!")
        
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
