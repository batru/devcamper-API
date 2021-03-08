class ErrorResponse extends Error {
    constructor(message, statusCode) {
        //constructor of the Error class we are extending and pass in a message
        super(message);
        //create a custom property on this class and pass in our stauscode
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;