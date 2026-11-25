async function requireAuth(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization || !/^Bearer \S+$/i.test(authorization)) {
        return res.status(401).json({
            message: "Login required"
        });
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/me",
            {
                headers: {
                    Authorization: authorization
                },
                signal: AbortSignal.timeout(5000)
            }
        );

        if (response.status === 401 || response.status === 403) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        if (!response.ok) {
            return res.status(503).json({
                message: "Authentication service unavailable"
            });
        }

        const user = await response.json();

        if (typeof user.id !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            return res.status(503).json({
                message: "Invalid authentication response"
            });
        }

        req.auth = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {
        return res.status(503).json({
            message: "Authentication server unavailable"
        });
    }
}

module.exports = requireAuth;
