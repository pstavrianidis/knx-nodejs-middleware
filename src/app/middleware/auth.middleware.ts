import { verify } from 'jsonwebtoken';

/**
 * * Authorization Verify Token MiddleWare
 */
export default (req: any, res: any, next: any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error: any = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken: any;
    try {
        decodedToken = verify(token, 'somesupersecretsecret');
    } catch (err: any) {
        err.statusCode = 401;
        throw err;
    }
    if (!decodedToken) {
        const error: any = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
};