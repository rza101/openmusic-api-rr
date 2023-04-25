/* eslint-disable camelcase */
const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

// JWT
const generateAccessToken = (payload) => Jwt
    .token
    .generate(payload, process.env.ACCESS_TOKEN_KEY);

const generateRefreshToken = (payload) => Jwt
    .token
    .generate(payload, process.env.REFRESH_TOKEN_KEY);

const verifyRefreshToken = (refreshToken) => {
    try {
        const tokenArtifacts = Jwt.token.decode(refreshToken);

        Jwt.token.verifySignature(tokenArtifacts, process.env.REFRESH_TOKEN_KEY);

        const { payload } = tokenArtifacts.decoded;
        return payload;
    } catch {
        throw new InvariantError('Invalid refresh token');
    }
};

const TokenManager = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
};

// MAPPER
const mapSongsDBToSongModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});

module.exports = {
    mapSongsDBToSongModel,
    TokenManager,
};
