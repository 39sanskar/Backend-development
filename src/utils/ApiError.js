class ApiError extends Error {
  constructor(
    statusCode = 500,      // Default to 500 if not provided
    message= "Something went wrong",
    errors = [],
    stack = ""
   ) {

     super(message);
     this.statusCode = statusCode;
     this.data = null; // read from documentation
     this.message = message;
     this.success = false;
     this.errors = errors;

     if (stack) {
        this.stack = stack;
     } else {
        Error.captureStackTrace(this, this.constructor);
     }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
      errors: this.errors,
      data: this.data,
    };
  }
}

export { ApiError };