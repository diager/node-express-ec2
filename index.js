import express from 'express';
const app = express();
const port = 5001;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
        res.json('Api running :)')
    }
);
