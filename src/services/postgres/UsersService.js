/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

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

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to add user');
        }

        return result.rows[0].id;
    }

    async getUserById(id) {
        const result = await this._pool.query({
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [id],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('User not found');
        }

        return result.rows[0];
    }

    async checkNewUsername(username) {
        const result = await this._pool.query({
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        });

        if (result.rowCount !== 0) {
            throw new InvariantError('Username already exists');
        }
    }

    async verifyUserCredential(username, password) {
        const result = await this._pool.query({
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        });

        if (result.rowCount !== 1) {
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
