const express = require("express");
const router = express.Router();

for (const action of ["login", "register"]) {
    router.post("/" + action, async (req, res) => {
        res.set("Cache-Control", "no-store");

        try {
            const response = await fetch(
                "http://127.0.0.1:8080/api/auth/" + action,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(req.body),
                    signal: AbortSignal.timeout(5000)
                }
            );

            if (!response.ok) {
                return res.status(response.status).json({
                    message: action + " failed. Check your details."
                });
            }

            res.status(response.status).json(await response.json());

        } catch (error) {
            res.status(503).json({
                message: "Authentication server unavailable"
            });
        }
    });
}

module.exports = router;
