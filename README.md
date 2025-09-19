# Frontend - Pedalboard

Frontend para gerenciamento de plataformas de pedais e efeitos.

## Estrutura do Projeto

```
puc-mvp-pedalboard-frontend/
├── index.html          # Página principal
├── styles/
│   └── style.css       # Estilos CSS
├── scripts/
│   └── script.js       # Lógica JavaScript
├── README.md           # Documentação
└── .gitignore          # Arquivos ignorados pelo Git
```

## Como Usar

### Opção 1: Abrir Diretamente no Navegador (Recomendado)

1. Navegue até a pasta do projeto:
   ```
   c:\Users\user\Documents\DESENVOLVIMENTO\PUC\1_MVP\puc-mvp-pedalboard-frontend\
   ```

2. Clique duas vezes no arquivo `index.html` ou clique com o botão direito e selecione "Abrir com" > seu navegador preferido

3. O projeto funcionará completamente offline com dados de exemplo pré-carregados

### Opção 2: Servidor Local (Opcional)

```bash
# Navegue até a pasta do frontend
cd puc-mvp-pedalboard-frontend

# Inicie o servidor HTTP na porta 3000
python -m http.server 3000
```

Após executar o comando, acesse: http://localhost:3000

## Funcionalidades

- ✅ Criar, editar e deletar plataformas de pedais
- ✅ Adicionar, editar e remover pedais de efeito
- ✅ Interface responsiva e moderna
- ✅ Funciona offline com dados mockados
- ✅ Não requer backend ou servidor

## Dados de Exemplo

O projeto vem com dados de exemplo pré-carregados:
- 2 plataformas de pedais (Rock Clássico e Blues Vintage)
- 3 pedais de efeito (Tube Screamer, Big Muff Pi, Blues Driver)

## Tecnologias

- HTML
- CSS
- JavaScript
