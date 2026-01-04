const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');
require('dotenv').config();

passport.serializeUser((user, done) => {
    done(null, user.IdUser);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT IdUser, HoTen, Email, VaiTro FROM user WHERE IdUser = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const hoTen = profile.displayName;
        const googleId = profile.id;

        // Check if user exists
        const [existingUsers] = await db.query(
            'SELECT * FROM user WHERE Email = ? OR GoogleId = ?',
            [email, googleId]
        );

        if (existingUsers.length > 0) {
            // User exists, update GoogleId if not set
            const user = existingUsers[0];
            if (!user.GoogleId) {
                await db.query(
                    'UPDATE user SET GoogleId = ? WHERE IdUser = ?',
                    [googleId, user.IdUser]
                );
            }
            return done(null, user);
        }

        // Create new user
        const [result] = await db.query(
            'INSERT INTO user (HoTen, Email, GoogleId, VaiTro, TrangThai) VALUES (?, ?, ?, ?, ?)',
            [hoTen, email, googleId, 'user', 1]
        );

        const [newUser] = await db.query(
            'SELECT IdUser, HoTen, Email, VaiTro FROM user WHERE IdUser = ?',
            [result.insertId]
        );

        done(null, newUser[0]);
    } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
    }
}));

module.exports = passport;
