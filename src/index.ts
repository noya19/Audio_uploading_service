import express, { Request, Response, NextFunction, Express } from 'express';
import * as fs from 'fs';
import { cwd } from 'process';
const app: Express = express();

app.get("*", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, file-name');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})

app.get("/", (req: Request, res: Response) => {
    res.sendFile(cwd() + '/frontend/index.html', (err: Error) => {
        console.error(err);
    })
})

// have to add idempotency i.e each chunk should have a unique identifier
// so that if a chunk is lost the server can ask to retransmit it.
app.post("/upload", (req: Request, res: Response) => {
    const fileName = req.headers["file-name"];
    req.on('data', chunk => {
        fs.appendFileSync(`${cwd() + "/uploads/" + fileName}`, chunk);
        console.log(`received chunk! ${chunk.length}`);
    })
    res.end("Uploaded Successfully")
})

app.listen(3000, () => {
    console.log("Application running on port: 3000")
})
