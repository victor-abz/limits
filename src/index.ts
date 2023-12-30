import bodyParser from 'body-parser';
import express, { Application, Request, Response } from 'express';

const app: Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

app.post('/send-notification', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  // Handle Notification Handler
  return res.status(200).send({
    message: 'Notification Sent',
  });
});

const PORT = 3000;

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
