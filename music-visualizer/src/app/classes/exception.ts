export class Exception {
  message: string;
  routeToURL: string;

  constructor() {
    this.message = '';
    this.routeToURL = '';
  }

  displayError(message: string, routeToURL: string): void {

  }
}


