import { Status } from "https://deno.land/x/oak@v12.1.0/mod.ts";

interface Code {
  code: number;
}
class NotFoundError extends Error implements Code {
  code: number = Status.NotFound;
  constructor(message: string) {
    super(message);
  }
}
class UnauthorizedError extends Error implements Code {
  code: number = Status.Unauthorized;
  constructor(message: string) {
    super(message);
  }
}
class BadRequestError extends Error implements Code {
  code: number = Status.BadRequest;
  constructor(message: string) {
    super(message);
  }
}
class UnprocessableEntityError extends Error implements Code {
  code: number = Status.UnprocessableEntity;
  constructor(message: string) {
    super(message);
  }
}
export { NotFoundError, UnauthorizedError, BadRequestError, UnprocessableEntityError };
