/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UserService {
    constructor() {
        this._pool = new Pool();
    }

    async addUser({ username, password, fullname }) {
        await this.checkNewUsername(username);

        const id = `user_${nanoid(32)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await this._pool.query({
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to add user');
        }

        return result.rows[0].id;
    }

    async checkNewUsername(username) {
        const result = await this._pool.query({
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        });

        if (result.rows.length !== 0) {
            throw new InvariantError('Username already exists');
        }
    }

    async verifyUserCredential(username, password) {
        const result = await this._pool.query({
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        });

        if (result.rows.length !== 1) {
            throw new AuthenticationError('Wrong credentials');
        }

        const { id, password: hashedPassword } = result.rows[0];

        if (!await bcrypt.compare(password, hashedPassword)) {
            throw new AuthenticationError('Wrong credentials');
        }

        return id;
    }
}

module.exports = UserService;
