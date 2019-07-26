export class UserModel {
  constructor(public email: string, public id: string, private tokenData: string, private tokenExpirationDate: Date) {}

  get token() {
    if (!this.tokenExpirationDate || new Date() > this.tokenExpirationDate) {
      return null;
    }
    return this.tokenData;
  }
}
