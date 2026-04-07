const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    const cookieDays = Number(process.env.COOKIE_EXPIRE) || 5;
    const options = {
        expires: new Date(
            Date.now() + cookieDays * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
}

module.exports = sendToken;