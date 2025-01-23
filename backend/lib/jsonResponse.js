function jsonResponse(status, data) {
    return {
        status,
        data,
    };
}

module.exports = { jsonResponse };
