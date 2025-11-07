import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello from Node.js!');
});

router.get('/about', (req, res) => {
    res.send('About page');
});

export default router;