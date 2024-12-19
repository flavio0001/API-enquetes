import http from "http"

const PORT = 8000;
const rotas = {
    "/": "Enquetes",
    "/lista-de-enquetes": "visualizando lista de enquetes",
    "/enquetes-completadas": "Resultado das enquetes finalizadas"

}

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(rotas[req.url]);
});

server.listen(PORT, () => {
    console.log(`Servidor ativado na porta ${PORT}`);
})