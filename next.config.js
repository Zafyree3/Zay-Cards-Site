/** @type {import('next').NextConfig} */

require('dotenv').config()

module.exports = {
    reactStrictMode: true,
    env: {
        API_URL: process.env.API_URL,
        NOTION_KEY: process.env.NOTION_KEY,
        NOTION_CARD_DATABASE_ID: process.env.NOTION_CARD_DATABASE_ID,
    }
}

