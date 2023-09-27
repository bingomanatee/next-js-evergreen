


export class ErrorPlus extends Error {

  constructor(msg, public data?: any ) {
    super(msg);
  }

}
