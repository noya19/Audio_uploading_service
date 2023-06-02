import express, { Request, Response, NextFunction, Express } from 'express';
import * as fs from 'fs';
import { cwd } from 'process';


const app: Express = express();


app.use("/", express.static("frontend"));
app.use("/player", express.static("player"));

app.get("*", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, file-name');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})

// have to add idempotency i.e each chunk should have a unique identifier
// so that if a chunk is lost the server can ask to retransmit it.
app.post("/upload", (req: Request, res: Response) => {
    const fileName = req.headers["file-name"] as string;
    req.on('data', chunk => {
        fs.appendFileSync(`${cwd() + "/uploads/" + fileName}`, chunk);
        console.log(`received chunk! ${chunk.length}`);
    });

    res.end("Uploaded Successfully");
})


app.get("/streaming", (req: Request, res: Response) => {
    const range = req.headers.range as string;
    if (!range) {
        res.status(400).send('Require range header');
    }

    const audioPath: string = "uploads/816.9179287432544Surf Curse - Freaks [Official Audio].mp3";
    const audioSize: number = fs.statSync(audioPath).size;

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, audioSize - 1);

    console.log(start, end);

    const contentLength = end - start + 1;
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${audioSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'audio/mp3',
    };

    res.writeHead(206, headers);

    const audioStream: fs.ReadStream = fs.createReadStream(audioPath, { start, end });
    audioStream.pipe(res);

})

app.listen(3000, () => {
    console.log("Application running on port: 3000")
})