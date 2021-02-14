import { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

// a way to fix inconsistency with a interface is to extend the original one
// adding stuff that is right for the specific application
// in this case we want o make sure that a request always has body type
// typescript can't know if we are using the body-parser middleware or not
interface RequestWithBody extends Request {
  body: { [key: string]: string | undefined };
}

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session && req.session.loggedIn) {
    next();
    return;
  }

  res.status(403);
  res.send('Not permitted');
};

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (req.session && req.session.loggedIn) {
    res.send(`
      <div>
        <h1>You are logged in </div>
        <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
    <div>
      <h1>You are not logged in </div>
      <a href="/login">Login</a>
  `);
  }
});

router.get('/logout', (req: Request, res: Response) => {
  req.session = undefined;
  res.redirect('/');
});

router.get('/login', (req: Request, res: Response) => {
  res.send(`
  <form method="POST">
    <div>
      <label>Email</label>
      <input name="email" />
    </div>
    <div>
      <label>Password</label>
      <input name="password" type="password" />
    </div>
    <button>Submit</button>
  </form>
  `);
});

const credentials = {
  email: 'email@email.com',
  password: 'password',
};

router.post('/login', (req: RequestWithBody, res: Response) => {
  const { email, password } = req.body;
  const validUser =
    email &&
    password &&
    email === credentials.email &&
    password === credentials.password;

  if (validUser) {
    req.session = { loggedIn: true };
    res.redirect('/');
    res.send();
  } else {
    res.send(`
      <div>
        <h1>Invalid Email and or password</h1>
        <a href="/login">Back</a>
      </div>
    `);
  }
});

router.get('/protected', requireAuth, (req: Request, res: Response) => {
  res.send('Welcome to protected route, logged in user');
});

export { router };
