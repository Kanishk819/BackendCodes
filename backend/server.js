import express from "express";

const app = express();
app.use(express.static('dist'))//Middleware 


// app.get("/", (req, res) => {
//   res.send("Server is Ready");
// });

app.get("/api/jokes", (req,res) => {
    const jokes = [
        {
            id:1,
            title: 'A Joke',
            content: 'This is a Joke',
        },
        {
            id:2,
            title: '2 Joke',
            content: 'This is a 2 Joke',
        },
        {
            id:3,
            title: '3 Joke',
            content: 'This is a 3 Joke',
        },
        {
            id:4,
            title: '4 Joke',
            content: 'This is a 4 Joke',
        },
        {
            id:5,
            title: '5 Joke',
            content: 'This is a 5 Joke',
        },
    ]
    res.send(jokes);
})

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(`Serve at http://localhost:${port}`)
})