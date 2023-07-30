class AuthenticationError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
    this.reason = reason;
  }
}

class AuthorizationError extends Error {
  constructor(message, reason) {
    const msg = message || "You are not allowed to do this action";
    super(msg);
    this.name = "AuthorizationError";
    this.statusCode = 403;
    this.reason = reason;
  }
}

class BadRequestError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.reason = reason;
  }
}

class NotFoundError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.reason = reason;
  }
}

export {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
};
