class ApiResponse {
  constructor(
    statusCode = 200,
    data = null,
    message = "Success"
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      success: this.success,
    };
  }
}

export { ApiResponse };

/*

HTTP response status codes

HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:

1. Informational responses (100 - 199)
2. Successful responses (200 - 299)
3. Redirection messages (300 - 399)
4. Client error responses (400 - 499)
5. Server error responses (500 - 599)

*/