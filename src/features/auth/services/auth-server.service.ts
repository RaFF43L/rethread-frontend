import { cookies } from 'next/headers';

export class AuthServerUtils {
  static async getServerToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token'
    );
    return tokenCookie?.value;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getServerToken();
    return !!token;
  }
}
