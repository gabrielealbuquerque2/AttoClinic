import express from 'express'

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
    res.send("API com sucesso!")
})

const PORT = 4000

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})