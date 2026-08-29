CARRINHO SCANNER V9

- Scanner contínuo de produtos.
- Produto não reconhecido: informe nome + valor antes de entrar na lista.
- Itens do carrinho editáveis até finalizar: nome, quantidade/peso e valor.
- QR reforçado: câmera 1080p, foco/exposição contínuos quando suportados, zoom e lanterna quando disponíveis.
- Fallback por foto do QR; a imagem não é salva pelo app.
- Backend worker.js para contornar CORS na consulta NFC-e PR.
- Conferência automática item a item, divergências detalhadas, resumo e PDF.

NO GITHUB DO APP:
Substitua index.html, sw.js e manifest.webmanifest.

BACKEND:
Publique worker.js em um serviço Worker/Function HTTPS e salve a URL uma única vez na aba Cupom.
