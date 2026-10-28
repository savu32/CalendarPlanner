import jwt from 'jsonwebtoken';

const parseToken = async (headers) => {
    const authHeader = headers.authorization;
    const authorizationToken = authHeader?.split(' ')[1];
    try {
        const verifiedData = jwt.verify(authorizationToken, process.env.JWT_SECRET);
        return verifiedData;
    } catch (err) {
        return undefined;
    }
}

export default parseToken;