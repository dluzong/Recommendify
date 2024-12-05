const express = require('express')
const app = express()

app.get("/api", (req, res) => {
    res.json({"message" : "testing API call"})
})

app.listen(5001, () => {console.log("Server listening on port 5001")})